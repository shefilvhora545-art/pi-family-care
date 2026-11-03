const express = require("express");

const db = require("../db");
const paypal = require("../services/paypal");
const { orderJson, addEvent } = require("./orders");

// ==================================================
// PHARMACY SIDE: paid orders -> accept -> pack -> out for delivery
// -> delivered (with the family's 4-digit code). Can't supply -> refund.
// ==================================================

const router = express.Router();

const fail = (status, message) => Object.assign(new Error(message), { status });
const isId = (value) => /^[1-9][0-9]{0,17}$/.test(String(value || ""));

const NEXT = { paid: "accepted", accepted: "packed", packed: "out_for_delivery" };

async function myPharmacy(req) {
    const found = await db.query("SELECT * FROM pharmacies WHERE user_id = $1", [req.session.user.id]);
    if (!found.rows[0]) throw fail(403, "No pharmacy for this account");
    return found.rows[0];
}

async function myOrder(req, client = db) {
    if (!isId(req.params.id)) throw fail(404, "Order not found");
    const pharmacy = await myPharmacy(req);
    const found = await client.query(
        `SELECT o.*, p.name AS pharmacy_name, p.city AS pharmacy_city, p.address AS pharmacy_address, p.phone AS pharmacy_phone
         FROM orders o JOIN pharmacies p ON p.id = o.pharmacy_id WHERE o.id = $1 AND o.pharmacy_id = $2 AND o.status <> 'draft'
         ${client === db ? "" : "FOR UPDATE OF o"}`,
        [req.params.id, pharmacy.id]
    );
    if (!found.rows[0]) throw fail(404, "Order not found");
    return found.rows[0];
}

router.get("/me", async (req, res) => {
    const pharmacy = await myPharmacy(req);
    return res.json({ pharmacy: { id: String(pharmacy.id), name: pharmacy.name, city: pharmacy.city, address: pharmacy.address, licence: pharmacy.drug_licence } });
});

router.get("/orders", async (req, res) => {
    const pharmacy = await myPharmacy(req);
    const open = req.query.view !== "done";
    const result = await db.query(
        `SELECT o.id, o.status, o.patient_name, o.delivery_address, o.total_inr, o.total_usd, o.paid_at,
                (SELECT count(*) FROM order_lines l WHERE l.order_id = o.id)::int AS lines
         FROM orders o WHERE o.pharmacy_id = $1 AND o.status <> 'draft'
           AND (CASE WHEN $2 THEN o.status IN ('paid', 'accepted', 'packed', 'out_for_delivery') ELSE o.status IN ('delivered', 'refunded') END)
         ORDER BY o.paid_at ${open ? "ASC" : "DESC"} LIMIT 200`,
        [pharmacy.id, open]
    );
    return res.json({
        orders: result.rows.map((row) => ({
            id: String(row.id), status: row.status, patientName: row.patient_name, address: row.delivery_address,
            totalInr: Number(row.total_inr), totalUsd: Number(row.total_usd), paidAt: row.paid_at, lines: row.lines
        }))
    });
});

// The pharmacy never sees the delivery code (the family gives it at the door).
router.get("/orders/:id", async (req, res) => res.json({ order: await orderJson(await myOrder(req), { withCode: false }) }));

router.get("/orders/:id/photo", async (req, res) => {
    const order = await myOrder(req);
    res.set({ "Content-Type": order.prescription_mime, "Cache-Control": "private, no-store" });
    return res.send(order.prescription_image);
});

router.post("/orders/:id/next", async (req, res) => {
    await db.inTransaction(async (client) => {
        const order = await myOrder(req, client);
        const next = NEXT[order.status];
        if (!next) throw fail(409, order.status === "out_for_delivery" ? "Type the delivery code to finish" : `This order is ${order.status}`);
        await client.query("UPDATE orders SET status = $2 WHERE id = $1", [order.id, next]);
        await addEvent(client, order.id, next, { accepted: "The pharmacy accepted the order", packed: "Medicines packed", out_for_delivery: "On the way to the patient" }[next]);
    });
    return res.json({ order: await orderJson(await myOrder(req), { withCode: false }) });
});

router.post("/orders/:id/deliver", async (req, res) => {
    const code = String(req.body?.code || "").trim();
    await db.inTransaction(async (client) => {
        const order = await myOrder(req, client);
        if (order.status !== "out_for_delivery") throw fail(409, "Mark it 'out for delivery' first");
        if (!/^\d{4}$/.test(code) || code !== order.delivery_code) throw fail(400, "Wrong delivery code. Ask the patient for the 4-digit code.");
        await client.query("UPDATE orders SET status = 'delivered', delivered_at = now() WHERE id = $1", [order.id]);
        await addEvent(client, order.id, "delivered", "Delivered: code checked at the door");
    });
    return res.json({ order: await orderJson(await myOrder(req), { withCode: false }) });
});

// Can't supply: full PayPal refund, medicines back on the shelf.
router.post("/orders/:id/cannot-supply", async (req, res) => {
    const reason = String(req.body?.reason || "").trim().slice(0, 200);
    if (reason.length < 3) throw fail(400, "Write why it can't be supplied (the family sees this)");
    const order = await myOrder(req);
    if (!["paid", "accepted", "packed"].includes(order.status)) throw fail(409, `This order is ${order.status}`);
    const refund = await paypal.refundCapture(order.paypal_capture_id, order.id);
    await db.inTransaction(async (client) => {
        const locked = await myOrder(req, client);
        if (locked.status === "refunded") return;
        await client.query(
            "UPDATE orders SET status = 'refunded', paypal_refund_id = $2, cancel_reason = $3 WHERE id = $1",
            [order.id, refund.refundId, reason]
        );
        await client.query(
            `UPDATE pharmacy_stock s SET packs = s.packs + l.packs FROM order_lines l
             WHERE l.order_id = $1 AND s.medicine_id = l.medicine_id AND s.pharmacy_id = $2`,
            [order.id, order.pharmacy_id]
        );
        await addEvent(client, order.id, "refunded", `Refunded in full with PayPal (${refund.refundId}): ${reason}`);
    });
    return res.json({ order: await orderJson(await myOrder(req), { withCode: false }) });
});

module.exports = router;
