const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../db");

const router = express.Router();

const publicUser = (row) => ({ id: String(row.id), role: row.role, name: row.name, email: row.email, country: row.country });

function signIn(req, user) {
    return new Promise((resolve, reject) => {
        req.session.regenerate((error) => {
            if (error) return reject(error);
            req.session.user = publicUser(user);
            req.session.save((saveError) => (saveError ? reject(saveError) : resolve()));
        });
    });
}

router.post("/register", async (req, res) => {
    const name = String(req.body?.name || "").trim().slice(0, 100);
    const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 200);
    const password = String(req.body?.password || "");
    const country = String(req.body?.country || "").trim().slice(0, 60) || null;
    if (name.length < 2) return res.status(400).json({ message: "Enter your name" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email" });
    if (password.length < 8) return res.status(400).json({ message: "Password: at least 8 characters" });
    const hash = await bcrypt.hash(password, 10);
    const made = await db.query(
        "INSERT INTO users (role, name, email, password_hash, country) VALUES ('family', $1, $2, $3, $4) ON CONFLICT (email) DO NOTHING RETURNING *",
        [name, email, hash, country]
    );
    if (!made.rows.length) return res.status(409).json({ message: "This email already has an account. Sign in instead." });
    await signIn(req, made.rows[0]);
    return res.status(201).json({ user: req.session.user });
});

router.post("/login", async (req, res) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const found = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = found.rows[0];
    if (!user || !(await bcrypt.compare(String(req.body?.password || ""), user.password_hash))) {
        return res.status(401).json({ message: "Wrong email or password" });
    }
    await signIn(req, user);
    return res.json({ user: req.session.user });
});

router.post("/logout", (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
});

router.get("/me", (req, res) => res.json({ user: req.session.user || null }));

module.exports = router;
