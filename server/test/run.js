// ==================================================
// FULL API TEST — npm test (from server/)
// ==================================================
// Uses its own database (<your db>_test, made fresh each run), a fake PayPal
// on port 4900 and the demo prescription reader, so it never touches real
// money, real keys or your demo data.

const assert = require("assert/strict");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { Client } = require("pg");

require("dotenv").config({ path: path.join(__dirname, "../../.env"), quiet: true });

const APP_PORT = 4100;
const MOCK_PORT = 4900;
const BASE = `http://localhost:${APP_PORT}`;
const SAMPLE = fs.readFileSync(path.join(__dirname, "../../docs/sample-prescription.png"));

const testDbUrl = (() => {
    const url = new URL(process.env.DATABASE_URL);
    url.pathname = `/${decodeURIComponent(url.pathname.slice(1))}_test`;
    return url.toString();
})();

// ---------- fake PayPal ----------
const mock = { orders: new Map(), byRequestId: new Map(), refunds: [], creates: [], wrongAmountOnce: false, failRefundOnce: false };
let mockCount = 0;

function startMock() {
    const server = http.createServer((req, res) => {
        let raw = "";
        req.on("data", (chunk) => { raw += chunk; });
        req.on("end", () => {
            const send = (status, body) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(body)); };
            const body = raw && req.headers["content-type"] === "application/json" ? JSON.parse(raw) : {};
            if (req.url === "/v1/oauth2/token") {
                const ok = req.headers.authorization === `Basic ${Buffer.from("test-client:test-secret").toString("base64")}`;
                return ok ? send(200, { access_token: "mock-token", expires_in: 3600 }) : send(401, { error: "invalid_client" });
            }
            if (req.headers.authorization !== "Bearer mock-token") return send(401, { message: "no token" });
            const requestId = req.headers["paypal-request-id"];
            if (req.method === "POST" && req.url === "/v2/checkout/orders") {
                if (requestId && mock.byRequestId.has(requestId)) return send(200, mock.orders.get(mock.byRequestId.get(requestId)));
                mockCount += 1;
                const order = { id: `MOCKORDER${mockCount}`, status: "CREATED", request: body };
                mock.orders.set(order.id, order);
                if (requestId) mock.byRequestId.set(requestId, order.id);
                mock.creates.push(body);
                return send(201, order);
            }
            const capture = req.url.match(/^\/v2\/checkout\/orders\/([^/]+)\/capture$/);
            if (req.method === "POST" && capture) {
                const order = mock.orders.get(decodeURIComponent(capture[1]));
                if (!order) return send(404, { details: [{ description: "Order not found" }] });
                const unit = order.request.purchase_units[0];
                const value = mock.wrongAmountOnce ? "0.01" : unit.amount.value;
                mock.wrongAmountOnce = false;
                order.status = "COMPLETED";
                order.capture = order.capture || { id: `MOCKCAP${order.id.slice(9)}`, status: "COMPLETED", amount: { currency_code: "USD", value }, custom_id: unit.custom_id };
                return send(201, { id: order.id, status: "COMPLETED", payer: { email_address: "buyer@sandbox.test" }, purchase_units: [{ custom_id: unit.custom_id, payments: { captures: [order.capture] } }] });
            }
            const refund = req.url.match(/^\/v2\/payments\/captures\/([^/]+)\/refund$/);
            if (req.method === "POST" && refund) {
                if (mock.failRefundOnce) { mock.failRefundOnce = false; return send(422, { details: [{ description: "Refund failed (test)" }] }); }
                mock.refunds.push(decodeURIComponent(refund[1]));
                return send(201, { id: `MOCKREFUND${mock.refunds.length}`, status: "COMPLETED" });
            }
            return send(404, { message: "mock: unknown route" });
        });
    });
    return new Promise((resolve) => server.listen(MOCK_PORT, () => resolve(server)));
}

