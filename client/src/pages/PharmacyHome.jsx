import { useEffect, useRef, useState } from "react";

import { api, inr, when } from "../api.js";
import { ErrorBox, Spinner, Status } from "../components/ui.jsx";
import { useLive } from "../live.js";

export default function PharmacyHome() {
    const [view, setView] = useState("open");
    const [orders, setOrders] = useState(null);
    const [pharmacy, setPharmacy] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/api/pharmacy/me").then((data) => setPharmacy(data.pharmacy)).catch((failure) => setError(failure.message));
    }, []);

    const viewRef = useRef(view);
    viewRef.current = view;
    const load = (which = view) => api.get(`/api/pharmacy/orders?view=${which}`)
        .then((data) => { if (viewRef.current === which) { setOrders(data.orders); setError(""); } })
        .catch((failure) => setError(failure.message));
    useEffect(() => { setOrders(null); load(view); }, [view]);
    useLive(() => load(viewRef.current));

    const newOnes = (orders || []).filter((order) => order.status === "paid").length;

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <h1>{pharmacy ? pharmacy.name : "Pharmacy"}</h1>
                    <p className="muted">{pharmacy ? `${pharmacy.city} · Drug licence ${pharmacy.licence || "—"}` : ""}</p>
                </div>
            </div>

            {view === "open" && newOnes > 0 && <div className="alert info">🔔 {newOnes} new paid order{newOnes === 1 ? "" : "s"} waiting for you to accept.</div>}

            <div className="tabs inline">
                <button className={view === "open" ? "active" : ""} onClick={() => setView("open")}>To do</button>
                <button className={view === "done" ? "active" : ""} onClick={() => setView("done")}>Finished</button>
            </div>

            <ErrorBox message={error} />
            {!orders && !error && <Spinner label="Loading orders…" />}
            {orders && !orders.length && (
                <div className="empty card">
                    <div className="empty-icon">{view === "open" ? "📦" : "✅"}</div>
                    <h3>{view === "open" ? "No orders to prepare" : "No finished orders yet"}</h3>
                    <p className="muted">{view === "open" ? "Paid orders from families abroad show up here by themselves." : "Delivered and refunded orders show up here."}</p>
                </div>
            )}
            <div className="order-list">
                {(orders || []).map((order) => (
                    <a key={order.id} href={`#/pharmacy/order/${order.id}`} className={`order-row card ${order.status === "paid" ? "fresh" : ""}`}>
                        <div className="order-row-main">
                            <b>#{order.id} · {order.patientName}</b>
                            <small className="muted">{order.address}</small>
                            <small className="muted">{order.lines} medicine{order.lines === 1 ? "" : "s"} · paid {when(order.paidAt)}</small>
                        </div>
                        <div className="order-row-side">
                            <Status status={order.status} />
                            <b>{inr(order.totalInr)}</b>
                            <small className="muted">${order.totalUsd.toFixed(2)} via PayPal</small>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
