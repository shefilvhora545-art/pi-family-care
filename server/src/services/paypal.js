const config = require("../config");

// ==================================================
// PAYPAL (Orders API v2 + Payments API, sandbox)
// ==================================================
// Server-side only: the browser never sees the secret. The amount always
// comes from our database, never from the browser.

let cachedToken = null;

// fetch with a clear message when PayPal cannot be reached (internet hiccup).
async function reach(url, options) {
    try {
        return await fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
    } catch {
        throw Object.assign(new Error("Could not reach PayPal. Check the internet connection and try again."), { status: 503 });
    }
}

function isConfigured() {
    return Boolean(config.paypal.clientId && config.paypal.clientSecret);
}

async function accessToken() {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
        return cachedToken.value;
    }
    const basic = Buffer.from(`${config.paypal.clientId}:${config.paypal.clientSecret}`).toString("base64");
    const response = await reach(`${config.paypal.apiBase}/v1/oauth2/token`, {
        method: "POST",
        headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials"
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) {
        throw Object.assign(new Error("PayPal sign-in failed. Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET (sandbox)."), { status: 502 });
    }
    cachedToken = { value: data.access_token, expiresAt: Date.now() + Number(data.expires_in || 300) * 1000 };
    return cachedToken.value;
}

async function call(method, path, body, requestId) {
    const response = await reach(`${config.paypal.apiBase}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${await accessToken()}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
            ...(requestId ? { "PayPal-Request-Id": requestId } : {})
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const detail = data?.details?.[0]?.description || data?.message || `HTTP ${response.status}`;
        throw Object.assign(new Error(`PayPal: ${detail}`), { status: 502, paypal: data });
    }
    return data;
}

const usd = (value) => Number(value).toFixed(2);

// Creates the PayPal order for one of our orders. lines: [{ name, lineUsd }].
// requestKey makes PayPal-Request-Id unique per order and cart (order ids restart
// at 1 in a fresh database, so the id alone is not enough).
async function createOrder({ orderId, lines, totalUsd, patientName, requestKey }) {
    const itemTotal = lines.reduce((sum, line) => sum + Number(line.lineUsd), 0);
    if (Math.abs(itemTotal - totalUsd) > 0.001) {
        throw Object.assign(new Error("Order total does not match its lines"), { status: 500 });
    }
    return call("POST", "/v2/checkout/orders", {
        intent: "CAPTURE",
        purchase_units: [{
            reference_id: `PIFC-${orderId}`,
            custom_id: String(orderId),
            description: `Medicines for ${patientName} (PI Family Care order #${orderId})`.slice(0, 127),
            amount: {
                currency_code: "USD",
                value: usd(totalUsd),
                breakdown: { item_total: { currency_code: "USD", value: usd(totalUsd) } }
            },
            items: lines.map((line) => ({
                name: line.name.slice(0, 127),
                quantity: "1",
                category: "PHYSICAL_GOODS",
                unit_amount: { currency_code: "USD", value: usd(line.lineUsd) }
            }))
        }],
        application_context: { shipping_preference: "NO_SHIPPING", brand_name: "PI Family Care", user_action: "PAY_NOW" }
    }, `pifc-create-${orderId}-${requestKey}-${usd(totalUsd)}`);
}

// Captures the approved payment. Returns { status, captureId, amount, currency, payerEmail, customId }.
async function captureOrder(paypalOrderId) {
    const data = await call("POST", `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {}, `pifc-capture-${paypalOrderId}`);
    const unit = data.purchase_units?.[0] || {};
    const capture = unit.payments?.captures?.[0] || {};
    return {
        status: data.status,
        captureStatus: capture.status,
        captureId: capture.id,
        amount: capture.amount?.value,
        currency: capture.amount?.currency_code,
        customId: capture.custom_id || unit.custom_id,
        payerEmail: data.payer?.email_address || null
    };
}

// Full refund of a capture (pharmacy could not supply).
async function refundCapture(captureId, orderId) {
    const data = await call("POST", `/v2/payments/captures/${encodeURIComponent(captureId)}/refund`, {
        note_to_payer: `PI Family Care order #${orderId} could not be supplied. Full refund.`.slice(0, 255)
    }, `pifc-refund-${captureId}`);
    return { refundId: data.id, status: data.status };
}

module.exports = { isConfigured, createOrder, captureOrder, refundCapture };
