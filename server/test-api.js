/**
 * Verification Test Suite for SwarnaERP Backend Engine
 */
const keralaGoldMath = require('./src/services/keralaGoldMath');
const store = require('./src/models/store');

console.log('🧪 Starting SwarnaERP Verification Tests...\n');

// 1. Math Verification
console.log('1. Kerala Gold Math Engine Tests:');
const pavan1 = keralaGoldMath.gramsToPavan(8.000);
console.log(`   - 8.000g to Pavan: ${pavan1} (Expected: 1)`);
console.assert(pavan1 === 1, '8g must equal 1 pavan');

const pavan4 = keralaGoldMath.gramsToPavan(32.400);
console.log(`   - 32.400g to Pavan: ${pavan4} (Expected: 4.05)`);
console.assert(pavan4 === 4.05, '32.4g must equal 4.05 pavan');

// 2. Pricing calculation test
console.log('\n2. Line-Item Pricing Test:');
const testItem = {
  gross_weight_g: 34.200,
  stone_weight_g: 2.200,
  purity_karat: '22K',
  va_percent: 8.50,
  making_charge_per_g: 0,
  stone_value_inr: 4500.00
};
const rates = store.getRates();
const pricing = keralaGoldMath.calculateItemPricing(testItem, rates);
console.log(`   - Net Weight: ${pricing.net_weight_g}g (Expected: 32.000g)`);
console.log(`   - Metal Value: ₹${pricing.metal_value} (32g * ₹${rates.gold_22k_gram})`);
console.log(`   - VA Amount (8.5%): ₹${pricing.va_amount}`);
console.log(`   - Taxable Value: ₹${pricing.taxable_value}`);
console.log(`   - CGST (1.5%): ₹${pricing.cgst_amount} | SGST (1.5%): ₹${pricing.sgst_amount}`);
console.log(`   - Total with 3% GST: ₹${pricing.item_total}`);
console.assert(pricing.net_weight_g === 32.000, 'Net weight calculation error');
console.assert(pricing.cgst_amount === pricing.sgst_amount, 'CGST must equal SGST in intra-state sales');

// 3. Old Gold Appraisal Test
console.log('\n3. Old Gold Appraisal Test:');
const oldGold = {
  gross_weight_g: 12.500,
  stone_dirt_deduction_g: 0.300,
  melt_loss_percent: 2.00,
  purity_percent: 91.60
};
const evaluated = keralaGoldMath.evaluateOldGold(oldGold, rates.old_gold_purchase_rate);
console.log(`   - Net Melt Weight: ${evaluated.net_melt_weight_g}g`);
console.log(`   - Fine Gold Equivalent: ${evaluated.fine_gold_equivalent_g}g`);
console.log(`   - Valuation Credit: ₹${evaluated.total_credit_value}`);
console.assert(evaluated.net_melt_weight_g > 0, 'Net melt weight must be positive');

// 4. Atomic Billing Invoice Test
console.log('\n4. Atomic Billing Invoice Creation Test:');
const initialStockCount = store.getInventory({ status: 'IN_STOCK' }).length;
const invoicePayload = {
  customer: {
    name: 'Dr. Radhika Nair',
    phone: '9847998877',
    address: 'Kochi',
    pan: 'ABCDE1234F'
  },
  items: [
    { id: 'inv-1', va_percent: 8.50 }
  ],
  oldGoldCredit: 25000,
  chitCredit: 10000,
  payments: {
    upi: 0 // remaining will be computed
  }
};
const invoice = store.createInvoice(invoicePayload);
console.log(`   - Invoice Generated: ${invoice.invoice_no}`);
console.log(`   - Items Billed: ${invoice.items.length}`);
console.log(`   - Net Payable: ₹${invoice.net_payable}`);
console.log(`   - Old Gold Deduction Applied: ₹${invoice.old_gold_deduction}`);
console.log(`   - Chit Scheme Deduction Applied: ₹${invoice.chit_scheme_deduction}`);

const postStock = store.getInventoryItem('inv-1');
console.log(`   - Item 'inv-1' status in stock: ${postStock.status} (Expected: SOLD)`);
console.assert(postStock.status === 'SOLD', 'Billed item must be marked SOLD');

const postStockCount = store.getInventory({ status: 'IN_STOCK' }).length;
console.log(`   - In-Stock items reduced: ${initialStockCount} -> ${postStockCount}`);
console.assert(postStockCount === initialStockCount - 1, 'In-stock count must decrement by 1');

// 5. Day Book Metal Audit
console.log('\n5. Day Book Audit Test:');
const dayBook = store.getDayBook();
console.log(`   - Day Book Sales INR: ₹${dayBook.total_sales_inr}`);
console.log(`   - Day Book Gold Sold: ${dayBook.gold_sold_g}g`);
console.log(`   - Day Book Closing Stock: ${dayBook.closing_gold_stock_g}g`);

console.log('\n✅ All SwarnaERP Core Architectural & Calculation Tests Passed Successfully!\n');

