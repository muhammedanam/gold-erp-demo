# SwarnaERP - Kerala Jewellery ERP System
## Autonomous Agent & Developer Specification (agent.md)

This document defines the core architecture, Kerala jewellery domain rules, data models, calculation engines, and code standards for **SwarnaERP** — a high-performance jewellery retail and wholesale ERP software tailored for the Kerala market.

---

## 1. Kerala Jewellery Domain Specifications

### 1.1 Weight Units & Measurements
- **Gram (g)**: The base metric unit, always recorded up to 3 decimal places (`0.001g` or $1\text{ milligram}$).
- **Pavan / Sovereign**: The universal Kerala benchmark for gold ornaments.
  $$1\text{ Pavan} = 8.000\text{ Grams}$$
- **Gross Weight**: Total weight of the jewellery piece on the electronic balance (gold + stones + enamel + lac).
- **Stone / Enamel Weight**: Weight of embedded diamonds, gemstones, pearls, or enamel beads.
- **Net Weight**: Actual gold weight:
  $$\text{Net Weight} = \text{Gross Weight} - \text{Stone Weight}$$

### 1.2 Purity Standards & BIS Hallmarking
- **22 Karat (916 Hallmarked)**: $91.6\%$ pure gold. Standard for all bridal and traditional Kerala jewellery.
- **24 Karat (999 Fine Gold)**: $99.9\%$ pure bullion / gold bars used for casting and Karigar job-work.
- **18 Karat (750 Hallmarked)**: $75.0\%$ pure gold. Standard for diamond-studded jewellery and daily-wear boutique pieces.
- **HUID (Hallmark Unique Identification)**: A mandatory 6-character alphanumeric code (e.g. `KL916X`, `AB482Z`) assigned by the BIS Assaying & Hallmarking Centre. Every piece in stock must carry a valid HUID.

### 1.3 Pricing & Valuation Mechanics
1. **Metal Price**:
   $$\text{Metal Value} = \text{Net Weight (g)} \times \text{Current 22K/18K Board Rate per gram}$$
2. **Value Addition ($\text{VA}\%$) or Wastage**:
   Kerala jewellers charge making charges either as a percentage of net gold weight or as flat making charges per gram:
   $$\text{Wastage Value} = \text{Net Weight} \times \left(\frac{\text{VA}\%}{100}\right) \times \text{Board Rate per gram}$$
   $$\text{Or Making Charges Total} = \text{Making Charge per gram} \times \text{Gross Weight (or Net Weight)}$$
3. **Stone Charges**:
   $$\text{Stone Value} = \sum (\text{Carats / Weight} \times \text{Rate per carat/gram}) + \text{Studding charges}$$
4. **GST Tax Invoice vs Estimate / Proforma Bill**:
   - **GST Tax Invoice (ടാക്സ് ഇൻവോയ്സ്)**: Mandatory for completed retail sales. Contains Kerala GSTIN (`32...`), HSN Code `7113`, BIS HUID breakdown, SGST 1.5% + CGST 1.5%, Customer PAN (> ₹2,00,000), and statutory buyback/exchange legal warranty.
   - **Estimate / Proforma Invoice (എസ്റ്റിമേറ്റ് / പ്രൊഫോർമ)**: Pre-sale quotation bill for customer negotiation without decrementing stock. Explicitly carries the legal notice: `ESTIMATE / PROFORMA QUOTATION ONLY — THIS IS NOT A GST TAX INVOICE` (`സാധാരണ എസ്റ്റിമേറ്റ് വിവരണം മാത്രം — ഇത് ജി എസ് ടി ടാക്സ് ഇൻവോയ്സ് അല്ല`). Displays indicative 3% GST and quotation validity based on daily board rates.
   $$\text{Taxable Value} = \text{Metal Value} + \text{Wastage/Making Value} + \text{Stone Value}$$
   $$\text{CGST (1.5%)} = \text{Taxable Value} \times 0.015$$
   $$\text{SGST (1.5%)} = \text{Taxable Value} \times 0.015$$
   $$\text{Total Invoice Amount} = \text{Taxable Value} + \text{CGST} + \text{SGST}$$

### 1.4 Old Gold Exchange & Purchase (Trade-In)
- When a customer trades in or sells old jewellery:
  $$\text{Net Melt Weight} = \text{Gross Weight} - \text{Dirt/Enamel/Stone Deduction} - (\text{Gross Weight} \times \text{Melting Loss}\%)$$
  $$\text{Fine Gold Equivalent} = \text{Net Melt Weight} \times \left(\frac{\text{Assayed Purity}\%}{100}\right)$$
  $$\text{Old Gold Credit Amount} = \text{Fine Gold Equivalent} \times \left(\frac{22}{24}\right) \times \text{Old Gold Purchase Board Rate}$$
