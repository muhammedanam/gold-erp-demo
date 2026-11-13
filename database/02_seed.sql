-- ============================================================================
-- SwarnaERP: Authentic Kerala Jewellery Seed Data
-- ============================================================================

-- Initial Daily Gold Rates (Kerala Market Benchmark)
INSERT INTO gold_rates (rate_date, gold_22k_gram, gold_24k_gram, gold_18k_gram, silver_gram, old_gold_purchase_rate)
VALUES (CURRENT_DATE, 7150.00, 7800.00, 5850.00, 98.00, 6800.00)
ON CONFLICT (rate_date) DO NOTHING;

-- Product Categories
INSERT INTO categories (id, code, name, malayalam_name, purity_karat, default_va_percent, hsn_code) VALUES
('c1000000-0000-0000-0000-000000000001', 'CAT-MALA', 'Necklace / Mala', 'മാല', '22K', 8.50, '7113'),
('c1000000-0000-0000-0000-000000000002', 'CAT-VALA', 'Bangles / Vala', 'വള', '22K', 7.00, '7113'),
('c1000000-0000-0000-0000-000000000003', 'CAT-JIMIKKI', 'Earrings / Jimikki', 'ജിമിക്കി / കമ്മൽ', '22K', 9.00, '7113'),
('c1000000-0000-0000-0000-000000000004', 'CAT-KASU', 'Kasu Mala (Coins)', 'കാശുമാല', '22K', 8.00, '7113'),
('c1000000-0000-0000-0000-000000000005', 'CAT-THALI', 'Thali / Mangalsutra', 'താലി', '22K', 6.50, '7113'),
('c1000000-0000-0000-0000-000000000006', 'CAT-RING', 'Finger Ring', 'മോതിരം', '22K', 9.50, '7113'),
('c1000000-0000-0000-0000-000000000007', 'CAT-COIN', '24K Gold Coin', 'സ്വർണ്ണ നാണയം', '24K', 2.00, '7118'),
('c1000000-0000-0000-0000-000000000008', 'CAT-DIAMOND', 'Diamond Necklace', 'ഡയമണ്ട് നെക്ലസ്', '18K', 12.00, '7113')
ON CONFLICT (code) DO NOTHING;

-- Authentic Kerala Jewellery Inventory
INSERT INTO inventory_items (id, barcode, huid, item_name, category_id, purity_karat, gross_weight_g, stone_weight_g, stone_value_inr, va_percent, making_charge_per_g, counter_tray, status) VALUES
('i1000000-0000-0000-0000-000000000001', 'BAR-KL-91601', 'KL916A', 'Traditional Palakka Mala 4 Sovereign', 'c1000000-0000-0000-0000-000000000001', '22K', 34.200, 2.200, 4500.00, 8.50, 0.00, 'Bridal Counter - Tray 1', 'IN_STOCK'),
('i1000000-0000-0000-0000-000000000002', 'BAR-KL-91602', 'KL916B', 'Mullamottu Mala (Jasmine Bud) 3 Sov', 'c1000000-0000-0000-0000-000000000001', '22K', 24.150, 0.150, 0.00, 8.00, 0.00, 'Bridal Counter - Tray 1', 'IN_STOCK'),
('i1000000-0000-0000-0000-000000000003', 'BAR-KL-91603', 'KL916C', 'Temple Nagapadam Necklace', 'c1000000-0000-0000-0000-000000000001', '22K', 40.500, 3.500, 6000.00, 9.00, 0.00, 'Heritage Lounge - Tray A', 'IN_STOCK'),
('i1000000-0000-0000-0000-000000000004', 'BAR-KL-91604', 'KL916D', 'Lakshmi Kasu Mala 5 Sovereign', 'c1000000-0000-0000-0000-000000000004', '22K', 40.000, 0.000, 0.00, 7.50, 0.00, 'Bridal Counter - Tray 2', 'IN_STOCK'),
('i1000000-0000-0000-0000-000000000005', 'BAR-KL-91605', 'KL916E', 'Traditional Antique Jimikki Pair', 'c1000000-0000-0000-0000-000000000003', '22K', 16.300, 0.300, 800.00, 9.50, 0.00, 'Earrings Counter - Tray 4', 'IN_STOCK'),
('i1000000-0000-0000-0000-000000000006', 'BAR-KL-91606', 'KL916F', 'Elakkathali Bridal Choker', 'c1000000-0000-0000-0000-000000000001', '22K', 16.000, 0.000, 0.00, 8.50, 0.00, 'Bridal Counter - Tray 3', 'IN_STOCK'),
('i1000000-0000-0000-0000-000000000007', 'BAR-KL-91607', 'KL916G', 'Kerala Kaapu / Kada Bangle (Pair)', 'c1000000-0000-0000-0000-000000000002', '22K', 32.000, 0.000, 0.00, 7.00, 0.00, 'Bangles Counter - Tray 1', 'IN_STOCK'),
('i1000000-0000-0000-0000-000000000008', 'BAR-KL-91608', 'KL916H', 'Gents Signet Ring 916', 'c1000000-0000-0000-0000-000000000006', '22K', 8.200, 0.200, 500.00, 10.00, 0.00, 'Rings Counter - Tray 2', 'IN_STOCK'),
('i1000000-0000-0000-0000-000000000009', 'BAR-KL-91609', 'KL916I', '999 Fine Gold Bar 8g (1 Sovereign)', 'c1000000-0000-0000-0000-000000000007', '24K', 8.000, 0.000, 0.00, 1.50, 0.00, 'Bullion Counter - Vault 1', 'IN_STOCK'),
('i1000000-0000-0000-0000-000000000010', 'BAR-KL-91610', 'KL916J', 'Diamond Solitaire Ring 18K', 'c1000000-0000-0000-0000-000000000008', '18K', 4.500, 0.400, 42000.00, 12.00, 0.00, 'Diamond Boutique - Tray D1', 'IN_STOCK')
ON CONFLICT (barcode) DO NOTHING;

