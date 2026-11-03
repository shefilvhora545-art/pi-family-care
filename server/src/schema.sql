-- PI Family Care database (PostgreSQL). Safe to run again.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- People who sign in: a family member abroad, or a pharmacy in India.
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    role VARCHAR(10) NOT NULL CHECK (role IN ('family', 'pharmacy')),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    country VARCHAR(60),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pharmacies (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    name VARCHAR(120) NOT NULL,
    city VARCHAR(80) NOT NULL,
    address VARCHAR(300) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    drug_licence VARCHAR(40) NOT NULL
);

-- The medicine list (shared). price_inr = MRP of one pack.
CREATE TABLE IF NOT EXISTS medicines (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    salt VARCHAR(250),
    maker VARCHAR(150),
    pack VARCHAR(120),
    category VARCHAR(60),
    uses TEXT,
    prescription_required BOOLEAN NOT NULL DEFAULT false,
    price_inr NUMERIC(10,2) NOT NULL CHECK (price_inr > 0)
);

CREATE INDEX IF NOT EXISTS medicines_name_trgm ON medicines USING gin (lower(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS medicines_salt_idx ON medicines (lower(salt));

-- What each pharmacy has on its shelf.
CREATE TABLE IF NOT EXISTS pharmacy_stock (
    pharmacy_id BIGINT NOT NULL REFERENCES pharmacies(id),
    medicine_id BIGINT NOT NULL REFERENCES medicines(id),
    packs INTEGER NOT NULL DEFAULT 0 CHECK (packs >= 0),
    PRIMARY KEY (pharmacy_id, medicine_id)
);

-- One order = one prescription for one parent, paid by the family abroad.
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    family_user_id BIGINT NOT NULL REFERENCES users(id),
    pharmacy_id BIGINT NOT NULL REFERENCES pharmacies(id),
    patient_name VARCHAR(100) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    delivery_address VARCHAR(300) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN
        ('draft', 'paid', 'accepted', 'packed', 'out_for_delivery', 'delivered', 'refunded')),
    total_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
    inr_per_usd NUMERIC(10,4) NOT NULL,
    prescription_image BYTEA,
    prescription_mime VARCHAR(30),
    ai_source VARCHAR(10) CHECK (ai_source IN ('gemini', 'demo')),
    ai_result JSONB,
    refill_on DATE,
    paypal_order_id VARCHAR(40) UNIQUE,
    paypal_capture_id VARCHAR(40) UNIQUE,
    paypal_refund_id VARCHAR(40),
    payer_email VARCHAR(200),
    delivery_code CHAR(4),
    cancel_reason VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS orders_family_idx ON orders (family_user_id, id DESC);
CREATE INDEX IF NOT EXISTS orders_pharmacy_idx ON orders (pharmacy_id, status, id DESC);

CREATE TABLE IF NOT EXISTS order_lines (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    medicine_id BIGINT NOT NULL REFERENCES medicines(id),
    -- What the AI read on the prescription for this line.
    read_as VARCHAR(200),
    dosage VARCHAR(120),
    packs INTEGER NOT NULL CHECK (packs BETWEEN 1 AND 50),
    price_inr NUMERIC(10,2) NOT NULL,
    line_inr NUMERIC(12,2) NOT NULL,
    line_usd NUMERIC(12,2) NOT NULL,
    -- Set when the family accepted a cheaper same-salt brand.
    switched_from_id BIGINT REFERENCES medicines(id)
);

-- Every step of an order, for the timeline.
CREATE TABLE IF NOT EXISTS order_events (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    note VARCHAR(300),
    at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessions (express-session).
CREATE TABLE IF NOT EXISTS user_sessions (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS user_sessions_expire_idx ON user_sessions (expire);