- The Old Gold Credit value is deducted before net payable collection.

### 1.5 "Swarna Nidhi" Advance Gold Savings / Chit Scheme
- **Weight-Based Scheme**: Monthly payments are immediately converted into gold grams at that day's board rate. Protects customers from gold inflation.
- **Value-Based Scheme**: 11 equal monthly installments; the 12th installment is contributed by the showroom as a bonus upon maturity.
- Customers redeem their accumulated credit against purchases with waiver on making charges/VA up to specified caps.

### 1.6 Karigar (Goldsmith) Dual-Ledger
- Traditional goldsmiths in Thrissur, Kozhikode, and Payyanur receive fine 24K gold bars and return crafted 916 jewellery.
- Track both:
  1. **Metal Ledger**: Pure gold grams issued vs received, allowed melting loss ($0.8\% - 1.2\%$), and unrecovered metal balance.
  2. **Financial Ledger**: Labor and making charges credited to the Karigar vs cash payouts.

---

## 2. Technology Stack & Architectural Principles

### 2.1 Core Stack
- **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons
- **Backend**: Node.js, Express.js (Modular, Service-Oriented)
- **Database**: Supabase (PostgreSQL with RLS, connection pooling, and B-Tree indexes)
- **Persistence Fallback**: Zero-dependency local repository store for immediate offline demonstrations without cloud latency or setup blocks.

### 2.2 Principles for Minimal Code & Maximum Scalability
1. **Single Source of Truth Math Engine (`keralaGoldMath.js`)**:
   - Both client and server share identical pure calculation logic. Zero divergence between billing preview and backend validation.
   - All formulas for Gross-to-Net, Pavan conversion, VA%, Making charges, GST, and Old Gold melt testing are contained in one pure functional module.
2. **Universal Composite Components**:
   - `DataTable`: A single unified table component handles search, column definitions, pagination, and actions across Inventory, Invoices, Old Gold, Chit, and Karigar.
   - `Modal`: Universal accessible dialog shell with standard backdrop, header, body, and action buttons.
   - `StatCard`: Standardized metric cards for board rates, gold stock, and financial balances.
   - `ReceiptInvoice`: Dual-mode printable document (Thermal 3-inch roll receipt or A4/A5 Showroom Tax Invoice with HUID, BIS Hallmark, and GST breakdown).
3. **Atomic Transactions**:
   - POS billing is fully atomic: single transaction writes the invoice, decrements inventory items from `IN_STOCK` to `SOLD`, links old-gold trade-ins, updates chit scheme balances, and creates the daily ledger record.
4. **Sub-Millisecond Query Response & Memory Efficiency**:
   - Strict decimal precision (`DECIMAL(12, 3)` for gram weights; `DECIMAL(14, 2)` for Indian Rupee amounts).
   - Indexed lookups on `barcode`, `huid`, `invoice_no`, `customer_phone`, and `status`.
   - Memoized React calculations to eliminate re-renders during high-speed barcode scanning.

---

## 3. Directory Layout

```
├── agent.md                        # This specification file
├── client/                         # Frontend Application
│   ├── src/
│   │   ├── api/                    # Centralized API service functions
│   │   ├── assets/                 # Showroom logos, hallmark stamps, icons
│   │   ├── components/
│   │   │   ├── common/             # StatCard, Modal, Badge, Button, Input, Table
│   │   │   ├── layout/             # Sidebar, Header, RateTicker, ShowroomDisplayMode
│   │   │   ├── pos/                # FastPOS, BillCart, PaymentModal, InvoiceView
│   │   │   ├── inventory/          # ItemManager, TagPrintModal, HUIDLookup
│   │   │   ├── oldgold/            # OldGoldEvaluator, MeltingCalculator
│   │   │   ├── chit/               # ChitSchemeManager, CustomerPassbook
│   │   │   ├── karigar/            # JobWorkManager, MetalLedger
│   │   │   └── dashboard/          # DailyMetalBalance, SalesChart, TopCategories
│   │   ├── context/                # GoldRateContext, CartContext, NotificationContext
│   │   ├── hooks/                  # useGoldRates, usePOSShortcuts
│   │   ├── utils/                  # keralaGoldMath.js, formatters.js, constants.js
│   │   ├── App.jsx
│   │   └── main.jsx
├── server/                         # Backend Express API
│   ├── src/
│   │   ├── config/                 # DB configuration & constants
│   │   ├── controllers/            # Rates, Products, Invoices, OldGold, Chit, Karigar
│   │   ├── middleware/             # Validation, Error Handling, Request Logger
│   │   ├── routes/                 # Express REST endpoints
│   │   ├── services/               # Tax calculation, Ledger reconciliation, Stock engine
│   │   ├── data/                   # Seed data and mock DB fallback for standalone demo
│   │   └── server.js               # Entry point (port 5000)
├── database/                       # SQL Definitions
│   ├── 01_schema.sql               # Tables, constraints, and indexes
│   └── 02_seed.sql                 # Sample Kerala traditional inventory, rates, and customers
└── package.json                    # Root package scripts
```

