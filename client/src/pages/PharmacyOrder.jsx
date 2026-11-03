import { useEffect, useState } from "react";

import { api, inr, usd, when } from "../api.js";
import { ErrorBox, Spinner, Status } from "../components/ui.jsx";
import { useLive } from "../live.js";

const NEXT_LABEL = { paid: "Accept the order", accepted: "Mark as packed", packed: "Send out for delivery" };

export default function PharmacyOrder({ id }) {
    const [order, setOrder] = useState(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [code, setCode] = useState("");
    const [cancelOpen, setCancelOpen] = useState(false);
    const [reason, setReason] = useState("");

    const load = () => api.get(`/api/pharmacy/orders/${id}`).then((data) => setOrder(data.order));
    useEffect(() => { load().catch((failure) => setError(failure.message)); }, [id]);
    // Stays current by itself (e.g. the same shop open on two screens); paused while a button is busy.
    useLive(() => (busy ? null : load()), { active: Boolean(order) && !["delivered", "refunded"].includes(order?.status), deps: [id] });

    async function act(path, body) {
        setBusy(true);
        setError("");
        try {
            const data = await api.post(`/api/pharmacy/orders/${id}/${path}`, body);
            setOrder(data.order);
            setCode("");
            setCancelOpen(false);
        } catch (failure) {
            setError(failure.message);
        } finally {
            setBusy(false);
        }
    }

    if (!order) {
        return <div className="page narrow"><a href="#/" className="back">← Orders</a>{error ? <ErrorBox message={error} /> : <Spinner label="Loading…" />}</div>;
    }

    const canCancel = ["paid", "accepted", "packed"].includes(order.status);

    return (
        <div className="page">
            <a href="#/" className="back">← Orders</a>
            <div className="page-head">
                <div>
                    <h1>Order #{order.id} <Status status={order.status} /></h1>
                    <p className="muted">Paid {usd(order.totalUsd)} ({inr(order.totalInr)}) with PayPal · {when(order.paidAt)}</p>
                </div>
            </div>

            <div className="grid-pharmacy">
                <div className="card rx-card">
                    <h3>Prescription</h3>
                    <a href={`/api/pharmacy/orders/${order.id}/photo`} target="_blank" rel="noreferrer">
                        <img src={`/api/pharmacy/orders/${order.id}/photo`} alt="Prescription photo" />
                    </a>
                    <small className="muted">Check the photo before packing. Read by {order.aiSource === "gemini" ? "Google Gemini" : "the demo reader"}{order.ai?.doctor_name ? ` · ${order.ai.doctor_name}` : ""}.</small>
                </div>

                <div className="stack">
                    <div className="card">
                        <h3>Pack these</h3>
                        <ul className="lines">
                            {order.lines.map((line) => (
                                <li key={line.id}>
                                    <div>
                                        <b>{line.name}</b> <span className="muted">× {line.packs} pack{line.packs === 1 ? "" : "s"}</span>
                                        <small className="muted">{line.salt} · {line.pack}</small>
                                        {line.dosage && <small className="muted">Dose: {line.dosage}</small>}
                                        {line.switchedFrom && <small className="good-text">Family chose this same-salt brand instead of {line.switchedFrom}</small>}
                                    </div>
                                    <span>{inr(line.lineInr)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="card">
                        <h3>Deliver to</h3>
                        <dl className="facts">
                            <dt>Patient</dt><dd>{order.patientName}</dd>
                            <dt>Phone</dt><dd><a href={`tel:${order.patientPhone}`}>{order.patientPhone}</a></dd>
                            <dt>Address</dt><dd>{order.deliveryAddress}</dd>
                        </dl>
                    </div>

                    <div className="card action-card">
                        {NEXT_LABEL[order.status] && (
                            <button className="btn primary big wide" disabled={busy} onClick={() => act("next")}>{busy ? "Saving…" : NEXT_LABEL[order.status]}</button>
                        )}
                        {order.status === "out_for_delivery" && (
                            <form className="deliver" onSubmit={(event) => { event.preventDefault(); act("deliver", { code }); }}>
                                <label>Delivery code from the patient
                                    <input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="4 digits" className="code-input" />
                                </label>
                                <button className="btn primary big" disabled={busy || code.length !== 4}>Mark delivered</button>
                            </form>
                        )}
                        {order.status === "delivered" && <div className="alert success">✅ Delivered {when(order.deliveredAt)}. The family has been told.</div>}
                        {order.status === "refunded" && <div className="alert error">Refunded with PayPal{order.paypalRefundId ? ` (${order.paypalRefundId})` : ""}: {order.cancelReason}</div>}

                        {canCancel && !cancelOpen && <button className="btn link danger" onClick={() => setCancelOpen(true)}>Can't supply this order?</button>}
                        {canCancel && cancelOpen && (
                            <div className="cancel-box">
                                <label>Why? (the family sees this)
                                    <textarea rows="2" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Telma 40 is out of stock for 2 weeks" />
                                </label>
                                <div className="row-between">
                                    <button className="btn ghost small" onClick={() => setCancelOpen(false)}>Keep the order</button>
                                    <button className="btn danger" disabled={busy || reason.trim().length < 3} onClick={() => act("cannot-supply", { reason })}>Refund {usd(order.totalUsd)} with PayPal</button>
                                </div>
                            </div>
                        )}
                        <ErrorBox message={error} />
                    </div>

                    <div className="card">
                        <h3>History</h3>
                        <ul className="history">
                            {order.events.map((event, index) => <li key={index}><small className="muted">{when(event.at)}</small> {event.note || event.status}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