// ---------- helpers ----------
class Session {
    constructor() { this.cookie = ""; }
    async call(method, url, body) {
        const options = { method, headers: { cookie: this.cookie } };
        if (body instanceof FormData) options.body = body;
        else if (body !== undefined) { options.headers["Content-Type"] = "application/json"; options.body = JSON.stringify(body); }
        const response = await fetch(BASE + url, options);
        const set = response.headers.get("set-cookie");
        if (set) this.cookie = set.split(";")[0];
        const type = response.headers.get("content-type") || "";
        const data = type.includes("json") ? await response.json() : await response.arrayBuffer();
        return { status: response.status, data, type, headers: response.headers };
    }
    get(url) { return this.call("GET", url); }
    post(url, body) { return this.call("POST", url, body ?? {}); }
    put(url, body) { return this.call("PUT", url, body); }
    async login(email) {
        const result = await this.post("/api/auth/login", { email, password: "Demo@1234" });
        assert.equal(result.status, 200, `login ${email}`);
        return this;
    }
}

function orderForm(pharmacyId, extra = {}) {
    const form = new FormData();
    const fields = { pharmacyId, patientName: "Kantaben Patel", patientPhone: "9876543210", address: "12 Shanti Nagar, Nadiad, Gujarat 387001", ...extra };
    Object.entries(fields).forEach(([key, value]) => form.append(key, value));
    if (!("noPhoto" in extra)) form.append("photo", new Blob([SAMPLE], { type: "image/png" }), "rx.png");
    return form;
}

// Cart like the screen makes it: out-of-stock -> same-salt brand.
const cartFrom = (lines) => lines.filter((line) => line.medicine && (line.medicine.stock > 0 || line.cheaper)).map((line) => {
    const use = line.medicine.stock < 1 && line.cheaper ? line.cheaper : line.medicine;
    return { medicineId: use.id, packs: line.packs, readAs: line.read.name, dosage: line.read.dosage, switchedFromId: use === line.medicine ? null : line.medicine.id };
});

async function stockOf(db, pharmacyId, medicineId) {
    return (await db.query("SELECT packs FROM pharmacy_stock WHERE pharmacy_id = $1 AND medicine_id = $2", [pharmacyId, medicineId])).rows[0].packs;
}

const results = [];
async function test(name, fn) {
    try {
        await fn();
        results.push([true, name]);
        console.log(`  PASS  ${name}`);
    } catch (error) {
        results.push([false, name]);
        console.log(`  FAIL  ${name}\n        ${error.message.split("\n").join("\n        ")}`);
    }
}

