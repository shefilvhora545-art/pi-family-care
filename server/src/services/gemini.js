const config = require("../config");

// ==================================================
// AI PRESCRIPTION READER (Google Gemini)
// ==================================================
// Sends the prescription photo to Gemini and gets back a strict JSON list
// of medicines. Without GEMINI_API_KEY a clearly-labelled demo reader
// answers for docs/sample-prescription.png, so the app can still be tried.

const PROMPT = `You read medical prescriptions from India (often handwritten).
Return ONLY JSON, no other text, in exactly this shape:
{
  "readable": true,
  "patient_name": "string or null",
  "doctor_name": "string or null",
  "medicines": [
    { "name": "brand or generic name as written",
      "strength": "e.g. 650 mg or null",
      "form": "tablet | capsule | syrup | injection | cream | drops | other",
      "dosage": "how often, e.g. 1-0-1 after food, or null",
      "days": number or null }
  ],
  "notes": "short note about anything unclear, or null"
}
Rules: list every medicine you can read; never invent a medicine; if the
image is not a prescription or nothing is readable, return
{"readable": false, "medicines": [], "notes": "why"}.`;

// The demo reader's answer for docs/sample-prescription.png.
const DEMO_RESULT = {
    readable: true,
    patient_name: "Kantaben Patel",
    doctor_name: "Dr. A. Shah",
    medicines: [
        { name: "Crocin", strength: "650 mg", form: "tablet", dosage: "1-0-1 after food", days: 5 },
        { name: "Azithral", strength: "500 mg", form: "tablet", dosage: "1-0-0", days: 3 },
        { name: "Pantocid", strength: "40 mg", form: "tablet", dosage: "1-0-0 before breakfast", days: 15 },
        { name: "Telma", strength: "40 mg", form: "tablet", dosage: "0-0-1", days: 30 }
    ],
    notes: "Demo reader: add GEMINI_API_KEY to read real prescriptions."
};

let chosenModel = null;
const FALLBACK_MODELS = ["gemini-flash-latest", "gemini-3-flash-preview", "gemini-3.5-flash", "gemini-flash-lite-latest"];

async function geminiFetch(path, body) {
    const response = await fetch(`${config.gemini.apiBase}/${path}`, {
        method: body ? "POST" : "GET",
        headers: { "Content-Type": "application/json", "x-goog-api-key": config.gemini.apiKey },
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
}

// The configured model, or (if Google renamed it) the first "flash" model
// that can read images, so the app keeps working without a code change.
async function modelName() {
    if (chosenModel) return chosenModel;
    const wanted = config.gemini.model;
    const list = await geminiFetch("models?pageSize=200");
    if (list.ok && Array.isArray(list.data.models)) {
        const usable = list.data.models.filter((model) => (model.supportedGenerationMethods || []).includes("generateContent"));
        const exact = usable.find((model) => model.name === `models/${wanted}`);
        const flash = usable.find((model) => /flash/.test(model.name) && !/lite|thinking|tts|image|audio|live/.test(model.name));
        chosenModel = (exact || flash || usable[0])?.name?.replace(/^models\//, "") || wanted;
    } else {
        chosenModel = wanted;
    }
    return chosenModel;
}

function cleanResult(raw) {
    const text = String(raw || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw Object.assign(new Error("The AI answer could not be read. Try a clearer photo."), { status: 502 });
    }
    const medicines = Array.isArray(parsed.medicines) ? parsed.medicines : [];
    return {
        readable: parsed.readable !== false && medicines.length > 0,
        patient_name: parsed.patient_name || null,
        doctor_name: parsed.doctor_name || null,
        medicines: medicines.slice(0, 20).map((item) => ({
            name: String(item.name || "").replace(/^\s*(tab|tabs|tablet|cap|caps|capsule|syp|syrup|inj|injection)\.?\s+/i, "").trim().slice(0, 100),
            strength: item.strength ? String(item.strength).slice(0, 40) : null,
            form: item.form ? String(item.form).slice(0, 20) : null,
            dosage: item.dosage ? String(item.dosage).slice(0, 80) : null,
            days: parseInt(item.days, 10) > 0 ? Math.min(365, parseInt(item.days, 10)) : null
        })).filter((item) => item.name),
        notes: parsed.notes ? String(parsed.notes).slice(0, 300) : null
    };
}

// Returns { source: "gemini" | "demo", model, result }.
async function readPrescription(imageBuffer, mimeType) {
    if (!config.gemini.apiKey) {
        return { source: "demo", model: null, result: DEMO_RESULT };
    }
    const ask = (name) => geminiFetch(`models/${encodeURIComponent(name)}:generateContent`, {
        contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mimeType, data: imageBuffer.toString("base64") } }] }],
        generationConfig: { temperature: 0, responseMimeType: "application/json" }
    });
    // Google retires model names and some models get busy ("high demand"):
    // try the chosen model first, then the next ones in the list.
    const first = await modelName();
    const tries = [first, ...FALLBACK_MODELS.filter((name) => name !== first)];
    let model;
    let answer;
    // Two rounds: a busy model is often free again a few seconds later.
    search: for (let round = 0; round < 2; round += 1) {
        if (round) await new Promise((done) => setTimeout(done, 3000));
        for (model of tries) {
            answer = await ask(model);
            if (answer.ok || ![400, 404, 429, 500, 503].includes(answer.status)) break search;
            console.warn(`Gemini ${model}: HTTP ${answer.status}, trying the next model`);
        }
    }
    if (answer.ok) chosenModel = model;
    if (!answer.ok) {
        const message = answer.data?.error?.message || `HTTP ${answer.status}`;
        throw Object.assign(new Error(`Gemini could not read the photo: ${message}`), { status: 502 });
    }
    const text = answer.data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
    return { source: "gemini", model, result: cleanResult(text) };
}

module.exports = { readPrescription, cleanResult, DEMO_RESULT };
