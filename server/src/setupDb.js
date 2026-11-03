// npm run setup  ->  creates the database (if needed), the tables, the
// medicine list and two demo accounts. Safe to run again.
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Client } = require("pg");

const config = require("./config");
const { buildProducts } = require("../data/medicines");

const DEMO_PASSWORD = "Demo@1234";

async function ensureDatabase() {
    const target = new URL(config.databaseUrl);
    const name = decodeURIComponent(target.pathname.replace(/^\//, ""));
    if (!/^[a-z0-9_]+$/i.test(name)) throw new Error("Database name may use letters, numbers and _ only");
    const admin = new URL(config.databaseUrl);
    admin.pathname = "/postgres";
    const client = new Client({ connectionString: admin.toString() });
    await client.connect();
    const found = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [name]);
    if (!found.rows.length) {
        await client.query(`CREATE DATABASE "${name}"`);
        console.log(`Database "${name}" created.`);
    }
    await client.end();
}

// A stable pseudo-random number per (pharmacy, medicine) for demo stock.
const stockFor = (pharmacyIndex, medicineIndex) => {
    const n = (pharmacyIndex * 7919 + medicineIndex * 104729) % 100;
    if (n < 8) return 0;
    return 5 + (n % 40);
};

async function main() {
    await ensureDatabase();
    const client = new Client({ connectionString: config.databaseUrl });
    await client.connect();
    try {
        await client.query(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));

        // Medicines.
        const products = buildProducts();
        let added = 0;
        for (const product of products) {
            const result = await client.query(
                `INSERT INTO medicines (name, salt, maker, pack, category, uses, prescription_required, price_inr)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (name) DO NOTHING`,
                [product.name, product.generic, product.maker, product.pack, product.category, product.uses, Boolean(product.rx), product.price]
            );
            added += result.rowCount;
        }

        // Demo accounts: one family member abroad, two pharmacies in India.
        const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
        await client.query(
            `INSERT INTO users (role, name, email, password_hash, country) VALUES ('family', 'Ravi Patel', 'family@demo.test', $1, 'United States')
             ON CONFLICT (email) DO NOTHING`,
            [hash]
        );
        const shops = [
            ["pharmacy@demo.test", "Shree Medical Store", "Nadiad", "Station Road, Nadiad, Gujarat 387001", "+919000000001", "GJ-KHD-20B-1001"],
            ["pharmacy2@demo.test", "Care Plus Pharmacy", "Ahmedabad", "CG Road, Navrangpura, Ahmedabad, Gujarat 380009", "+919000000002", "GJ-AHD-20B-2002"]
        ];
        for (const [email, name, city, address, phone, licence] of shops) {
            const user = await client.query(
                `INSERT INTO users (role, name, email, password_hash, country) VALUES ('pharmacy', $2, $1, $3, 'India')
                 ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
                [email, name, hash]
            );
            await client.query(
                `INSERT INTO pharmacies (user_id, name, city, address, phone, drug_licence) VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (user_id) DO NOTHING`,
                [user.rows[0].id, name, city, address, phone, licence]
            );
        }

        // Shelf stock for each pharmacy (only when empty).
        const pharmacies = (await client.query("SELECT id FROM pharmacies ORDER BY id")).rows;
        const medicines = (await client.query("SELECT id FROM medicines ORDER BY id")).rows;
        for (const [p, pharmacy] of pharmacies.entries()) {
            const has = await client.query("SELECT 1 FROM pharmacy_stock WHERE pharmacy_id = $1 LIMIT 1", [pharmacy.id]);
            if (has.rows.length) continue;
            const values = [];
            const params = [];
            medicines.forEach((medicine, m) => {
                params.push(pharmacy.id, medicine.id, stockFor(p, m));
                values.push(`($${params.length - 2}, $${params.length - 1}, $${params.length})`);
            });
            await client.query(`INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, packs) VALUES ${values.join(", ")}`, params);
        }

        console.log(`Ready. Medicines: ${products.length} (${added} new). Pharmacies: ${pharmacies.length}.`);
        console.log(`Demo logins (password ${DEMO_PASSWORD}): family@demo.test, pharmacy@demo.test, pharmacy2@demo.test`);
    } finally {
        await client.end();
    }
}

main().catch((error) => {
    console.error(`SETUP FAILED: ${error.message}`);
    process.exit(1);
});