// ---------- run ----------
async function main() {
    console.log("Preparing a fresh test database…");
    const admin = new URL(testDbUrl);
    const testName = admin.pathname.slice(1);
    admin.pathname = "/postgres";
    const adminClient = new Client({ connectionString: admin.toString() });
    await adminClient.connect();
    await adminClient.query(`DROP DATABASE IF EXISTS "${testName}" WITH (FORCE)`);
    await adminClient.end();

    const env = {
        ...process.env, DATABASE_URL: testDbUrl, PORT: String(APP_PORT), PAYPAL_API_BASE: `http://localhost:${MOCK_PORT}`,
        PAYPAL_CLIENT_ID: "test-client", PAYPAL_CLIENT_SECRET: "test-secret", GEMINI_API_KEY: "", INR_PER_USD: "84"
    };
    const setup = spawnSync(process.execPath, ["src/setupDb.js"], { cwd: path.join(__dirname, ".."), env, encoding: "utf8" });
    if (setup.status !== 0) throw new Error(`setupDb failed:\n${setup.stdout}\n${setup.stderr}`);

    const mockServer = await startMock();
    const app = spawn(process.execPath, ["src/index.js"], { cwd: path.join(__dirname, ".."), env, stdio: ["ignore", "pipe", "pipe"] });
    let appLog = "";
    app.stdout.on("data", (chunk) => { appLog += chunk; });
    app.stderr.on("data", (chunk) => { appLog += chunk; });
    await new Promise((resolve, reject) => {
        const started = Date.now();
        const wait = setInterval(() => {
            if (appLog.includes("is running")) { clearInterval(wait); resolve(); }
            if (Date.now() - started > 15000) { clearInterval(wait); reject(new Error(`App did not start:\n${appLog}`)); }
        }, 100);
    });
    const db = new Client({ connectionString: testDbUrl });
    await db.connect();

    try {
        const family = new Session();
        const pharmacy = new Session();
        const pharmacy2 = new Session();
        const stranger = new Session();
        let pharmacies;
        let order;
        let match;

        console.log("\nAccounts and access");
        await test("config says PayPal ready and AI is the demo reader", async () => {
            const { data } = await family.get("/api/config");
            assert.equal(data.paypalReady, true);
            assert.equal(data.aiMode, "demo");
            assert.equal(data.paypalClientId, "test-client");
        });
        await test("screens are served with a CSP that allows PayPal", async () => {
            const page = await family.get("/order/1");
            assert.equal(page.status, 200);
            assert.match(page.type, /html/);
            assert.match(page.headers.get("content-security-policy"), /paypal\.com/);
        });
        await test("signed-out users get 401 on orders", async () => {
            assert.equal((await new Session().get("/api/orders")).status, 401);
        });
        await test("wrong password is refused", async () => {
            assert.equal((await new Session().post("/api/auth/login", { email: "family@demo.test", password: "nope" })).status, 401);
        });
        await test("register a new family account, duplicate email refused", async () => {
            const made = await stranger.post("/api/auth/register", { name: "Asha Mehta", email: "asha@example.com", password: "Secret123", country: "UK" });
            assert.equal(made.status, 201);
            assert.equal(made.data.user.role, "family");
            assert.equal((await new Session().post("/api/auth/register", { name: "X Y", email: "asha@example.com", password: "Secret123" })).status, 409);
            assert.equal((await new Session().post("/api/auth/register", { name: "X Y", email: "bad", password: "Secret123" })).status, 400);
            assert.equal((await new Session().post("/api/auth/register", { name: "X Y", email: "a@b.co", password: "short" })).status, 400);
        });
        await family.login("family@demo.test");
        await pharmacy.login("pharmacy@demo.test");
        await pharmacy2.login("pharmacy2@demo.test");
        await test("a pharmacy cannot use family routes and a family cannot use pharmacy routes", async () => {
            assert.equal((await pharmacy.get("/api/orders")).status, 403);
            assert.equal((await family.get("/api/pharmacy/orders")).status, 403);
        });

        console.log("\nPrescription -> AI -> cart");
        pharmacies = (await family.get("/api/pharmacies")).data.pharmacies;
        const shop = pharmacies.find((item) => item.name === "Shree Medical Store");
        const shop2 = pharmacies.find((item) => item.name !== "Shree Medical Store");
        await test("order form checks: photo, phone, address, pharmacy", async () => {
            assert.equal((await family.post("/api/orders", orderForm(shop.id, { noPhoto: 1 }))).status, 400);
            assert.equal((await family.post("/api/orders", orderForm(shop.id, { patientPhone: "123" }))).status, 400);
            assert.equal((await family.post("/api/orders", orderForm(shop.id, { address: "short" }))).status, 400);
            assert.equal((await family.post("/api/orders", orderForm("999999"))).status, 400);
            const text = new FormData();
            Object.entries({ pharmacyId: shop.id, patientName: "K P", patientPhone: "9876543210", address: "12 Shanti Nagar, Nadiad" }).forEach(([k, v]) => text.append(k, v));
            text.append("photo", new Blob(["hello"], { type: "text/plain" }), "a.txt");
            assert.equal((await family.post("/api/orders", text)).status, 400);
        });
        await test("a photo over 6 MB gets a clear message", async () => {
            const big = orderForm(shop.id, { noPhoto: 1 });
            big.append("photo", new Blob([Buffer.alloc(6 * 1024 * 1024 + 10)], { type: "image/png" }), "big.png");
            const result = await family.post("/api/orders", big);
            assert.equal(result.status, 413);
            assert.match(result.data.message, /6 MB/);
        });
        await test("the AI reads the sample: 4 medicines matched with packs and cheaper same-salt brands", async () => {
            const made = await family.post("/api/orders", orderForm(shop.id));
            assert.equal(made.status, 201, JSON.stringify(made.data));
            match = made.data.lines;
            assert.equal(match.length, 4);
            assert.deepEqual(match.map((line) => line.medicine.name), ["Crocin 650 Tablet", "Azithral 500 Tablet", "Pantocid 40 Tablet", "Telma 40 Tablet"]);
            assert.deepEqual(match.map((line) => line.packs), [1, 1, 1, 2]);
            assert.ok(match.every((line) => line.cheaper && line.cheaper.priceInr < line.medicine.priceInr), "each has a cheaper brand");
            assert.ok(match.every((line) => line.cheaper.salt.toLowerCase() === line.medicine.salt.toLowerCase()), "same salt");
            assert.ok(made.data.refillOn, "refill date set");
            order = { id: made.data.orderId };
        });
        await test("the AI cart can be loaded again after a reload (/match)", async () => {
            const again = await family.get(`/api/orders/${order.id}/match`);
            assert.equal(again.status, 200);
            assert.equal(again.data.lines.length, 4);
        });
        await test("cart refuses: no lines, packs 0, more packs than the shelf has", async () => {
            assert.equal((await family.put(`/api/orders/${order.id}/lines`, { lines: [] })).status, 400);
            assert.equal((await family.put(`/api/orders/${order.id}/lines`, { lines: [{ medicineId: match[0].medicine.id, packs: 0 }] })).status, 400);
            const tooMany = await family.put(`/api/orders/${order.id}/lines`, { lines: [{ medicineId: match[0].medicine.id, packs: match[0].medicine.stock + 1 }] });
            assert.ok([400, 409].includes(tooMany.status));
            const empty = match.find((line) => line.medicine.stock < 1);
            if (empty) assert.equal((await family.put(`/api/orders/${order.id}/lines`, { lines: [{ medicineId: empty.medicine.id, packs: 1 }] })).status, 409);
        });
        await test("cart saved: prices come from the database, totals add up", async () => {
            const lines = cartFrom(match);
            lines[0].priceInr = 0.01; // the browser cannot set prices
            const saved = await family.put(`/api/orders/${order.id}/lines`, { lines });
            assert.equal(saved.status, 200, JSON.stringify(saved.data));
            order = saved.data.order;
            const sumInr = order.lines.reduce((sum, line) => sum + line.lineInr, 0);
            const sumUsd = order.lines.reduce((sum, line) => sum + line.lineUsd, 0);
            assert.ok(Math.abs(sumInr - order.totalInr) < 0.001);
            assert.ok(Math.abs(sumUsd - order.totalUsd) < 0.001);
            for (const line of order.lines) assert.ok(Math.abs(line.lineInr - line.priceInr * line.packs) < 0.001);
            assert.ok(order.totalUsd > 0.5);
        });
        await test("another family cannot see, change or pay this order", async () => {
            assert.equal((await stranger.get(`/api/orders/${order.id}`)).status, 404);
            assert.equal((await stranger.get(`/api/orders/${order.id}/photo`)).status, 404);
            assert.equal((await stranger.put(`/api/orders/${order.id}/lines`, { lines: cartFrom(match) })).status, 404);
            assert.equal((await stranger.post(`/api/orders/${order.id}/paypal/create`)).status, 404);
            assert.equal((await stranger.get("/api/orders")).data.orders.length, 0);
        });
        await test("a draft (unpaid) order is invisible to the pharmacy", async () => {
            assert.equal((await pharmacy.get(`/api/pharmacy/orders/${order.id}`)).status, 404);
        });
        await test("bad order ids give 404, not a crash", async () => {
            assert.equal((await family.get("/api/orders/abc")).status, 404);
            assert.equal((await family.get("/api/orders/99999999")).status, 404);
            assert.equal((await family.get("/api/nothing")).status, 404);
        });

        console.log("\nPayPal");
        let paypalOrderId;
        const before = {};
        await test("PayPal order is created with the database amount, items and our order id", async () => {
            for (const line of order.lines) before[line.medicineId] = await stockOf(db, shop.id, line.medicineId);
            const made = await family.post(`/api/orders/${order.id}/paypal/create`);
            assert.equal(made.status, 200, JSON.stringify(made.data));
            paypalOrderId = made.data.paypalOrderId;
            const sent = mock.creates.at(-1).purchase_units[0];
            assert.equal(sent.amount.value, order.totalUsd.toFixed(2));
            assert.equal(sent.amount.currency_code, "USD");
            assert.equal(sent.custom_id, order.id);
            const items = sent.items.reduce((sum, item) => sum + Number(item.unit_amount.value), 0);
            assert.equal(items.toFixed(2), sent.amount.breakdown.item_total.value);
        });
        await test("capture with someone else's PayPal id is refused", async () => {
            assert.equal((await family.post(`/api/orders/${order.id}/paypal/capture`, { paypalOrderId: "FAKE123" })).status, 400);
        });
        await test("capture: order paid, 4-digit delivery code, medicines kept aside", async () => {
            const paid = await family.post(`/api/orders/${order.id}/paypal/capture`, { paypalOrderId });
            assert.equal(paid.status, 200, JSON.stringify(paid.data));
            order = paid.data.order;
            assert.equal(order.status, "paid");
            assert.match(order.deliveryCode, /^\d{4}$/);
            assert.ok(order.paypalCaptureId);
            assert.equal(order.payerEmail, "buyer@sandbox.test");
            for (const line of order.lines) assert.equal(await stockOf(db, shop.id, line.medicineId), before[line.medicineId] - line.packs);
        });
        await test("capturing twice changes nothing (no double stock cut)", async () => {
            const again = await family.post(`/api/orders/${order.id}/paypal/capture`, { paypalOrderId });
            assert.equal(again.status, 200);
            assert.equal(again.data.order.deliveryCode, order.deliveryCode);
            for (const line of order.lines) assert.equal(await stockOf(db, shop.id, line.medicineId), before[line.medicineId] - line.packs);
        });
        await test("a paid order cannot be changed or paid again", async () => {
            assert.equal((await family.put(`/api/orders/${order.id}/lines`, { lines: cartFrom(match) })).status, 409);
            assert.equal((await family.post(`/api/orders/${order.id}/paypal/create`)).status, 409);
        });
        await test("if PayPal captures a different amount the order is NOT marked paid", async () => {
            const made = await family.post("/api/orders", orderForm(shop.id));
            const id = made.data.orderId;
            const put = await family.put(`/api/orders/${id}/lines`, { lines: cartFrom(made.data.lines) });
            assert.equal(put.status, 200, JSON.stringify(put.data));
            const pp = await family.post(`/api/orders/${id}/paypal/create`);
            assert.equal(pp.status, 200, JSON.stringify(pp.data));
            mock.wrongAmountOnce = true;
            const capture = await family.post(`/api/orders/${id}/paypal/capture`, { paypalOrderId: pp.data.paypalOrderId });
            assert.equal(capture.status, 402);
            assert.equal((await family.get(`/api/orders/${id}`)).data.order.status, "draft");
        });

        console.log("\nPharmacy: accept -> pack -> deliver with code");
        await test("the paid order shows in the pharmacy's to-do list, not in the other pharmacy", async () => {
            const list = await pharmacy.get("/api/pharmacy/orders");
            assert.ok(list.data.orders.some((item) => item.id === order.id));
            assert.equal((await pharmacy2.get(`/api/pharmacy/orders/${order.id}`)).status, 404);
            assert.ok(!(await pharmacy2.get("/api/pharmacy/orders")).data.orders.some((item) => item.id === order.id));
        });
        await test("the pharmacy sees the photo and lines but never the delivery code", async () => {
            const seen = await pharmacy.get(`/api/pharmacy/orders/${order.id}`);
            assert.equal(seen.status, 200);
            assert.equal(seen.data.order.deliveryCode, undefined);
            assert.equal(seen.data.order.lines.length, order.lines.length);
            const photo = await pharmacy.get(`/api/pharmacy/orders/${order.id}/photo`);
            assert.equal(photo.status, 200);
            assert.equal(photo.type, "image/png");
        });
        await test("cannot deliver before 'out for delivery'", async () => {
            assert.equal((await pharmacy.post(`/api/pharmacy/orders/${order.id}/deliver`, { code: order.deliveryCode })).status, 409);
        });
        await test("accept -> packed -> out for delivery, then 'next' stops", async () => {
            for (const status of ["accepted", "packed", "out_for_delivery"]) {
                const step = await pharmacy.post(`/api/pharmacy/orders/${order.id}/next`);
                assert.equal(step.status, 200);
                assert.equal(step.data.order.status, status);
            }
            assert.equal((await pharmacy.post(`/api/pharmacy/orders/${order.id}/next`)).status, 409);
            assert.equal((await family.get(`/api/orders/${order.id}`)).data.order.status, "out_for_delivery");
        });
        await test("no refund once it is out for delivery", async () => {
            assert.equal((await pharmacy.post(`/api/pharmacy/orders/${order.id}/cannot-supply`, { reason: "Changed mind" })).status, 409);
        });
        await test("wrong delivery code is refused, right code delivers", async () => {
            const wrong = order.deliveryCode === "1234" ? "4321" : "1234";
            assert.equal((await pharmacy.post(`/api/pharmacy/orders/${order.id}/deliver`, { code: wrong })).status, 400);
            assert.equal((await pharmacy.post(`/api/pharmacy/orders/${order.id}/deliver`, { code: "12a4" })).status, 400);
            const done = await pharmacy.post(`/api/pharmacy/orders/${order.id}/deliver`, { code: order.deliveryCode });
            assert.equal(done.status, 200);
            assert.equal(done.data.order.status, "delivered");
            const mine = (await family.get(`/api/orders/${order.id}`)).data.order;
            assert.equal(mine.status, "delivered");
            assert.deepEqual(mine.events.map((event) => event.status), ["draft", "paid", "accepted", "packed", "out_for_delivery", "delivered"]);
        });
        await test("delivered order moves to the pharmacy's finished list", async () => {
            assert.ok((await pharmacy.get("/api/pharmacy/orders?view=done")).data.orders.some((item) => item.id === order.id));
            assert.ok(!(await pharmacy.get("/api/pharmacy/orders")).data.orders.some((item) => item.id === order.id));
        });

        console.log("\nRefill and refund");
        await test("'Order again' makes a new draft with the same medicines", async () => {
            const again = await family.post(`/api/orders/${order.id}/reorder`);
            assert.equal(again.status, 201);
            assert.equal(again.data.lines.length, order.lines.length);
            const saved = await family.put(`/api/orders/${again.data.orderId}/lines`, { lines: again.data.lines });
            assert.equal(saved.status, 200, JSON.stringify(saved.data));
            assert.equal(saved.data.order.status, "draft");
            assert.equal(saved.data.order.totalUsd, order.totalUsd);
            assert.ok(saved.data.order.refillOn);
        });
        await test("can't supply: full PayPal refund, medicines back on the shelf, family sees why", async () => {
            const made = await family.post("/api/orders", orderForm(shop2.id));
            const id = made.data.orderId;
            const lines = cartFrom(made.data.lines);
            assert.equal(made.status, 201, JSON.stringify(made.data));
            const put = await family.put(`/api/orders/${id}/lines`, { lines });
            assert.equal(put.status, 200, JSON.stringify(put.data));
            const stockBefore = {};
            for (const line of lines) stockBefore[line.medicineId] = await stockOf(db, shop2.id, line.medicineId);
            const pp = await family.post(`/api/orders/${id}/paypal/create`);
            assert.equal(pp.status, 200, JSON.stringify(pp.data));
            const captured = await family.post(`/api/orders/${id}/paypal/capture`, { paypalOrderId: pp.data.paypalOrderId });
            assert.equal(captured.status, 200, JSON.stringify(captured.data));
            const paid = captured.data.order;
            assert.equal(paid.status, "paid");
            assert.equal((await pharmacy2.post(`/api/pharmacy/orders/${id}/cannot-supply`, { reason: "x" })).status, 400);
            mock.failRefundOnce = true;
            const failed = await pharmacy2.post(`/api/pharmacy/orders/${id}/cannot-supply`, { reason: "Telma 40 out of stock" });
            assert.equal(failed.status, 502);
            assert.equal((await family.get(`/api/orders/${id}`)).data.order.status, "paid", "still paid if PayPal refund failed");
            const refunded = await pharmacy2.post(`/api/pharmacy/orders/${id}/cannot-supply`, { reason: "Telma 40 out of stock" });
            assert.equal(refunded.status, 200, JSON.stringify(refunded.data));
            assert.equal(refunded.data.order.status, "refunded");
            assert.equal(mock.refunds.at(-1), paid.paypalCaptureId);
            for (const line of lines) assert.equal(await stockOf(db, shop2.id, line.medicineId), stockBefore[line.medicineId]);
            const seen = (await family.get(`/api/orders/${id}`)).data.order;
            assert.equal(seen.status, "refunded");
            assert.equal(seen.cancelReason, "Telma 40 out of stock");
            assert.ok(seen.paypalRefundId);
            assert.equal((await pharmacy2.post(`/api/pharmacy/orders/${id}/cannot-supply`, { reason: "again" })).status, 409);
        });
        await test("family order list shows all orders with status", async () => {
            const list = (await family.get("/api/orders")).data.orders;
            assert.ok(list.length >= 4);
            assert.ok(list.some((item) => item.status === "delivered"));
            assert.ok(list.some((item) => item.status === "draft"));
        });
        await test("sign out ends the session", async () => {
            const temp = await new Session().login("family@demo.test");
            await temp.post("/api/auth/logout");
            assert.equal((await temp.get("/api/orders")).status, 401);
        });
    } finally {
        await db.end();
        app.kill();
        mockServer.close();
    }

    console.log("\nGemini reader (fake Google server)");
    await geminiTests();

    const failed = results.filter(([ok]) => !ok);
    console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
    process.exit(failed.length ? 1 : 0);
}

