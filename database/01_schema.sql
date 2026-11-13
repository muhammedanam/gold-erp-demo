-- ============================================================================
-- SwarnaERP: Kerala Jewellery ERP Database Schema (Supabase PostgreSQL)
-- Precision: DECIMAL(12, 3) for Grams, DECIMAL(14, 2) for Indian Rupees (INR)
-- ============================================================================

-- 1. DAILY GOLD & SILVER RATES
CREATE TABLE IF NOT EXISTS gold_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    gold_22k_gram DECIMAL(10, 2) NOT NULL, -- e.g. 7150.00
    gold_22k_pavan DECIMAL(10, 2) GENERATED ALWAYS AS (gold_22k_gram * 8) STORED, -- 1 Sovereign = 8g
    gold_24k_gram DECIMAL(10, 2) NOT NULL, -- e.g. 7800.00
    gold_18k_gram DECIMAL(10, 2) NOT NULL, -- e.g. 5850.00
    silver_gram DECIMAL(10, 2) NOT NULL,   -- e.g. 98.00
    silver_kg DECIMAL(10, 2) GENERATED ALWAYS AS (silver_gram * 1000) STORED,
    old_gold_purchase_rate DECIMAL(10, 2) NOT NULL, -- e.g. 6800.00
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCT CATEGORIES (Kerala Traditional & Modern)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    malayalam_name VARCHAR(100),
    purity_karat VARCHAR(10) NOT NULL DEFAULT '22K', -- 22K, 18K, 24K, Silver
    default_va_percent DECIMAL(5, 2) DEFAULT 8.00,
    hsn_code VARCHAR(10) DEFAULT '7113',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INVENTORY ITEMS (HUID, Barcode, Counter & Tray)
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode VARCHAR(50) NOT NULL UNIQUE,
    huid VARCHAR(6) NOT NULL UNIQUE, -- Mandatory 6-character BIS Hallmark Unique ID
    item_name VARCHAR(150) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    purity_karat VARCHAR(10) NOT NULL DEFAULT '22K',
    gross_weight_g DECIMAL(12, 3) NOT NULL CHECK (gross_weight_g > 0),
    stone_weight_g DECIMAL(12, 3) NOT NULL DEFAULT 0.000 CHECK (stone_weight_g >= 0),
    net_weight_g DECIMAL(12, 3) GENERATED ALWAYS AS (gross_weight_g - stone_weight_g) STORED,
    stone_value_inr DECIMAL(14, 2) DEFAULT 0.00,
    va_percent DECIMAL(5, 2) NOT NULL DEFAULT 8.00, -- Value Addition / Wastage %
    making_charge_per_g DECIMAL(10, 2) DEFAULT 0.00,
    counter_tray VARCHAR(50) DEFAULT 'Main Counter - Tray A',
    status VARCHAR(20) NOT NULL DEFAULT 'IN_STOCK' CHECK (status IN ('IN_STOCK', 'SOLD', 'ON_APPROVAL', 'KARIGAR_WORK')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B-Tree Indexes for Instant Search
CREATE INDEX IF NOT EXISTS idx_inventory_barcode ON inventory_items(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_huid ON inventory_items(huid);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_items(status);

-- 4. SALES INVOICES (GST 3% Breakdown, Multi-Tender & Trade-in)
CREATE TABLE IF NOT EXISTS sales_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT,
    customer_pan VARCHAR(20), -- Mandatory for sales > 2 Lakhs INR
    rate_22k_applied DECIMAL(10, 2) NOT NULL,
    total_gross_weight_g DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    total_net_weight_g DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    taxable_amount DECIMAL(14, 2) NOT NULL,
    cgst_amount DECIMAL(14, 2) NOT NULL, -- 1.5%
    sgst_amount DECIMAL(14, 2) NOT NULL, -- 1.5%
    round_off DECIMAL(10, 2) DEFAULT 0.00,
    grand_total DECIMAL(14, 2) NOT NULL,
    old_gold_deduction DECIMAL(14, 2) DEFAULT 0.00,
    chit_scheme_deduction DECIMAL(14, 2) DEFAULT 0.00,
    net_payable DECIMAL(14, 2) NOT NULL,
    payment_modes JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"cash": 10000, "upi": 50000, "card": 0}
    status VARCHAR(20) DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SALES INVOICE ITEMS
CREATE TABLE IF NOT EXISTS sales_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES sales_invoices(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE RESTRICT,
    item_name VARCHAR(150) NOT NULL,
    huid VARCHAR(6) NOT NULL,
    purity_karat VARCHAR(10) NOT NULL,
    gross_weight_g DECIMAL(12, 3) NOT NULL,
    stone_weight_g DECIMAL(12, 3) NOT NULL,
    net_weight_g DECIMAL(12, 3) NOT NULL,
    rate_per_g DECIMAL(10, 2) NOT NULL,
    metal_value DECIMAL(14, 2) NOT NULL,
    va_percent DECIMAL(5, 2) NOT NULL,
    va_amount DECIMAL(14, 2) NOT NULL,
    making_charge DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    stone_charges DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    taxable_value DECIMAL(14, 2) NOT NULL,
    gst_amount DECIMAL(14, 2) NOT NULL,
    item_total DECIMAL(14, 2) NOT NULL
);

-- 6. OLD GOLD EXCHANGE & PURCHASE RECEIPTS
CREATE TABLE IF NOT EXISTS old_gold_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_no VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_id_proof VARCHAR(50),
    description VARCHAR(200) NOT NULL,
    gross_weight_g DECIMAL(12, 3) NOT NULL,
    stone_dirt_deduction_g DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    melt_loss_percent DECIMAL(5, 2) NOT NULL DEFAULT 2.00,
    net_melt_weight_g DECIMAL(12, 3) NOT NULL,
    purity_percent DECIMAL(5, 2) NOT NULL DEFAULT 91.60,
    fine_gold_equivalent_g DECIMAL(12, 3) NOT NULL,
    rate_applied_per_g DECIMAL(10, 2) NOT NULL,
    total_credit_value DECIMAL(14, 2) NOT NULL,
    settlement_type VARCHAR(20) NOT NULL DEFAULT 'EXCHANGE_DISCOUNT', -- EXCHANGE_DISCOUNT or CASH_PAYOUT
    sales_invoice_id UUID REFERENCES sales_invoices(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CHITTY / SWARNA NIDHI SAVINGS SCHEMES
CREATE TABLE IF NOT EXISTS chitty_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_code VARCHAR(20) NOT NULL UNIQUE,
    scheme_name VARCHAR(100) NOT NULL,
    scheme_type VARCHAR(20) NOT NULL DEFAULT 'MONTHLY_VALUE', -- MONTHLY_VALUE or FIXED_WEIGHT
    monthly_installment DECIMAL(10, 2) NOT NULL,
    duration_months INT NOT NULL DEFAULT 11,
    bonus_months INT NOT NULL DEFAULT 1,
    max_va_discount_percent DECIMAL(5, 2) DEFAULT 100.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chitty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passbook_no VARCHAR(50) NOT NULL UNIQUE,
    scheme_id UUID REFERENCES chitty_schemes(id) ON DELETE RESTRICT,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_aadhaar VARCHAR(20),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    installments_paid INT NOT NULL DEFAULT 0,
    total_amount_paid DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    total_gold_accumulated_g DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, MATURED, REDEEMED
    redeemed_invoice_id UUID REFERENCES sales_invoices(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. KARIGAR (GOLDSMITH) DUAL LEDGER
CREATE TABLE IF NOT EXISTS karigar_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    karigar_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    workshop_location VARCHAR(100) NOT NULL, -- e.g. Thrissur, Kozhikode, Cheruvathur
    phone VARCHAR(20) NOT NULL,
    pure_gold_balance_g DECIMAL(12, 3) NOT NULL DEFAULT 0.000, -- Owed metal in fine 24K grams
    cash_balance_inr DECIMAL(14, 2) NOT NULL DEFAULT 0.00,     -- Labor making charges owed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS karigar_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    karigar_id UUID REFERENCES karigar_accounts(id) ON DELETE CASCADE,
    tx_type VARCHAR(30) NOT NULL, -- ISSUE_RAW_GOLD, RECEIVE_FINISHED, CASH_PAYMENT
    item_description VARCHAR(200),
    gross_weight_g DECIMAL(12, 3) DEFAULT 0.000,
    purity_percent DECIMAL(5, 2) DEFAULT 99.90,
    fine_gold_weight_g DECIMAL(12, 3) DEFAULT 0.000,
    allowed_loss_g DECIMAL(12, 3) DEFAULT 0.000,
    actual_loss_g DECIMAL(12, 3) DEFAULT 0.000,
    making_charge_inr DECIMAL(14, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AUDIT & DAY BOOK LEDGER
CREATE TABLE IF NOT EXISTS day_book (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    opening_cash_balance DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    opening_gold_stock_g DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    total_sales_inr DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    gold_sold_g DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    old_gold_inflow_g DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    closing_cash_balance DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    closing_gold_stock_g DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    reconciliation_status VARCHAR(20) DEFAULT 'BALANCED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

