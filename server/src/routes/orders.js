const crypto = require("crypto");
const express = require("express");
const multer = require("multer");

const config = require("../config");
const db = require("../db");
const gemini = require("../services/gemini");
const matcher = require("../services/matcher");
const paypal = require("../services/paypal");

// ==================================================
// FAMILY SIDE: prescription -> AI -> cart -> PayPal -> track
// ==================================================

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 6 * 1024 * 1024 },
    fileFilter: (req, file, done) => done(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype))
});

const fail = (status, message, extra = {}) => Object.assign(new Error(message), { status, extra });
const round2 = (value) => Math.round(value * 100) / 100;
const isId = (value) => /^[1-9][0-9]{0,17}$/.test(String(value || ""));

async function ownOrder(req, client = db) {
    if (!isId(req.params.id)) throw fail(404, "Order not found");
    const found = await client.query(
        `SELECT o.*, p.name AS pharmacy_name, p.city AS pharmacy_city, p.address AS pharmacy_address, p.phone AS pharmacy_phone
         FROM orders o JOIN pharmacies p ON p.id = o.pharmacy_id WHERE o.id = $1 AND o.family_user_id = $2`,
        [req.params.id, req.session.user.id]
    );
    if (!found.rows[0]) throw fail(404, "Order not found");
    return found.rows[0];
}

async function addEvent(client, orderId, status, note = null) {
    await client.query("INSERT INTO order_events (order_id, status, note) VALUES ($1, $2, $3)", [orderId, status, note]);
}

async function orderJson(row, { withCode = true } = {}) {
    const [lines, events] = await Promise.all([
        db.query(
            `SELECT l.*, m.name, m.salt, m.pack, f.name AS switched_from_name FROM order_lines l JOIN medicines m ON m.id = l.medicine_id
             LEFT JOIN medicines f ON f.id = l.switched_from_id WHERE l.order_id = $1 ORDER BY l.id`,
            [row.id]
        ),
        db.query("SELECT status, note, at FROM order_events WHERE order_id = $1 ORDER BY id", [row.id])
    ]);
    return {
        id: String(row.id),
        status: row.status,
        patientName: row.patient_name,
        patientPhone: row.patient_phone,
        deliveryAddress: row.delivery_address,
        pharmacy: { id: String(row.pharmacy_id), name: row.pharmacy_name, city: row.pharmacy_city, address: row.pharmacy_address, phone: row.pharmacy_phone },
        totalInr: Number(row.total_inr),
        totalUsd: Number(row.total_usd),
        inrPerUsd: Number(row.inr_per_usd),
        aiSource: row.ai_source,
        ai: row.ai_result,
        refillOn: row.refill_on ? row.refill_on.toISOString().slice(0, 10) : null,
        paypalOrderId: row.paypal_order_id,
        paypalCaptureId: row.paypal_capture_id,
        paypalRefundId: row.paypal_refund_id,
        payerEmail: row.payer_email,
        deliveryCode: withCode ? row.delivery_code : undefined,
        cancelReason: row.cancel_reason,
        createdAt: row.created_at,
        paidAt: row.paid_at,
        deliveredAt: row.delivered_at,
        lines: lines.rows.map((line) => ({
            id: String(line.id), medicineId: String(line.medicine_id), name: line.name, salt: line.salt, pack: line.pack,
            readAs: line.read_as, dosage: line.dosage, packs: line.packs, priceInr: Number(line.price_inr),
            lineInr: Number(line.line_inr), lineUsd: Number(line.line_usd), switchedFrom: line.switched_from_name
        })),
        events: events.rows
    };
}

router.get("/", async (req, res) => {
    const result = await db.query(
        `SELECT o.id, o.status, o.patient_name, o.total_usd, o.total_inr, o.created_at, o.refill_on, p.name AS pharmacy_name
         FROM orders o JOIN pharmacies p ON p.id = o.pharmacy_id WHERE o.family_user_id = $1 ORDER BY o.id DESC LIMIT 100`,
        [req.session.user.id]
    );
    return res.json({
        orders: result.rows.map((row) => ({
            id: String(row.id), status: row.status, patientName: row.patient_name, totalUsd: Number(row.total_usd),
            totalInr: Number(row.total_inr), createdAt: row.created_at, pharmacyName: row.pharmacy_name,
            refillOn: row.refill_on ? row.refill_on.toISOString().slice(0, 10) : null
        }))
    });
});