// Busy / retired models fall back to the next one; answers are cleaned.
async function geminiTests() {
    const calls = [];
    const server = http.createServer((req, res) => {
        let raw = "";
        req.on("data", (chunk) => { raw += chunk; });
        req.on("end", () => {
            calls.push(req.url);
            res.writeHead(req.url.includes("models?") ? 200 : req.url.includes("gemini-flash-latest") ? 503 : 200, { "Content-Type": "application/json" });
            if (req.url.includes("models?")) return res.end(JSON.stringify({ models: [{ name: "models/gemini-flash-latest", supportedGenerationMethods: ["generateContent"] }] }));
            if (req.url.includes("gemini-flash-latest")) return res.end(JSON.stringify({ error: { message: "high demand" } }));
            const text = JSON.stringify({ readable: true, medicines: [{ name: "Tab. Crocin", strength: "650 mg", dosage: "1-0-1", days: "5 days" }] });
            return res.end(JSON.stringify({ candidates: [{ content: { parts: [{ text: `\`\`\`json\n${text}\n\`\`\`` }] } }] }));
        });
    });
    await new Promise((resolve) => server.listen(4901, resolve));
    process.env.GEMINI_API_KEY = "fake-key";
    process.env.GEMINI_API_BASE = "http://localhost:4901";
    process.env.GEMINI_MODEL = "gemini-flash-latest";
    const gemini = require("../src/services/gemini");
    try {
        await test("a busy model falls back to the next one and the answer is cleaned", async () => {
            const read = await gemini.readPrescription(SAMPLE, "image/png");
            assert.equal(read.source, "gemini");
            assert.equal(read.model, "gemini-3-flash-preview");
            assert.deepEqual(read.result.medicines.map((item) => [item.name, item.days]), [["Crocin", 5]]);
            assert.ok(calls.some((url) => url.includes("gemini-flash-latest:generateContent")));
        });
        await test("an unreadable AI answer gives a clear message", async () => {
            assert.throws(() => gemini.cleanResult("not json"), /could not be read/);
            assert.equal(gemini.cleanResult('{"medicines":[]}').readable, false);
        });
    } finally {
        server.close();
    }
}

main().catch((error) => { console.error(error); process.exit(1); });
