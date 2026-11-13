/**
 * Kerala Jewellery Domain Calculation Engine (keralaGoldMath.js)
 * Single Source of Truth for Pure Gold Math, Pavan conversions, VA%, Making Charges, and 3% GST.
 */

const KERALA_PAVAN_GRAMS = 8.000;
const GST_RATE_PERCENT = 3.00;
const CGST_RATE_PERCENT = 1.50;
const SGST_RATE_PERCENT = 1.50;

/**
 * Converts grams to Kerala sovereign / pavan
 * @param {number} grams 
 * @returns {number} pavans rounded to 3 decimals
 */
function gramsToPavan(grams) {
  if (!grams || isNaN(grams)) return 0;
  return Number((grams / KERALA_PAVAN_GRAMS).toFixed(3));
}

/**
 * Converts pavan to grams
 * @param {number} pavan 
 * @returns {number} grams rounded to 3 decimals
 */
function pavanToGrams(pavan) {
  if (!pavan || isNaN(pavan)) return 0;
  return Number((pavan * KERALA_PAVAN_GRAMS).toFixed(3));
}

/**
 * Resolves the applicable gold/silver board rate for a given purity
 */
function resolveBoardRate(purityKarat, rates) {
  const purity = (purityKarat || '22K').toUpperCase();
  if (purity === '24K' || purity === '999') return Number(rates.gold_24k_gram || 7800);
  if (purity === '18K' || purity === '750') return Number(rates.gold_18k_gram || 5850);
  if (purity.includes('SILVER')) return Number(rates.silver_gram || 98);
  return Number(rates.gold_22k_gram || 7150); // Default to 22K (916)
}

/**
 * Calculates line-item details for an inventory piece at current board rates
 */
function calculateItemPricing(item, rates) {
  const grossWeight = Number(item.gross_weight_g || 0);
  const stoneWeight = Number(item.stone_weight_g || 0);
  const netWeight = Math.max(0, Number((grossWeight - stoneWeight).toFixed(3)));
  const ratePerGram = resolveBoardRate(item.purity_karat, rates);
  
  const metalValue = Number((netWeight * ratePerGram).toFixed(2));
  const vaPercent = Number(item.va_percent || 0);
  const vaAmount = Number(((vaPercent / 100) * metalValue).toFixed(2));
  const makingChargePerG = Number(item.making_charge_per_g || 0);
  const makingChargeTotal = Number((makingChargePerG * grossWeight).toFixed(2));
  const stoneCharges = Number(item.stone_value_inr || 0);

  const taxableValue = Number((metalValue + vaAmount + makingChargeTotal + stoneCharges).toFixed(2));
  const cgstAmount = Number((taxableValue * (CGST_RATE_PERCENT / 100)).toFixed(2));
  const sgstAmount = Number((taxableValue * (SGST_RATE_PERCENT / 100)).toFixed(2));
  const gstAmount = Number((cgstAmount + sgstAmount).toFixed(2));
  const itemTotal = Number((taxableValue + gstAmount).toFixed(2));

  return {
    gross_weight_g: grossWeight,
    stone_weight_g: stoneWeight,
    net_weight_g: netWeight,
    pavan: gramsToPavan(netWeight),
    rate_per_g: ratePerGram,
    metal_value: metalValue,
    va_percent: vaPercent,
    va_amount: vaAmount,
    making_charge: makingChargeTotal,
    stone_charges: stoneCharges,
    taxable_value: taxableValue,
    cgst_amount: cgstAmount,
    sgst_amount: sgstAmount,
    gst_amount: gstAmount,
    item_total: itemTotal
  };
}

/**
 * Evaluates Old Gold appraisal / trade-in valuation
 */
function evaluateOldGold(evaluation, oldGoldPurchaseRate) {
  const grossWeight = Number(evaluation.gross_weight_g || 0);
  const stoneDirt = Number(evaluation.stone_dirt_deduction_g || 0);
  const meltLossPercent = Number(evaluation.melt_loss_percent || 2.0);
  
  const baseWeight = Math.max(0, grossWeight - stoneDirt);
  const meltLossG = Number((baseWeight * (meltLossPercent / 100)).toFixed(3));
  const netMeltWeight = Math.max(0, Number((baseWeight - meltLossG).toFixed(3)));
  
  const purityPercent = Number(evaluation.purity_percent || 91.6);
  const fineGoldEquivalent = Number((netMeltWeight * (purityPercent / 100)).toFixed(3));
  
  // Rate applied for standard 916 old gold
  const ratePerG = Number(oldGoldPurchaseRate || 6800);
  // Adjusted for purity relative to 22K (91.6%)
  const adjustedRate = Number(((purityPercent / 91.6) * ratePerG).toFixed(2));
  const totalCreditValue = Number((netMeltWeight * adjustedRate).toFixed(2));

  return {
    gross_weight_g: grossWeight,
    stone_dirt_deduction_g: stoneDirt,
    melt_loss_percent: meltLossPercent,
    melt_loss_g: meltLossG,
    net_melt_weight_g: netMeltWeight,
    purity_percent: purityPercent,
    fine_gold_equivalent_g: fineGoldEquivalent,
    rate_applied_per_g: adjustedRate,
    total_credit_value: totalCreditValue
  };
}

/**
 * Computes invoice-level totals across multiple line items with credits
 */
function calculateInvoiceTotals(calculatedItems, oldGoldDeduction = 0, chitDeduction = 0) {
  let totalGrossWeight = 0;
  let totalNetWeight = 0;
  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;

  for (const item of calculatedItems) {
    totalGrossWeight += item.gross_weight_g;
    totalNetWeight += item.net_weight_g;
    totalTaxable += item.taxable_value;
    totalCGST += item.cgst_amount;
    totalSGST += item.sgst_amount;
  }

  totalGrossWeight = Number(totalGrossWeight.toFixed(3));
  totalNetWeight = Number(totalNetWeight.toFixed(3));
  totalTaxable = Number(totalTaxable.toFixed(2));
  totalCGST = Number(totalCGST.toFixed(2));
  totalSGST = Number(totalSGST.toFixed(2));

  const totalGST = Number((totalCGST + totalSGST).toFixed(2));
  const grandTotal = Number((totalTaxable + totalGST).toFixed(2));

  const ogCredit = Number(Number(oldGoldDeduction || 0).toFixed(2));
  const chCredit = Number(Number(chitDeduction || 0).toFixed(2));
  const rawPayable = Math.max(0, grandTotal - ogCredit - chCredit);

  const roundedPayable = Math.round(rawPayable);
  const roundOff = Number((roundedPayable - rawPayable).toFixed(2));

  return {
    total_gross_weight_g: totalGrossWeight,
    total_net_weight_g: totalNetWeight,
    total_pavan: gramsToPavan(totalNetWeight),
    taxable_amount: totalTaxable,
    cgst_amount: totalCGST,
    sgst_amount: totalSGST,
    gst_total_amount: totalGST,
    grand_total: grandTotal,
    old_gold_deduction: ogCredit,
    chit_scheme_deduction: chCredit,
    round_off: roundOff,
    net_payable: roundedPayable
  };
}

module.exports = {
  KERALA_PAVAN_GRAMS,
  GST_RATE_PERCENT,
  CGST_RATE_PERCENT,
  SGST_RATE_PERCENT,
  gramsToPavan,
  pavanToGrams,
  resolveBoardRate,
  calculateItemPricing,
  evaluateOldGold,
  calculateInvoiceTotals
};

