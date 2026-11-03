const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../../.env"), quiet: true });

function required(name) {
    const value = String(process.env[name] || "").trim();
    if (!value) {
        throw new Error(`${name} is missing. Copy .env.example to .env and fill it in (see README).`);
    }
    return value;
}

const inrPerUsd = Number(process.env.INR_PER_USD || 84);
if (!(inrPerUsd > 1)) {
    throw new Error("INR_PER_USD must be a number like 84");
}

module.exports = {
    port: Number(process.env.PORT || 4000),
    databaseUrl: required("DATABASE_URL"),
    sessionSecret: process.env.SESSION_SECRET || "dev-only-secret-change-me",
    inrPerUsd,
    paypal: {
        clientId: String(process.env.PAYPAL_CLIENT_ID || "").trim(),
        clientSecret: String(process.env.PAYPAL_CLIENT_SECRET || "").trim(),
        apiBase: String(process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com").replace(/\/$/, "")
    },
    gemini: {
        apiKey: String(process.env.GEMINI_API_KEY || "").trim(),
        model: String(process.env.GEMINI_MODEL || "gemini-flash-latest").trim(),
        apiBase: String(process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "")
    }
};
