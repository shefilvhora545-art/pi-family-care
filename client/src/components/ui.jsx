import { STATUS } from "../api.js";

export function Logo() {
    return (
        <span className="logo">
            <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
                <defs>
                    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#0f766e" />
                        <stop offset="1" stopColor="#1d4ed8" />
                    </linearGradient>
                </defs>
                <rect width="40" height="40" rx="11" fill="url(#lg)" />
                <path d="M20 29s-9-5.6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.4-9 12-9 12z" fill="#fff" />
                <path d="M18.5 16.5h3v2.5H24v3h-2.5v2.5h-3V22H16v-3h2.5z" fill="#0f766e" />
            </svg>
            <span className="logo-text">PI <b>Family Care</b></span>
        </span>
    );
}

export function Status({ status }) {
    const info = STATUS[status] || { label: status, tone: "grey" };
    return <span className={`chip ${info.tone}`}>{info.label}</span>;
}

export function Steps({ current }) {
    const steps = ["Prescription", "AI cart", "Pay with PayPal", "Delivery"];
    return (
        <ol className="steps">
            {steps.map((label, index) => (
                <li key={label} className={index < current ? "done" : index === current ? "now" : ""}>
                    <span className="steps-dot">{index < current ? "✓" : index + 1}</span>
                    <span className="steps-label">{label}</span>
                </li>
            ))}
        </ol>
    );
}

export function ErrorBox({ message }) {
    if (!message) return null;
    return <div className="alert error" role="alert">{message}</div>;
}

export function Spinner({ label }) {
    return <div className="spinner-row"><span className="spinner" />{label}</div>;
}
