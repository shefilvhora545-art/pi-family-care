import { useEffect, useRef, useState } from "react";

import { api, day, go, inr, usd, when } from "../api.js";
import { ErrorBox, Spinner, Status, Steps } from "../components/ui.jsx";
import { useLive } from "../live.js";

const FINAL = ["delivered", "refunded"];

export default function OrderPage({ id, config }) {
    const [order, setOrder] = useState(null);
    const [error, setError] = useState("");

    const load = () => api.get(`/api/orders/${id}`).then((data) => { if (data.order.id === String(id)) setOrder(data.order); });
    useEffect(() => {
        setOrder(null);
        setError("");
        load().catch((failure) => setError(failure.message));
    }, [id]);
    // Paid orders: follow the pharmacy's progress live, no refresh needed.
    useLive(load, { active: Boolean(order) && order.status !== "draft" && !FINAL.includes(order.status), deps: [id] });

    if (error && !order) return <div className="page narrow"><a href="#/" className="back">← My orders</a><ErrorBox message={error} /></div>;
    if (!order) return <div className="page narrow"><Spinner label="Loading the order…" /></div>;
    if (order.status === "draft") return <Draft order={order} config={config} onChange={setOrder} />;
    return <Tracking order={order} />;
}

// ---------- Draft: AI cart, then PayPal ----------

function Draft({ order, config, onChange }) {
    const [phase, setPhase] = useState(order.lines.length ? "pay" : "cart");
    return phase === "cart"
        ? <Cart order={order} onSaved={(saved) => { onChange(saved); setPhase("pay"); }} />
        : <Pay order={order} config={config} onEdit={() => setPhase("cart")} onPaid={onChange} />;
}

function readAs(read) {
    return [read.name, read.strength].filter(Boolean).join(" ");
}

function dosageText(read) {
    return [read.dosage, read.days ? `${read.days} days` : ""].filter(Boolean).join(" · ");
}