// 1. Upload the prescription photo: the AI reads it, medicines are matched
//    to the chosen pharmacy's shelf. A draft order is kept with the photo.
router.post("/", upload.single("photo"), async (req, res) => {
    if (!req.file) throw fail(400, "Add a photo of the prescription (JPG, PNG or WebP, up to 6 MB)");
    const pharmacyId = String(req.body?.pharmacyId || "");
    const patientName = String(req.body?.patientName || "").trim().slice(0, 100);
    const patientPhone = String(req.body?.patientPhone || "").replace(/[\s-]/g, "").slice(0, 20);
    const address = String(req.body?.address || "").trim().slice(0, 300);
    if (!isId(pharmacyId)) throw fail(400, "Choose the pharmacy near your family");
    if (patientName.length < 2) throw fail(400, "Enter the patient's name");
    if (!/^\+?[0-9]{10,15}$/.test(patientPhone)) throw fail(400, "Patient's phone: 10 digits, e.g. 9876543210");
    if (address.length < 10) throw fail(400, "Enter the full delivery address in India");
    const pharmacy = await db.query("SELECT id FROM pharmacies WHERE id = $1", [pharmacyId]);
    if (!pharmacy.rows.length) throw fail(400, "Pharmacy not found");

    const read = await gemini.readPrescription(req.file.buffer, req.file.mimetype);
    if (!read.result.readable) {
        throw fail(422, `The AI could not find medicines on this photo. ${read.result.notes || "Try a sharper photo in good light."}`);
    }
    const lines = await matcher.matchAll(pharmacyId, read.result);
    const refillOn = matcher.refillDate(read.result);

    const made = await db.query(
        `INSERT INTO orders (family_user_id, pharmacy_id, patient_name, patient_phone, delivery_address, inr_per_usd,
                             prescription_image, prescription_mime, ai_source, ai_result, refill_on)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [req.session.user.id, pharmacyId, patientName, patientPhone, address, config.inrPerUsd,
            req.file.buffer, req.file.mimetype, read.source, JSON.stringify(read.result), refillOn]
    );
    await addEvent(db, made.rows[0].id, "draft", read.source === "gemini" ? `Prescription read by Gemini (${read.model})` : "Prescription read by the demo reader");

    return res.status(201).json({ orderId: String(made.rows[0].id), aiSource: read.source, model: read.model, ai: read.result, lines, refillOn, inrPerUsd: config.inrPerUsd });
});

// 2. Save the cart: medicines, packs, cheaper-brand switches. Prices and
//    stock always come from the database.
router.put("/:id/lines", async (req, res) => {
    const raw = Array.isArray(req.body?.lines) ? req.body.lines : [];
    if (!raw.length) throw fail(400, "Add at least one medicine");
    if (raw.length > 20) throw fail(400, "Up to 20 medicines in one order");
    const saved = await db.inTransaction(async (client) => {
        const order = await ownOrder(req, client);
        if (order.status !== "draft") throw fail(409, "This order is already paid");
        await client.query("DELETE FROM order_lines WHERE order_id = $1", [order.id]);
        let totalInr = 0;
        let totalUsd = 0;
        for (const line of raw) {
            if (!isId(line.medicineId)) throw fail(400, "A medicine is missing");
            const packs = Number(line.packs);
            if (!Number.isInteger(packs) || packs < 1 || packs > 50) throw fail(400, "Packs: 1 to 50");
            const med = await client.query(
                "SELECT m.*, coalesce(s.packs, 0) AS stock FROM medicines m LEFT JOIN pharmacy_stock s ON s.medicine_id = m.id AND s.pharmacy_id = $2 WHERE m.id = $1",
                [line.medicineId, order.pharmacy_id]
            );
            const medicine = med.rows[0];
            if (!medicine) throw fail(400, "A medicine was not found");
            if (medicine.stock < packs) throw fail(409, `${medicine.name}: the pharmacy has only ${medicine.stock} pack(s)`);
            const lineInr = round2(Number(medicine.price_inr) * packs);
            const lineUsd = round2(lineInr / Number(order.inr_per_usd));
            totalInr += lineInr;
            totalUsd += lineUsd;
            await client.query(
                `INSERT INTO order_lines (order_id, medicine_id, read_as, dosage, packs, price_inr, line_inr, line_usd, switched_from_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [order.id, medicine.id, String(line.readAs || "").slice(0, 200) || null, String(line.dosage || "").slice(0, 120) || null,
                    packs, medicine.price_inr, lineInr, lineUsd, isId(line.switchedFromId) ? line.switchedFromId : null]
            );
        }
        totalUsd = round2(totalUsd);
        if (totalUsd < 0.5) throw fail(400, "The order is too small to pay online (minimum $0.50)");
        await client.query("UPDATE orders SET total_inr = $2, total_usd = $3 WHERE id = $1", [order.id, round2(totalInr), totalUsd]);
        return order.id;
    });
    const order = await ownOrder({ ...req, params: { id: String(saved) } });
    return res.json({ order: await orderJson(order) });
});

