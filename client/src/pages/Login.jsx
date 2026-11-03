import { useState } from "react";

import { api } from "../api.js";
import { ErrorBox, Logo } from "../components/ui.jsx";

const DEMO = {
    family: { email: "family@demo.test", password: "Demo@1234" },
    pharmacy: { email: "pharmacy@demo.test", password: "Demo@1234" }
};

export default function Login({ config, onSignedIn }) {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ name: "", email: "", password: "", country: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

    async function submit(event, preset) {
        event?.preventDefault();
        setBusy(true);
        setError("");
        try {
            const data = preset
                ? await api.post("/api/auth/login", preset)
                : mode === "login"
                    ? await api.post("/api/auth/login", { email: form.email, password: form.password })
                    : await api.post("/api/auth/register", form);
            onSignedIn(data.user);
        } catch (failure) {
            setError(failure.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="landing">
            <section className="hero">
                <Logo />
                <h1>Care for your parents in India, <span>from anywhere in the world.</span></h1>
                <p className="hero-lead">
                    Snap their prescription. AI reads it, finds the medicines at a trusted local pharmacy
                    near them, and you pay in dollars with PayPal. The pharmacy delivers to their door.
                </p>
                <ul className="hero-steps">
                    <li><span className="icon teal">📷</span><div><b>Upload the prescription</b><small>Any phone photo</small></div></li>
                    <li><span className="icon blue">✨</span><div><b>Gemini reads it</b><small>Medicines, dose, days + a cheaper same-salt option</small></div></li>
                    <li><span className="icon indigo">💳</span><div><b>Pay with PayPal</b><small>In USD, refunded automatically if not supplied</small></div></li>
                    <li><span className="icon green">🏠</span><div><b>Delivered safely</b><small>Secret 4-digit code at the door</small></div></li>
                </ul>
                <div className="hero-stats">
                    <div><b>35M+</b><small>people of Indian origin live abroad</small></div>
                    <div><b>4 taps</b><small>from photo to paid order</small></div>
                    <div><b>100%</b><small>refund if not supplied</small></div>
                </div>
            </section>

            <section className="auth-card card">
                <div className="tabs">
                    <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Sign in</button>
                    <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Create account</button>
                </div>
                <form onSubmit={submit} className="form">
                    {mode === "register" && (
                        <>
                            <label>Your name<input value={form.name} onChange={set("name")} placeholder="e.g. Rahul Patel" autoComplete="name" /></label>
                            <label>Country you live in<input value={form.country} onChange={set("country")} placeholder="e.g. USA" /></label>
                        </>
                    )}
                    <label>Email<input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" /></label>
                    <label>Password<input type="password" value={form.password} onChange={set("password")} placeholder={mode === "register" ? "At least 8 characters" : ""} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
                    <ErrorBox message={error} />
                    <button className="btn primary wide" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create family account"}</button>
                </form>
                <div className="divider"><span>or try the demo</span></div>
                <div className="demo-buttons">
                    <button className="btn soft wide" disabled={busy} onClick={(event) => submit(event, DEMO.family)}>
                        <span>👨‍👩‍👧</span> Family abroad <small>family@demo.test</small>
                    </button>
                    <button className="btn soft wide" disabled={busy} onClick={(event) => submit(event, DEMO.pharmacy)}>
                        <span>💊</span> Pharmacy in India <small>pharmacy@demo.test</small>
                    </button>
                </div>
                <p className="fine">
                    {config.paypalReady ? "PayPal sandbox is connected — no real money moves." : "PayPal is not set up on this server yet (see README)."}
                </p>
            </section>
        </div>
    );
}
