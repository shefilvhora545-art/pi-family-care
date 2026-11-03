// Small helper for talking to the server. Every error becomes a plain message.
async function request(method, url, body) {
    const options = { method, credentials: "same-origin", headers: {} };
    if (body instanceof FormData) {
        options.body = body;
    } else if (body !== undefined) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }
    let response;
    try {
        response = await fetch(url, options);
    } catch {
        throw new Error("Could not reach the server. Is it running?");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(data.message || `Request failed (${response.status})`), { status: response.status });
    return data;
}

export const api = {
    get: (url) => request("GET", url),
    post: (url, body) => request("POST", url, body ?? {}),
    put: (url, body) => request("PUT", url, body)
};

export const go = (path) => { window.location.hash = path; };

export const usd =(value) => `$${Number(value || 0).toFixed(2)}`;
export const inr = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const STATUS = {
    draft: { label: "Not paid yet", tone: "grey" },
    paid: { label: "Paid", tone: "blue" },
    accepted: { label: "Accepted", tone: "blue" },
    packed: { label: "Packed", tone: "violet" },
    out_for_delivery: { label: "Out for delivery", tone: "amber" },
    delivered: { label: "Delivered", tone: "green" },
    refunded: { label: "Refunded", tone: "red" }
};

export const when = (value) => (value ? new Date(value).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
export const day = (value) => (value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "");
