import { useEffect, useState } from "react";

import { api, day, go, usd, inr, when } from "../api.js";
import { ErrorBox, Spinner, Status } from "../components/ui.jsx";
import { useLive } from "../live.js";

export default function FamilyHome({ user }) {
    const [orders, setOrders] = useState(null);
    const [error, setError] = useState("");

    const load = () => api.get("/api/orders").then((data) => { setOrders(data.orders); setError(""); }).catch((failure) => setError(failure.message));
    useEffect(() => { load(); }, []);
    useLive(load);

    const today = new Date().toISOString().slice(0, 10);
    const soon = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const refills = (orders || []).filter((order) => order.status === "delivered" && order.refillOn && order.refillOn <= soon);
    const active = (orders || []).filter((order) => ["paid", "accepted", "packed", "out_for_delivery"].includes(order.status));

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <h1>Hello, {user.name.split(" ")[0]} 👋</h1>
                    <p className="muted">Order medicine for your family in India in a few taps.</p>
                </div>
                <button className="btn primary big" onClick={() => go("/new")}>＋ New order</button>
            </div>

            {refills.map((order) => (
                <div key={order.id} className="alert info refill">
                    <span>💊 <b>{order.patientName}</b>'s medicines {order.refillOn < today ? "ran out on" : "run out on"} <b>{day(order.refillOn)}</b>.</span>
                    <button className="btn primary small" onClick={() => go(`/order/${order.id}`)}>Refill now</button>
                </div>
            ))}

            <div className="stat-row">
                <div className="stat card"><small>On the way</small><b>{active.length}</b></div>
                <div className="stat card"><small>Delivered</small><b>{(orders || []).filter((order) => order.status === "delivered").length}</b></div>
                <div className="stat card"><small>Total paid</small><b>{usd((orders || []).filter((order) => !["draft", "refunded"].includes(order.status)).reduce((sum, order) => sum + order.totalUsd, 0))}</b></div>
            </div>

            <h2 className="section-title">Your orders</h2>
            <ErrorBox message={error} />
            {!orders && !error && <Spinner label="Loading orders…" />}
            {orders && !orders.length && (
                <div className="empty card">
                    <div className="empty-icon">📷</div>
                    <h3>No orders yet</h3>
                    <p className="muted">Start with a photo of the prescription. You can use our sample one to try it.</p>
                    <button className="btn primary" onClick={() => go("/new")}>Make the first order</button>
                </div>
            )}
            <div className="order-list">
                {(orders || []).map((order) => (
                    <a key={order.id} href={`#/order/${order.id}`} className="order-row card">
                        <div className="order-row-main">
                            <b>#{order.id} · {order.patientName}</b>
                            <small className="muted">{order.pharmacyName} · {when(order.createdAt)}</small>
                        </div>
                        <div className="order-row-side">
                            <Status status={order.status} />
                            <b>{order.totalUsd ? usd(order.totalUsd) : "—"}</b>
                            <small className="muted">{order.totalInr ? inr(order.totalInr) : ""}</small>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
