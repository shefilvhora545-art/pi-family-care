const { Pool } = require("pg");

const config = require("./config");

const pool = new Pool({ connectionString: config.databaseUrl, max: 10 });

// Runs work(client) inside one transaction.
async function inTransaction(work) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await work(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { pool, query: (text, params) => pool.query(text, params), inTransaction };