function Cart({ order, onSaved }) {
    const [rows, setRows] = useState(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const start = (lines) => setRows(lines.map((line) => {
            // "Change cart" after saving: keep what the family already chose.
            if (order.lines.length && line.medicine) {
                const saved = order.lines.find((item) => item.medicineId === line.medicine.id || (line.cheaper && item.medicineId === line.cheaper.id));
                return {
                    ...line,
                    include: Boolean(saved),
                    useCheaper: Boolean(saved && line.cheaper && saved.medicineId === line.cheaper.id),
                    packs: saved ? saved.packs : Math.max(1, line.packs || 1)
                };
            }
            return {
                ...line,
                // Out of stock but a same-salt brand is on the shelf: switch to it.
                include: Boolean(line.medicine && (line.medicine.stock > 0 || line.cheaper)),
                useCheaper: Boolean(line.medicine && line.medicine.stock < 1 && line.cheaper),
                packs: Math.max(1, line.packs || 1)
            };
        }));
        const key = `pifc-match-${order.id}`;
        try {
            const saved = JSON.parse(sessionStorage.getItem(key) || "null");
            if (Array.isArray(saved)) return start(saved);
        } catch { /* fall back to the server */ }
        api.get(`/api/orders/${order.id}/match`).then((data) => start(data.lines)).catch((failure) => setError(failure.message));
    }, [order.id]);

    if (!rows) return <div className="page narrow"><Steps current={1} />{error ? <ErrorBox message={error} /> : <Spinner label="Preparing the cart…" />}</div>;

    const update = (index, change) => setRows(rows.map((row, at) => (at === index ? { ...row, ...change } : row)));
    const chosen = (row) => (row.useCheaper && row.cheaper ? row.cheaper : row.medicine);
    const picked = rows.filter((row) => row.include && row.medicine);
    const totalInr = picked.reduce((sum, row) => sum + chosen(row).priceInr * row.packs, 0);
    // Same sum as the server (and PayPal): each line rounded to cents, then added.
    const totalUsd = picked.reduce((sum, row) => sum + Math.round((chosen(row).priceInr * row.packs * 100) / order.inrPerUsd) / 100, 0);
    const savedInr = picked.filter((row) => row.useCheaper && row.cheaper).reduce((sum, row) => sum + row.cheaper.savesInr * row.packs, 0);
    const cheaperLeft = rows.filter((row) => row.include && row.cheaper && !row.useCheaper);

    async function save() {
        setBusy(true);
        setError("");
        try {
            const data = await api.put(`/api/orders/${order.id}/lines`, {
                lines: picked.map((row) => ({
                    medicineId: chosen(row).id,
                    packs: row.packs,
                    readAs: readAs(row.read),
                    dosage: dosageText(row.read),
                    switchedFromId: row.useCheaper && row.cheaper ? row.medicine.id : null
                }))
            });
            sessionStorage.removeItem(`pifc-match-${order.id}`);
            onSaved(data.order);
        } catch (failure) {
            setError(failure.message);
            setBusy(false);
        }
    }

    return (
        <div className="page narrow">
            <a href="#/" className="back">← My orders</a>
            <Steps current={1} />
            <div className="page-head">
                <div>
                    <h1>Check the AI cart</h1>
                    <p className="muted">
                        {order.aiSource === "gemini" ? "Google Gemini" : "The demo reader"} read {rows.length} medicine{rows.length === 1 ? "" : "s"} for <b>{order.patientName}</b>
                        {order.ai?.doctor_name ? <> (prescribed by {order.ai.doctor_name})</> : null}. Prices from {order.pharmacy.name}.
                    </p>
                </div>
                <a className="rx-thumb" href={`/api/orders/${order.id}/photo`} target="_blank" rel="noreferrer" title="Open the prescription photo">
                    <img src={`/api/orders/${order.id}/photo`} alt="Prescription" />
                </a>
            </div>

            {cheaperLeft.length > 0 && (
                <div className="alert info row-between">
                    <span>💡 The pharmacy has a cheaper brand with the <b>same salt</b> for {cheaperLeft.length} medicine{cheaperLeft.length === 1 ? "" : "s"}.</span>
                    <button className="btn soft small" onClick={() => setRows(rows.map((row) => (row.include && row.cheaper ? { ...row, useCheaper: true } : row)))}>Switch all</button>
                </div>
            )}

            <div className="cart">
                {rows.map((row, index) => {
                    const medicine = chosen(row);
                    const missing = !row.medicine;
                    const empty = row.medicine && row.medicine.stock < 1 && !(row.useCheaper && row.cheaper);
                    const mainEmpty = row.medicine && row.medicine.stock < 1;
                    return (
                        <div key={index} className={`cart-row card ${row.include ? "" : "off"}`}>
                            <div className="cart-read">
                                <small className="muted">AI read</small>
                                <b>{readAs(row.read)}</b>
                                <small>{dosageText(row.read) || "Dose not written"}</small>
                            </div>
                            {missing ? (
                                <div className="cart-main"><span className="chip red">Not found</span><small className="muted">Not in this pharmacy's list. Ask the doctor or choose another pharmacy.</small></div>
                            ) : (
                                <div className="cart-main">
                                    <label className="check">
                                        <input type="checkbox" checked={row.include} disabled={empty} onChange={(event) => update(index, { include: event.target.checked })} />
                                        <span>
                                            <b>{medicine.name}</b>
                                            <small className="muted">{medicine.salt} · {medicine.pack}</small>
                                            {empty ? <small className="warn-text">Out of stock at this pharmacy</small> : <small className="muted">{inr(medicine.priceInr)} per pack · {medicine.stock} in stock</small>}
                                        </span>
                                    </label>
                                    {row.cheaper && row.include && mainEmpty && (
                                        <div className="swap on">✓ {row.medicine.name} is out of stock — same salt <b>{row.cheaper.name}</b> chosen instead (saves {inr(row.cheaper.savesInr * row.packs)})</div>
                                    )}
                                    {row.cheaper && row.include && !mainEmpty && (
                                        <button className={`swap ${row.useCheaper ? "on" : ""}`} onClick={() => update(index, { useCheaper: !row.useCheaper })}>
                                            {row.useCheaper
                                                ? <>✓ Switched from {row.medicine.name} · saving {inr(row.cheaper.savesInr * row.packs)} <u>undo</u></>
                                                : <>Same salt, cheaper: <b>{row.cheaper.name}</b> — save {inr(row.cheaper.savesInr)} per pack</>}
                                        </button>
                                    )}
                                </div>
                            )}
                            {!missing && (
                                <div className="cart-side">
                                    <div className="stepper" aria-label="Packs">
                                        <button disabled={!row.include || row.packs <= 1} onClick={() => update(index, { packs: row.packs - 1 })}>−</button>
                                        <span>{row.packs}</span>
                                        <button disabled={!row.include || row.packs >= Math.min(50, medicine.stock)} onClick={() => update(index, { packs: row.packs + 1 })}>+</button>
                                    </div>
                                    <small className="muted">pack{row.packs === 1 ? "" : "s"}</small>
                                    <b>{row.include ? inr(medicine.priceInr * row.packs) : "—"}</b>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="card total-card">
                <div>
                    <small className="muted">Total</small>
                    <div className="total-big">{usd(totalUsd)} <small className="muted">≈ {inr(totalInr)}</small></div>
                    {savedInr > 0 && <small className="good-text">You save {inr(savedInr)} with same-salt brands</small>}
                    <small className="muted hide-phone">₹{order.inrPerUsd} = $1 · Packs worked out from dose × days</small>
                </div>
                <button className="btn primary big" disabled={busy || !picked.length} onClick={save}>{busy ? "Saving…" : "Looks right → Pay"}</button>
            </div>
            <ErrorBox message={error} />
        </div>
    );
}

// The PayPal JS SDK is loaded once, with the sandbox client id from the server.
let sdkPromise = null;
function loadPayPal(clientId) {
    if (window.paypal) return Promise.resolve(window.paypal);
    if (!sdkPromise) {
        sdkPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons`;
            // The page's CSP nonce: PayPal puts it on the inline scripts it adds.
            const nonce = document.querySelector("meta[name=csp-nonce]")?.content;
            if (nonce && !nonce.startsWith("%")) {
                script.nonce = nonce;
                script.setAttribute("data-csp-nonce", nonce);
            }
            script.onload = () => (window.paypal ? resolve(window.paypal) : reject(new Error("PayPal did not load")));
            script.onerror = () => { sdkPromise = null; reject(new Error("Could not load PayPal. Check the internet connection.")); };
            document.head.appendChild(script);
        });
    }
    return sdkPromise;
}

function PayPalButtons({ order, clientId, onPaid, onMessage }) {
    const box = useRef(null);
    const lastError = useRef("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        let buttons = null;
        loadPayPal(clientId).then((paypal) => {
            if (cancelled || !box.current) return;
            buttons = paypal.Buttons({
                style: { layout: "vertical", shape: "rect", label: "pay", height: 48 },
                createOrder: async () => {
                    onMessage("");
                    try {
                        return (await api.post(`/api/orders/${order.id}/paypal/create`)).paypalOrderId;
                    } catch (failure) {
                        lastError.current = failure.message;
                        throw failure;
                    }
                },
                onApprove: async (data) => {
                    try {
                        const result = await api.post(`/api/orders/${order.id}/paypal/capture`, { paypalOrderId: data.orderID });
                        onPaid(result.order);
                    } catch (failure) {
                        onMessage(failure.message);
                    }
                },
                onCancel: () => onMessage("Payment cancelled. Nothing was charged."),
                onError: () => { onMessage(lastError.current || "PayPal had a problem. Please try again."); lastError.current = ""; }
            });
            buttons.render(box.current).then(() => !cancelled && setLoading(false)).catch(() => {});
        }).catch((failure) => { if (!cancelled) { setLoading(false); onMessage(failure.message); } });
        return () => { cancelled = true; buttons?.close?.().catch?.(() => {}); };
    }, [order.id, order.totalUsd, clientId]);

    return (
        <>
            {loading && <Spinner label="Loading PayPal…" />}
            <div ref={box} className="paypal-box" data-testid="paypal-box" />
        </>
    );
}

function Pay({ order, config, onEdit, onPaid }) {
    const [message, setMessage] = useState("");
    return (
        <div className="page narrow">
            <a href="#/" className="back">← My orders</a>
            <Steps current={2} />
            <h1>Pay with PayPal</h1>
            <p className="muted">The money is held safely. If the pharmacy can't supply, PayPal refunds you in full automatically.</p>

            <div className="grid-pay">
                <div className="card">
                    <div className="row-between"><h3>Order #{order.id}</h3><button className="btn link" onClick={onEdit}>Change cart</button></div>
                    <LineList lines={order.lines} />
                    <div className="sum-row"><span>Total</span><b className="total-big">{usd(order.totalUsd)}</b></div>
                    <small className="muted">≈ {inr(order.totalInr)} at ₹{order.inrPerUsd} = $1</small>
                    <dl className="facts">
                        <dt>For</dt><dd>{order.patientName} · {order.patientPhone}</dd>
                        <dt>Deliver to</dt><dd>{order.deliveryAddress}</dd>
                        <dt>Pharmacy</dt><dd>{order.pharmacy.name}, {order.pharmacy.city}</dd>
                    </dl>
                </div>
                <div className="card pay-card">
                    <h3>Pay {usd(order.totalUsd)}</h3>
                    {config.paypalReady && config.paypalClientId ? (
                        <PayPalButtons order={order} clientId={config.paypalClientId} onPaid={onPaid} onMessage={setMessage} />
                    ) : (
                        <div className="alert error">PayPal is not set up on this server. Add the sandbox keys to <code>.env</code> (see README).</div>
                    )}
                    <ErrorBox message={message} />
                    <small className="muted">🔒 Sandbox mode — use a PayPal sandbox buyer account, no real money moves.</small>
                </div>
            </div>
        </div>
    );
}

// ---------- Paid: live tracking ----------

const STAGES = [
    ["paid", "Paid with PayPal"],
    ["accepted", "Pharmacy accepted"],
    ["packed", "Medicines packed"],
    ["out_for_delivery", "Out for delivery"],
    ["delivered", "Delivered"]
];

function LineList({ lines }) {
    return (
        <ul className="lines">
            {lines.map((line) => (
                <li key={line.id}>
                    <div>
                        <b>{line.name}</b> <span className="muted">× {line.packs}</span>
                        <small className="muted">{line.pack}{line.dosage ? ` · ${line.dosage}` : ""}</small>
                        {line.switchedFrom && <small className="good-text">Cheaper same-salt brand instead of {line.switchedFrom}</small>}
                    </div>
                    <span>{usd(line.lineUsd)}</span>
                </li>
            ))}
        </ul>
    );
}

function Tracking({ order }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const reached = Object.fromEntries(order.events.map((event) => [event.status, event.at]));
    const doneIndex = STAGES.findIndex(([status]) => status === order.status);
    const refunded = order.status === "refunded";

    async function orderAgain() {
        setBusy(true);
        setError("");
        try {
            const made = await api.post(`/api/orders/${order.id}/reorder`);
            await api.put(`/api/orders/${made.orderId}/lines`, { lines: made.lines }).catch(() => {});
            go(`/order/${made.orderId}`);
        } catch (failure) {
            setError(failure.message);
            setBusy(false);
        }
    }

    return (
        <div className="page narrow">
            <a href="#/" className="back">← My orders</a>
            <Steps current={order.status === "delivered" ? 4 : 3} />
            <div className="page-head">
                <div>
                    <h1>Order #{order.id} <Status status={order.status} /></h1>
                    <p className="muted">For {order.patientName} · {order.pharmacy.name}, {order.pharmacy.city}</p>
                </div>
            </div>

            {refunded && (
                <div className="alert error">
                    <b>The pharmacy could not supply this order:</b> {order.cancelReason}<br />
                    PayPal refunded {usd(order.totalUsd)} in full{order.paypalRefundId ? ` (refund ${order.paypalRefundId})` : ""}.
                </div>
            )}

            {!refunded && order.status !== "delivered" && order.deliveryCode && (
                <div className="card code-card">
                    <div>
                        <b>Delivery code</b>
                        <small className="muted">Send this to {order.patientName}. The delivery person asks for it at the door — so the medicine reaches the right hands.</small>
                    </div>
                    <span className="code" data-testid="delivery-code">{order.deliveryCode}</span>
                </div>
            )}

            {!refunded && (
                <div className="card">
                    <h3>Live status</h3>
                    <ol className="timeline">
                        {STAGES.map(([status, label], index) => (
                            <li key={status} className={index <= doneIndex ? "done" : index === doneIndex + 1 ? "next" : ""}>
                                <span className="timeline-dot" />
                                <div><b>{label}</b><small className="muted">{reached[status] ? when(reached[status]) : index === doneIndex + 1 ? "Waiting for the pharmacy…" : ""}</small></div>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {order.refillOn && !refunded && (
                <div className="card refill-card">
                    <div>
                        <b>💊 Refill</b>
                        <small className="muted">The medicines last until about <b>{day(order.refillOn)}</b>. Order the same again in one tap.</small>
                    </div>
                    <button className="btn primary" disabled={busy} onClick={orderAgain}>{busy ? "Making the order…" : "Order again"}</button>
                </div>
            )}
            <ErrorBox message={error} />

            <div className="card">
                <h3>Medicines</h3>
                <LineList lines={order.lines} />
                <div className="sum-row"><span>Paid</span><b>{usd(order.totalUsd)}</b></div>
                <dl className="facts">
                    <dt>PayPal</dt><dd>{order.payerEmail || "Sandbox buyer"} · capture {order.paypalCaptureId}</dd>
                    <dt>Paid on</dt><dd>{when(order.paidAt)}</dd>
                    <dt>Deliver to</dt><dd>{order.deliveryAddress} · {order.patientPhone}</dd>
                    <dt>Pharmacy</dt><dd>{order.pharmacy.name}, {order.pharmacy.address} · {order.pharmacy.phone}</dd>
                    <dt>Prescription</dt><dd><a href={`/api/orders/${order.id}/photo`} target="_blank" rel="noreferrer">Open the photo</a></dd>
                </dl>
            </div>
        </div>
    );
}