---

## 4. Database Schema Specifications

### Core Tables:
1. `gold_rates`:
   - `id`, `rate_date`, `gold_22k_gram`, `gold_22k_pavan`, `gold_24k_gram`, `gold_18k_gram`, `silver_gram`, `silver_kg`, `old_gold_purchase_rate`, `created_at`, `updated_by`.
2. `categories`:
   - `id`, `name` (e.g., Vala/Bangle, Mala/Necklace, Jimikki/Earring, Kasumala, Thali, Ring, Coin, Silverware), `purity`, `default_va_percent`, `hsn_code`.
3. `inventory_items`:
   - `id`, `barcode`, `huid` (Unique 6-char BIS tag), `item_name`, `category_id`, `purity_karat`, `gross_weight_g`, `stone_weight_g`, `net_weight_g`, `stone_value_inr`, `va_percent`, `making_charge_per_g`, `counter_tray`, `status` (`IN_STOCK`, `SOLD`, `ON_APPROVAL`, `KARIGAR_WORK`), `created_at`.
4. `sales_invoices`:
   - `id`, `invoice_no`, `customer_name`, `customer_phone`, `customer_address`, `customer_pan`, `rate_22k_applied`, `subtotal_amount`, `gst_cgst_amount`, `gst_sgst_amount`, `round_off`, `grand_total`, `old_gold_deduction`, `chit_scheme_deduction`, `net_payable`, `payment_modes` (JSONB: cash, upi, card, neft), `status`, `created_at`.
5. `sales_invoice_items`:
   - `id`, `invoice_id`, `inventory_item_id`, `item_name`, `huid`, `gross_weight_g`, `net_weight_g`, `stone_weight_g`, `purity`, `rate_per_g`, `metal_value`, `va_percent`, `making_charge`, `stone_charges`, `taxable_value`, `gst_amount`, `item_total`.
6. `old_gold_receipts`:
   - `id`, `receipt_no`, `customer_name`, `customer_phone`, `gross_weight_g`, `stone_dirt_deduction_g`, `melt_loss_percent`, `net_melt_weight_g`, `purity_percent`, `fine_gold_equivalent_g`, `rate_applied_per_g`, `total_credit_value`, `settlement_type` (`EXCHANGE_DISCOUNT`, `CASH_PAYOUT`), `sales_invoice_id`, `created_at`.
7. `chitty_schemes`:
   - `id`, `scheme_name`, `scheme_type` (`FIXED_WEIGHT`, `MONTHLY_VALUE`), `monthly_amount`, `duration_months`, `bonus_months`, `max_va_discount_percent`, `is_active`.
8. `chitty_accounts`:
   - `id`, `account_no`, `scheme_id`, `customer_name`, `customer_phone`, `customer_aadhaar`, `start_date`, `status` (`ACTIVE`, `MATURED`, `REDEEMED`, `CANCELLED`), `total_weight_accumulated_g`, `total_amount_paid`, `installments_paid`.
9. `karigar_accounts`:
   - `id`, `karigar_name`, `workshop_location` (e.g. Thrissur / Kozhikode), `phone`, `current_pure_gold_balance_g`, `current_cash_balance_inr`.
10. `karigar_transactions`:
    - `id`, `karigar_id`, `type` (`ISSUE_RAW_GOLD`, `RECEIVE_FINISHED_ORNAMENT`, `SETTLE_MAKING_CHARGE`), `gross_weight_g`, `purity`, `fine_weight_g`, `allowed_loss_g`, `actual_loss_g`, `making_charge_inr`, `notes`, `created_at`.

---

## 5. Coding Standards & Performance Rules

1. **Precision in Math**:
   - Always round weights to 3 decimal places: `Number(weight.toFixed(3))`.
   - Always round monetary amounts to 2 decimal places: `Number(amount.toFixed(2))`.
   - For final customer invoices, compute round-off adjustment to the nearest whole rupee (`Math.round(total)`).
2. **Component Reusability**:
   - Clean, modular atomic components with Tailwind CSS.
   - Distinct, zero-clutter visual hierarchy suitable for both counter sales executives and showroom managers.
3. **Optimized API Responses**:
   - Fast responses (< 50ms for local queries).
   - In-memory mock layer alongside PostgreSQL schema so demo runs seamlessly without mandatory remote credentials if offline.
4. **Resilient Error Handling**:
   - Validate HUID format (6 uppercase alphanumeric characters).
   - Validate weight invariants ($\text{Gross Weight} \ge \text{Stone Weight}$).
   - Disallow sales of items not marked `IN_STOCK`.

