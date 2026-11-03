import { useEffect, useRef, useState } from "react";

import { api, go } from "../api.js";
import { ErrorBox, Spinner, Steps } from "../components/ui.jsx";

const SAVED = "pifc-last-patient";

export default function NewOrder({ config }) {
    const [pharmacies, setPharmacies] = useState([]);
    const [form, setForm] = useState(() => {
        try { return { pharmacyId: "", patientName: "", patientPhone: "", address: "", ...JSON.parse(localStorage.getItem(SAVED) || "{}") }; } catch { return { pharmacyId: "", patientName: "", patientPhone: "", address: "" }; }
    });
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [dragging, setDragging] = useState(false);
    const fileInput = useRef(null);

    useEffect(() => {
        api.get("/api/pharmacies").then((data) => {
            setPharmacies(data.pharmacies);
            setForm((old) => (old.pharmacyId || !data.pharmacies[0] ? old : { ...old, pharmacyId: data.pharmacies[0].id }));
        }).catch((failure) => setError(failure.message));
    }, []);

    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

    function choose(file) {
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("Please choose a JPG, PNG or WebP photo");
        if (file.size > 6 * 1024 * 1024) return setError("The photo is bigger than 6 MB");
        setError("");
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
    }

    async function useSample() {
        const blob = await fetch("/sample-prescription.png").then((response) => response.blob());
        choose(new File([blob], "sample-prescription.png", { type: "image/png" }));
        if (!form.patientName) {
            setForm((old) => ({ ...old, patientName: "Kantaben Patel", patientPhone: "9876543210", address: "12 Shanti Nagar, near Santram Mandir, Nadiad, Gujarat 387001" }));
        }
    }

    async function submit(event) {
        event.preventDefault();
        if (!photo) return setError("Add a photo of the prescription");
        setBusy(true);
        setError("");
        const body = new FormData();
        Object.entries(form).forEach(([key, value]) => body.append(key, value));
        body.append("photo", photo);
        try {
            const data = await api.post("/api/orders", body);
            localStorage.setItem(SAVED, JSON.stringify(form));
            sessionStorage.setItem(`pifc-match-${data.orderId}`, JSON.stringify(data.lines));
            go(`/order/${data.orderId}`);
        } catch (failure) {
            setError(failure.message);
            setBusy(false);
        }
    }

    return (
        <div className="page narrow">
            <a href="#/" className="back">← My orders</a>
            <Steps current={0} />
            <h1>New order</h1>
            <p className="muted">Who is the medicine for, and where should it go?</p>

            <form className="card form-card" onSubmit={submit}>
                <div className="grid-2">
                    <label>Patient's name<input value={form.patientName} onChange={set("patientName")} placeholder="e.g. Kantaben Patel" /></label>
                    <label>Patient's phone in India<input value={form.patientPhone} onChange={set("patientPhone")} placeholder="10 digits, e.g. 9876543210" inputMode="tel" /></label>
                </div>
                <label>Delivery address in India<textarea rows="2" value={form.address} onChange={set("address")} placeholder="House, street, area, city, PIN" /></label>
                <label>Pharmacy near them
                    <select value={form.pharmacyId} onChange={set("pharmacyId")}>
                        {pharmacies.map((pharmacy) => <option key={pharmacy.id} value={pharmacy.id}>{pharmacy.name} — {pharmacy.city}</option>)}
                    </select>
                </label>

                <div
                    className={`dropzone ${dragging ? "drag" : ""} ${preview ? "has" : ""}`}
                    onClick={() => fileInput.current?.click()}
                    onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files[0]); }}
                >
                    {preview ? (
                        <img src={preview} alt="Prescription preview" />
                    ) : (
                        <>
                            <div className="dropzone-icon">📷</div>
                            <b>Add the prescription photo</b>
                            <small>Click or drop a JPG / PNG — a clear phone photo is enough</small>
                        </>
                    )}
                    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => choose(event.target.files[0])} />
                </div>
                <div className="row-between">
                    <button type="button" className="btn link" onClick={useSample}>Use the sample prescription</button>
                    {preview && <button type="button" className="btn link" onClick={() => { setPhoto(null); setPreview(""); }}>Remove photo</button>}
                </div>

                <ErrorBox message={error} />
                {busy ? (
                    <div className="ai-reading">
                        <Spinner label={config.aiMode === "gemini" ? "Google Gemini is reading the prescription…" : "The demo reader is reading the prescription…"} />
                        <small className="muted">Finding each medicine, its dose and days, and a cheaper same-salt option.</small>
                    </div>
                ) : (
                    <button className="btn primary wide big">✨ Read with AI</button>
                )}
            </form>
        </div>
    );
}
