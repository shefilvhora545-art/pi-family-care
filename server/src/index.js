const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const express = require("express");
const helmet = require("helmet");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);

const config = require("./config");
const db = require("./db");
const paypal = require("./services/paypal");
const authRoutes = require("./routes/auth");
const { router: orderRoutes } = require("./routes/orders");
const pharmacyRoutes = require("./routes/pharmacy");

const app = express();

// A fresh nonce per page: PayPal's SDK adds small inline scripts and marks
// them with this nonce (data-csp-nonce), so the CSP can stay strict.
app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
    next();
});

app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            // PayPal Checkout buttons load from paypal.com.
            "script-src": ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`, "https://www.paypal.com", "https://*.paypal.com", "https://*.paypalobjects.com"],
            "frame-src": ["'self'", "https://www.paypal.com", "https://*.paypal.com", "https://*.paypalobjects.com"],
            "connect-src": ["'self'", "https://www.paypal.com", "https://*.paypal.com", "https://*.paypalobjects.com"],
            "img-src": ["'self'", "data:", "blob:", "https://*.paypal.com", "https://*.paypalobjects.com"],
            "style-src": ["'self'", "'unsafe-inline'"],
            "upgrade-insecure-requests": null
        }
    },
    crossOriginEmbedderPolicy: false,
    // PayPal Checkout opens a popup and talks back to this page: the default
    // "same-origin" would cut that link and leave the PayPal window blank.
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(express.json({ limit: "100kb" }));
app.use(session({
    store: new PgSession({ pool: db.pool, tableName: "user_sessions" }),
    secret: config.sessionSecret,
    name: "pifc_sid",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 3600 * 1000 }
}));

const needRole = (role) => (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ message: "Please sign in" });
    if (req.session.user.role !== role) return res.status(403).json({ message: `This needs a ${role} account` });
    return next();
};

// Public: what the screens need to know.
app.get("/api/config", (req, res) => res.json({
    paypalClientId: config.paypal.clientId || null,
    paypalReady: paypal.isConfigured(),
    aiMode: config.gemini.apiKey ? "gemini" : "demo",
    inrPerUsd: config.inrPerUsd
}));

app.get("/api/pharmacies", async (req, res) => {
    const result = await db.query("SELECT id, name, city, address FROM pharmacies ORDER BY id");
    res.json({ pharmacies: result.rows.map((row) => ({ ...row, id: String(row.id) })) });
});

app.use("/api/auth", authRoutes);
app.use("/api/orders", needRole("family"), orderRoutes);
app.use("/api/pharmacy", needRole("pharmacy"), pharmacyRoutes);

app.use("/api", (req, res) => res.status(404).json({ message: "Not found" }));

// The built screens (client/dist), with the app's own routing.
const screens = path.join(__dirname, "../../client/dist");
if (fs.existsSync(screens)) {
    const page = fs.readFileSync(path.join(screens, "index.html"), "utf8");
    app.use(express.static(screens, { index: false }));
    app.get(/^\/(?!api\/).*/, (req, res) => res.type("html").set("Cache-Control", "no-store").send(page.replaceAll("%CSP_NONCE%", res.locals.cspNonce)));
}

// One place for errors: a clear message, never a stack trace.
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
    if (error.name === "MulterError") {
        return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "The photo is bigger than 6 MB" : "Upload one photo of the prescription" });
    }
    if (error.type === "entity.parse.failed" || error.type === "entity.too.large") {
        return res.status(400).json({ message: "The request could not be read" });
    }
    const status = error.status && error.status < 600 ? error.status : 500;
    if (status >= 500) console.error(error);
    res.status(status).json({ message: status >= 500 && !error.status ? "Something went wrong. Please try again." : error.message, ...(error.extra || {}) });
});

app.listen(config.port, (error) => {
    if (error) {
        console.error(error.code === "EADDRINUSE" ? `Port ${config.port} is already in use. Close the other copy of the app (or set PORT in .env).` : error.message);
        process.exit(1);
    }
    console.log(`PI Family Care is running: http://localhost:${config.port}`);
    console.log(`AI: ${config.gemini.apiKey ? `Google Gemini (${config.gemini.model})` : "demo reader (no GEMINI_API_KEY)"}`);
    console.log(`PayPal: ${paypal.isConfigured() ? `sandbox ready (${config.paypal.apiBase})` : "NOT set up (add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET)"}`);
});