// 3. PayPal: create the payment for this order (amount from the database).
router.post("/:id/paypal/create", async (req, res) => {
    if (!paypal.isConfigured()) throw fail(503, "PayPal is not set up on this server (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET)");
    const order = await ownOrder(req);
    if (order.status !== "draft") throw fail(409, "This order is already paid");
    const lines = await db.query(
        "SELECT m.name, l.packs, l.line_usd FROM order_lines l JOIN medicines m ON m.id = l.medicine_id WHERE l.order_id = $1 ORDER BY l.id",
        [order.id]
    );
    if (!lines.rows.length) throw fail(400, "Add medicines first");
    const made = await paypal.createOrder({
        orderId: order.id,
        patientName: order.patient_name,
        // Same order + same cart = same key (safe retries); anything new = a new key.
        requestKey: crypto.createHash("sha256")
            .update(`${new Date(order.created_at).toISOString()}|${lines.rows.map((line) => `${line.name}x${line.packs}`).join(",")}`)
            .digest("hex").slice(0, 24),
        totalUsd: Number(order.total_usd),
        lines: lines.rows.map((line) => ({ name: `${line.name} x ${line.packs}`, lineUsd: Number(line.line_usd) }))
    });
    await db.query("UPDATE orders SET paypal_order_id = $2 WHERE id = $1", [order.id, made.id]);
    return res.json({ paypalOrderId: made.id });
});

// 4. PayPal: capture after the payer approved. Checked against our order.
router.post("/:id/paypal/capture", async (req, res) => {
    const order = await ownOrder(req);
    if (order.status !== "draft") return res.json({ order: await orderJson(order) });
    const paypalOrderId = String(req.body?.paypalOrderId || "");
    if (!paypalOrderId || paypalOrderId !== order.paypal_order_id) throw fail(400, "This payment does not belong to the order");
    const capture = await paypal.captureOrder(paypalOrderId);
    const amountOk = capture.currency === "USD" && Number(capture.amount) === Number(order.total_usd);
    if (capture.status !== "COMPLETED" || capture.captureStatus !== "COMPLETED" || !amountOk || capture.customId !== String(order.id)) {
        throw fail(402, `Payment not completed (${capture.captureStatus || capture.status}). Nothing was charged for this order.`);
    }
    await db.inTransaction(async (client) => {
        const code = String(crypto.randomInt(1000, 10000));
        const updated = await client.query(
            `UPDATE orders SET status = 'paid', paid_at = now(), paypal_capture_id = $2, payer_email = $3, delivery_code = $4
             WHERE id = $1 AND status = 'draft'`,
            [order.id, capture.captureId, capture.payerEmail, code]
        );
        if (!updated.rowCount) return;
        // The medicines are kept aside on the pharmacy shelf.
        await client.query(
            `UPDATE pharmacy_stock s SET packs = GREATEST(s.packs - l.packs, 0)
             FROM order_lines l WHERE l.order_id = $1 AND s.medicine_id = l.medicine_id AND s.pharmacy_id = $2`,
            [order.id, order.pharmacy_id]
        );
        await addEvent(client, order.id, "paid", `Paid $${Number(order.total_usd).toFixed(2)} with PayPal (capture ${capture.captureId})`);
    });
    return res.json({ order: await orderJson(await ownOrder(req)) });
});

// The AI cart again (after a page reload): matched medicines + cheaper options.
router.get("/:id/match", async (req, res) => {
    const order = await ownOrder(req);
    return res.json({ lines: await matcher.matchAll(order.pharmacy_id, order.ai_result), aiSource: order.ai_source, ai: order.ai_result });
});

router.get("/:id", async (req, res) => res.json({ order: await orderJson(await ownOrder(req)) }));

router.get("/:id/photo", async (req, res) => {
    const order = await ownOrder(req);
    if (!order.prescription_image) throw fail(404, "No photo");
    res.set({ "Content-Type": order.prescription_mime, "Cache-Control": "private, no-store" });
    return res.send(order.prescription_image);
});

// Refill in one tap: a new draft with the same medicines, pharmacy and photo.
router.post("/:id/reorder", async (req, res) => {
    const old = await ownOrder(req);
    const newId = await db.inTransaction(async (client) => {
        const made = await client.query(
            `INSERT INTO orders (family_user_id, pharmacy_id, patient_name, patient_phone, delivery_address, inr_per_usd,
                                 prescription_image, prescription_mime, ai_source, ai_result, refill_on)
             SELECT family_user_id, pharmacy_id, patient_name, patient_phone, delivery_address, $2,
                    prescription_image, prescription_mime, ai_source, ai_result,
                    CASE WHEN refill_on IS NULL THEN NULL ELSE current_date + (refill_on - created_at::date) END
             FROM orders WHERE id = $1 RETURNING id`,
            [old.id, config.inrPerUsd]
        );
        await addEvent(client, made.rows[0].id, "draft", `Refill of order #${old.id}`);
        return made.rows[0].id;
    });
    const lines = await db.query("SELECT medicine_id, read_as, dosage, packs, switched_from_id FROM order_lines WHERE order_id = $1 ORDER BY id", [old.id]);
    return res.status(201).json({
        orderId: String(newId),
        lines: lines.rows.map((line) => ({ medicineId: String(line.medicine_id), readAs: line.read_as, dosage: line.dosage, packs: line.packs, switchedFromId: line.switched_from_id ? String(line.switched_from_id) : null }))
    });
});

module.exports = { router, orderJson, addEvent };
