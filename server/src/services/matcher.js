const db = require("../db");

// ==================================================
// MATCH WHAT THE AI READ TO REAL MEDICINES
// ==================================================
// For each line the AI read, find the best medicine in the list (name +
// strength), the pharmacy's stock for it, and a cheaper brand with the
// SAME salt that the pharmacy has (the family can switch with one tap).

const cleanText = (text) => String(text || "").toLowerCase().replace(/[^a-z0-9. ]/g, " ").replace(/\s+/g, " ").trim();

// Packs needed: tablets per day x days, rounded up to whole strips.
function packsNeeded(item, pack) {
    const perDay = String(item.dosage || "").match(/^\s*(\d)\s*-\s*(\d)\s*-\s*(\d)/);
    const perPack = Number((String(pack || "").match(/(\d+)\s*(tablet|capsule)/i) || [])[1]);
    if (!perDay || !item.days || !perPack) return 1;
    const daily = Number(perDay[1]) + Number(perDay[2]) + Number(perDay[3]);
    if (!daily) return 1;
    return Math.max(1, Math.min(50, Math.ceil((daily * item.days) / perPack)));
}

async function bestMatch(item) {
    const strengthNumber = (String(item.strength || "").match(/\d+(\.\d+)?/) || [""])[0];
    const query = cleanText(`${item.name} ${strengthNumber}`);
    const name = cleanText(item.name);
    if (!name) return null;
    const result = await db.query(
        `
        SELECT m.*, similarity(lower(m.name), $1) AS score
        FROM medicines m
        WHERE lower(m.name) % $1 OR lower(m.name) LIKE $2 || '%' OR lower(m.salt) LIKE '%' || $3 || '%'
        ORDER BY
            (lower(m.name) LIKE $2 || '%') DESC,
            ($4 <> '' AND m.name ~ ('(^|[^0-9.])' || $4 || '([^0-9.]|$)')) DESC,
            similarity(lower(m.name), $1) DESC
        LIMIT 1
        `,
        [query, name.split(" ")[0], name, strengthNumber]
    );
    return result.rows[0] || null;
}

async function stockOf(pharmacyId, medicineId) {
    const result = await db.query("SELECT packs FROM pharmacy_stock WHERE pharmacy_id = $1 AND medicine_id = $2", [pharmacyId, medicineId]);
    return result.rows[0]?.packs || 0;
}

async function cheaperSameSalt(pharmacyId, medicine) {
    if (!medicine.salt) return null;
    const result = await db.query(
        `
        SELECT m.*, s.packs AS stock FROM medicines m JOIN pharmacy_stock s ON s.medicine_id = m.id AND s.pharmacy_id = $1
        WHERE lower(m.salt) = lower($2) AND m.id <> $3 AND m.price_inr < $4 AND s.packs > 0
        ORDER BY m.price_inr, m.name LIMIT 1
        `,
        [pharmacyId, medicine.salt, medicine.id, medicine.price_inr]
    );
    return result.rows[0] || null;
}

const medicineJson = (row, stock) => ({
    id: String(row.id), name: row.name, salt: row.salt, maker: row.maker, pack: row.pack,
    priceInr: Number(row.price_inr), prescriptionRequired: row.prescription_required, stock
});

// Returns one entry per AI line: { read, medicine | null, cheaper | null, packs }.
async function matchAll(pharmacyId, aiResult) {
    const lines = [];
    for (const item of aiResult.medicines) {
        const found = await bestMatch(item);
        if (!found) {
            lines.push({ read: item, medicine: null, cheaper: null, packs: 0 });
            continue;
        }
        const cheaper = await cheaperSameSalt(pharmacyId, found);
        lines.push({
            read: item,
            medicine: medicineJson(found, await stockOf(pharmacyId, found.id)),
            cheaper: cheaper ? { ...medicineJson(cheaper, cheaper.stock), savesInr: Number(found.price_inr) - Number(cheaper.price_inr) } : null,
            packs: packsNeeded(item, found.pack)
        });
    }
    return lines;
}

// Date the medicine runs out: the longest course on the prescription.
function refillDate(aiResult, from = new Date()) {
    const days = Math.max(0, ...aiResult.medicines.map((item) => item.days || 0));
    if (!days) return null;
    const date = new Date(from.getTime() + days * 86400000);
    return date.toISOString().slice(0, 10);
}

module.exports = { matchAll, packsNeeded, refillDate, stockOf };