-- Chit Schemes (Swarna Nidhi)
INSERT INTO chitty_schemes (id, scheme_code, scheme_name, scheme_type, monthly_installment, duration_months, bonus_months, max_va_discount_percent) VALUES
('s1000000-0000-0000-0000-000000000001', 'SN-5000', 'Swarna Nidhi 5000 (11+1 Bonus)', 'MONTHLY_VALUE', 5000.00, 11, 1, 100.00),
('s1000000-0000-0000-0000-000000000002', 'SN-10000', 'Swarna Nidhi 10000 (11+1 Bonus)', 'MONTHLY_VALUE', 10000.00, 11, 1, 100.00),
('s1000000-0000-0000-0000-000000000003', 'SN-WEIGHT', 'Swarna Suraksha Weight Booking Scheme', 'FIXED_WEIGHT', 0.00, 12, 0, 80.00)
ON CONFLICT (scheme_code) DO NOTHING;

-- Active Chit Passbook Accounts
INSERT INTO chitty_accounts (id, passbook_no, scheme_id, customer_name, customer_phone, start_date, installments_paid, total_amount_paid, total_gold_accumulated_g, status) VALUES
('a1000000-0000-0000-0000-000000000001', 'PB-2024-8841', 's1000000-0000-0000-0000-000000000001', 'Smt. Lakshmi Menon', '9847012345', CURRENT_DATE - INTERVAL '11 MONTH', 11, 55000.00, 7.820, 'MATURED'),
('a1000000-0000-0000-0000-000000000002', 'PB-2024-9120', 's1000000-0000-0000-0000-000000000002', 'Sri. Dileep Kumar', '9447123456', CURRENT_DATE - INTERVAL '6 MONTH', 6, 60000.00, 8.450, 'ACTIVE')
ON CONFLICT (passbook_no) DO NOTHING;

-- Karigar Accounts (Thrissur Traditional Goldsmiths)
INSERT INTO karigar_accounts (id, karigar_code, name, workshop_location, phone, pure_gold_balance_g, cash_balance_inr) VALUES
('k1000000-0000-0000-0000-000000000001', 'KRG-TSR-01', 'Viswanathan Achari & Sons', 'Chembukkavu, Thrissur', '9846054321', 42.500, 18500.00),
('k1000000-0000-0000-0000-000000000002', 'KRG-CLT-02', 'Kozhikode Heritage Goldsmiths', 'Mithai Theruvu (SM Street), Kozhikode', '9446098765', 18.200, 9200.00)
ON CONFLICT (karigar_code) DO NOTHING;

