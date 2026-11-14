/**
 * High-Performance Client-Side State & Mock Persistence for SwarnaERP
 * Provides instant, zero-latency demonstration data on Vercel, offline, or when backend is unlinked.
 */

import { calculateItemPricing, calculateInvoiceTotals, evaluateOldGold } from '../utils/keralaGoldMath';

const STORAGE_KEY = 'swarna_erp_local_state_v1';

const initialSeed = {
  goldRates: {
    rate_date: new Date().toISOString().split('T')[0],
    gold_22k_gram: 7150.00,
    gold_22k_pavan: 57200.00,
    gold_24k_gram: 7800.00,
    gold_18k_gram: 5850.00,
    silver_gram: 98.00,
    silver_kg: 98000.00,
    old_gold_purchase_rate: 6800.00,
    updated_at: new Date().toISOString()
  },

  categories: [
    { id: 'cat-1', code: 'CAT-MALA', name: 'Necklace / Mala', malayalam_name: 'മാല', purity_karat: '22K', default_va_percent: 8.50, hsn_code: '7113' },
    { id: 'cat-2', code: 'CAT-VALA', name: 'Bangles / Vala', malayalam_name: 'വള', purity_karat: '22K', default_va_percent: 7.00, hsn_code: '7113' },
    { id: 'cat-3', code: 'CAT-JIMIKKI', name: 'Earrings / Jimikki', malayalam_name: 'ജിമിക്കി', purity_karat: '22K', default_va_percent: 9.00, hsn_code: '7113' },
    { id: 'cat-4', code: 'CAT-KASU', name: 'Kasu Mala (Coins)', malayalam_name: 'കാശുമാല', purity_karat: '22K', default_va_percent: 8.00, hsn_code: '7113' },
    { id: 'cat-5', code: 'CAT-THALI', name: 'Thali / Mangalsutra', malayalam_name: 'താലി', purity_karat: '22K', default_va_percent: 6.50, hsn_code: '7113' },
    { id: 'cat-6', code: 'CAT-RING', name: 'Finger Ring', malayalam_name: 'മോതിരം', purity_karat: '22K', default_va_percent: 9.50, hsn_code: '7113' },
    { id: 'cat-7', code: 'CAT-COIN', name: '24K Gold Bar/Coin', malayalam_name: 'സ്വർണ്ണ നാണയം', purity_karat: '24K', default_va_percent: 2.00, hsn_code: '7118' },
    { id: 'cat-8', code: 'CAT-DIAMOND', name: 'Diamond Collection', malayalam_name: 'ഡയമണ്ട്', purity_karat: '18K', default_va_percent: 12.00, hsn_code: '7113' }
  ],

  inventory: [
    {
      id: 'inv-1',
      barcode: 'BAR-KL-91601',
      huid: 'KL916A',
      item_name: 'Traditional Palakka Mala 4 Sovereign',
      category_id: 'cat-1',
      purity_karat: '22K',
      gross_weight_g: 34.200,
      stone_weight_g: 2.200,
      net_weight_g: 32.000,
      stone_value_inr: 4500.00,
      va_percent: 8.50,
      making_charge_per_g: 0.00,
      counter_tray: 'Bridal Counter - Tray 1',
      status: 'IN_STOCK',
      created_at: new Date().toISOString()
    },
    {
      id: 'inv-2',
      barcode: 'BAR-KL-91602',
      huid: 'KL916B',
      item_name: 'Mullamottu Mala (Jasmine Bud) 3 Sov',
      category_id: 'cat-1',
      purity_karat: '22K',
      gross_weight_g: 24.150,
      stone_weight_g: 0.150,
      net_weight_g: 24.000,
      stone_value_inr: 0.00,
      va_percent: 8.00,
      making_charge_per_g: 0.00,
      counter_tray: 'Bridal Counter - Tray 1',
      status: 'IN_STOCK',
      created_at: new Date().toISOString()
    },
    {
      id: 'inv-3',
      barcode: 'BAR-KL-91603',
      huid: 'KL916C',
      item_name: 'Temple Nagapadam Necklace',
      category_id: 'cat-1',
      purity_karat: '22K',
      gross_weight_g: 40.500,
      stone_weight_g: 3.500,
      net_weight_g: 37.000,
      stone_value_inr: 6000.00,
      va_percent: 9.00,
      making_charge_per_g: 0.00,
      counter_tray: 'Heritage Lounge - Tray A',
      status: 'IN_STOCK',
      created_at: new Date().toISOString()
    },
    {
      id: 'inv-4',
      barcode: 'BAR-KL-91604',
      huid: 'KL916D',
      item_name: 'Lakshmi Kasu Mala 5 Sovereign',
      category_id: 'cat-4',
      purity_karat: '22K',
      gross_weight_g: 40.000,
      stone_weight_g: 0.000,
      net_weight_g: 40.000,
      stone_value_inr: 0.00,
      va_percent: 7.50,
      making_charge_per_g: 0.00,
      counter_tray: 'Bridal Counter - Tray 2',
      status: 'IN_STOCK',
      created_at: new Date().toISOString()
    },
    {
      id: 'inv-5',
      barcode: 'BAR-KL-91605',
      huid: 'KL916E',
      item_name: 'Traditional Antique Jimikki Pair',
      category_id: 'cat-3',
      purity_karat: '22K',
      gross_weight_g: 16.300,
      stone_weight_g: 0.300,
      net_weight_g: 16.000,
      stone_value_inr: 800.00,
      va_percent: 9.50,
      making_charge_per_g: 0.00,
      counter_tray: 'Earrings Counter - Tray 4',
      status: 'IN_STOCK',
      created_at: new Date().toISOString()
    },
    {
      id: 'inv-6',
      barcode: 'BAR-KL-91606',
      huid: 'KL916F',
      item_name: 'Elakkathali Bridal Choker',
      category_id: 'cat-1',
      purity_karat: '22K',
      gross_weight_g: 16.000,
      stone_weight_g: 0.000,
      net_weight_g: 16.000,
      stone_value_inr: 0.00,
      va_percent: 8.50,
      making_charge_per_g: 0.00,
      counter_tray: 'Bridal Counter - Tray 3',
      status: 'IN_STOCK',
      created_at: new Date().toISOString()
    },
    {
      id: 'inv-7',
      barcode: 'BAR-KL-91607',
      huid: 'KL916G',
      item_name: 'Kerala Kaapu / Kada Bangle (Pair)',
      category_id: 'cat-2',
      purity_karat: '22K',
      gross_weight_g: 32.000,
      stone_weight_g: 0.000,
      net_weight_g: 32.000,
      stone_value_inr: 0.00,
      va_percent: 7.00,
      making_charge_per_g: 0.00,
      counter_tray: 'Bangles Counter - Tray 1',
      status: 'IN_STOCK',
      created_at: new Date().toISOString()
    },
    {
      id: 'inv-8',
      barcode: 'BAR-KL-91608',
      huid: 'KL916H',
      item_name: 'Gents Signet Ring 916',
      category_id: 'cat-6',
      purity_karat: '22K',
      gross_weight_g: 8.200,
      stone_weight_g: 0.200,
      net_weight_g: 8.000,
      stone_value_inr: 500.00,
      va_percent: 10.00,
      making_charge_per_g: 0.00,
      counter_tray: 'Rings Counter - Tray 2',
      status: 'IN_STOCK',
      created_at: new Date().toISOString()
    },
    {
      id: 'inv-9',
      barcode: 'BAR-KL-91609',
      huid: 'KL916I',
      item_name: '999 Fine Gold Bar 8g (1 Sovereign)',
      category_id: 'cat-7',
      purity_karat: '24K',
      gross_weight_g: 8.000,
      stone_weight_g: 0.000,
      net_weight_g: 8.000,
      stone_value_inr: 0.00,
      va_percent: 1.50,
      making_charge_per_g: 0.00,
      counter_tray: 'Bullion Counter - Vault 1',
      status: 'IN_STOCK',
      created_at: new Date().toISOString()
    },
    {
      id: 'inv-10',
      barcode: 'BAR-KL-91610',
      huid: 'KL916J',
      item_name: 'Diamond Solitaire Ring 18K',
      category_id: 'cat-8',
      purity_karat: '18K',
      gross_weight_g: 4.500,
      stone_weight_g: 0.400,
      net_weight_g: 4.100,
      stone_value_inr: 42000.00,
      va_percent: 12.00,
      making_charge_per_g: 0.00,
      counter_tray: 'Diamond Boutique - Tray D1',
      status: 'IN_STOCK',
      created_at: new Date().toISOString()
    }
  ],

  invoices: [
    {
      id: 'inv-rec-1',
      invoice_no: 'SW-2024-001',
      customer_name: 'Praveen Varma',
      customer_phone: '9847112233',
      customer_address: 'Aluva, Ernakulam, Kerala',
      customer_pan: '',
      rate_22k_applied: 7150.00,
      total_gross_weight_g: 16.300,
      total_net_weight_g: 16.000,
      total_pavan: 2.000,
      taxable_amount: 126140.00,
      cgst_amount: 1892.10,
      sgst_amount: 1892.10,
      round_off: -0.20,
      grand_total: 129924.00,
      old_gold_deduction: 0.00,
      chit_scheme_deduction: 0.00,
      net_payable: 129924.00,
      payment_modes: { upi: 129924.00 },
      status: 'COMPLETED',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      items: [
        {
          item_name: 'Traditional Antique Jimikki Pair',
          huid: 'KL916E',
          purity_karat: '22K',
          gross_weight_g: 16.300,
          stone_weight_g: 0.300,
          net_weight_g: 16.000,
          pavan: 2.000,
          rate_per_g: 7150.00,
          metal_value: 114400.00,
          va_percent: 9.50,
          taxable_value: 126140.00,
          cgst_amount: 1892.10,
          sgst_amount: 1892.10,
          item_total: 129924.00
        }
      ]
    }
  ],

  oldGoldReceipts: [
    {
      id: 'og-1',
      receipt_no: 'OG-2024-101',
      customer_name: 'Smt. Shailaja Ramachandran',
      customer_phone: '9447556677',
      customer_id_proof: 'KL-DRV-9081',
      description: 'Old Broken 22K Bangle (Melt Testing)',
      gross_weight_g: 12.500,
      stone_dirt_deduction_g: 0.300,
      melt_loss_percent: 2.00,
      net_melt_weight_g: 11.956,
      purity_percent: 91.60,
      fine_gold_equivalent_g: 10.952,
      rate_applied_per_g: 6800.00,
      total_credit_value: 81300.00,
      settlement_type: 'EXCHANGE_DISCOUNT',
      created_at: new Date(Date.now() - 43200000).toISOString()
    }
  ],

  chittySchemes: [
    { id: 'sch-1', scheme_code: 'SN-5000', scheme_name: 'Swarna Nidhi 5000 (11+1 Bonus)', scheme_type: 'MONTHLY_VALUE', monthly_installment: 5000.00, duration_months: 11, bonus_months: 1, max_va_discount_percent: 100.00, is_active: true },
    { id: 'sch-2', scheme_code: 'SN-10000', scheme_name: 'Swarna Nidhi 10000 (11+1 Bonus)', scheme_type: 'MONTHLY_VALUE', monthly_installment: 10000.00, duration_months: 11, bonus_months: 1, max_va_discount_percent: 100.00, is_active: true },
    { id: 'sch-3', scheme_code: 'SN-WEIGHT', scheme_name: 'Swarna Suraksha Weight Booking Scheme', scheme_type: 'FIXED_WEIGHT', monthly_installment: 0.00, duration_months: 12, bonus_months: 0, max_va_discount_percent: 80.00, is_active: true }
  ],

  chittyAccounts: [
    {
      id: 'acc-1',
      passbook_no: 'PB-2024-8841',
      scheme_id: 'sch-1',
      scheme_name: 'Swarna Nidhi 5000 (11+1 Bonus)',
      customer_name: 'Smt. Lakshmi Menon',
      customer_phone: '9847012345',
      customer_aadhaar: 'XXXX-XXXX-4812',
      start_date: '2023-12-01',
      installments_paid: 11,
      total_amount_paid: 55000.00,
      total_gold_accumulated_g: 7.820,
      status: 'MATURED',
      bonus_amount: 5000.00,
      total_maturity_value: 60000.00
    },
    {
      id: 'acc-2',
      passbook_no: 'PB-2024-9120',
      scheme_id: 'sch-2',
      scheme_name: 'Swarna Nidhi 10000 (11+1 Bonus)',
      customer_name: 'Sri. Dileep Kumar',
      customer_phone: '9447123456',
      customer_aadhaar: 'XXXX-XXXX-9901',
      start_date: '2024-05-01',
      installments_paid: 6,
      total_amount_paid: 60000.00,
      total_gold_accumulated_g: 8.450,
      status: 'ACTIVE',
      bonus_amount: 0.00,
      total_maturity_value: 60000.00
    }
  ],

  karigarAccounts: [
    {
      id: 'krg-1',
      karigar_code: 'KRG-TSR-01',
      name: 'Viswanathan Achari & Sons',
      workshop_location: 'Chembukkavu, Thrissur',
      phone: '9846054321',
      pure_gold_balance_g: 42.500,
      cash_balance_inr: 18500.00
    },
    {
      id: 'krg-2',
      karigar_code: 'KRG-CLT-02',
      name: 'Kozhikode Heritage Goldsmiths',
      workshop_location: 'Mithai Theruvu (SM Street), Kozhikode',
      phone: '9446098765',
      pure_gold_balance_g: 18.200,
      cash_balance_inr: 9200.00
    }
  ],

  karigarTransactions: [
    {
      id: 'ktx-1',
      karigar_id: 'krg-1',
      tx_type: 'ISSUE_RAW_GOLD',
      item_description: '24K Fine Gold Bar for Kasumala Crafting',
      gross_weight_g: 50.000,
      purity_percent: 99.90,
      fine_gold_weight_g: 49.950,
      allowed_loss_g: 0.500,
      actual_loss_g: 0.000,
      making_charge_inr: 0.00,
      notes: 'Order #ORD-771: Due in 7 working days',
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ],

  dayBook: {
    entry_date: new Date().toISOString().split('T')[0],
    opening_cash_balance: 150000.00,
    opening_gold_stock_g: 1250.400,
    total_sales_inr: 129924.00,
    gold_sold_g: 16.000,
    old_gold_inflow_g: 11.956,
    closing_cash_balance: 279924.00,
    closing_gold_stock_g: 1246.356,
    reconciliation_status: 'PERFECT_MATCH'
  }
};

function getLocalData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
  return initialSeed;
}

function saveLocalData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

export const clientStore = {
  getRates: () => {
    const state = getLocalData();
    return state.goldRates;
  },

  updateRates: (newRates) => {
    const state = getLocalData();
    const rate22k = Number(newRates.gold_22k_gram);
    state.goldRates = {
      ...state.goldRates,
      ...newRates,
      gold_22k_gram: rate22k,
      gold_22k_pavan: rate22k * 8.0,
      gold_24k_gram: Number(newRates.gold_24k_gram || rate22k * (24 / 22)),
      gold_18k_gram: Number(newRates.gold_18k_gram || rate22k * (18 / 22)),
      silver_gram: Number(newRates.silver_gram || 98),
      silver_kg: Number(newRates.silver_gram || 98) * 1000,
      old_gold_purchase_rate: Number(newRates.old_gold_purchase_rate || rate22k - 350),
      updated_at: new Date().toISOString()
    };
    saveLocalData(state);
    return state.goldRates;
  },

  getCategories: () => {
    const state = getLocalData();
    return state.categories;
  },

  getInventory: (query = {}) => {
    const state = getLocalData();
    let items = state.inventory;
    if (query.status) {
      items = items.filter(i => i.status === query.status);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(i => 
        i.barcode.toLowerCase().includes(s) ||
        i.huid.toLowerCase().includes(s) ||
        i.item_name.toLowerCase().includes(s)
      );
    }
    return items;
  },

  getInventoryItem: (code) => {
    const state = getLocalData();
    return state.inventory.find(i => 
      i.id === code || 
      i.barcode.toUpperCase() === code.toUpperCase() ||
      i.huid.toUpperCase() === code.toUpperCase()
    );
  },

  addInventoryItem: (itemData) => {
    const state = getLocalData();
    const gross = Number(itemData.gross_weight_g || 0);
    const stone = Number(itemData.stone_weight_g || 0);
    const net = Math.max(0, Number((gross - stone).toFixed(3)));
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const huid = itemData.huid ? itemData.huid.toUpperCase().trim() : `KL${randomHex.substring(0, 4)}`;

    const newItem = {
      id: `inv-${Date.now()}`,
      barcode: itemData.barcode || `BAR-KL-${Date.now().toString().slice(-5)}`,
      huid: huid,
      item_name: itemData.item_name,
      category_id: itemData.category_id || 'cat-1',
      purity_karat: itemData.purity_karat || '22K',
      gross_weight_g: gross,
      stone_weight_g: stone,
      net_weight_g: net,
      stone_value_inr: Number(itemData.stone_value_inr || 0),
      va_percent: Number(itemData.va_percent || 8.0),
      making_charge_per_g: Number(itemData.making_charge_per_g || 0),
      counter_tray: itemData.counter_tray || 'Main Counter - Tray A',
      status: 'IN_STOCK',
      created_at: new Date().toISOString()
    };
    state.inventory.unshift(newItem);
    saveLocalData(state);
    return newItem;
  },

  createInvoice: (payload) => {
    const state = getLocalData();
    const rates = state.goldRates;
    const { customer, items, oldGoldCredit = 0, chitCredit = 0, payments = {} } = payload;

    const pricedItems = [];
    const itemIdsToMarkSold = [];

    for (const itemReq of items) {
      const stockItem = state.inventory.find(i => i.id === itemReq.id);
      if (!stockItem) continue;

      const effectiveItem = {
        ...stockItem,
        va_percent: itemReq.va_percent !== undefined ? Number(itemReq.va_percent) : stockItem.va_percent,
        making_charge_per_g: itemReq.making_charge_per_g !== undefined ? Number(itemReq.making_charge_per_g) : stockItem.making_charge_per_g
      };

      const pricing = calculateItemPricing(effectiveItem, rates);
      pricedItems.push({
        inventory_item_id: stockItem.id,
        item_name: stockItem.item_name,
        huid: stockItem.huid,
        purity_karat: stockItem.purity_karat,
        ...pricing
      });

      itemIdsToMarkSold.push(stockItem.id);
    }

    const totals = calculateInvoiceTotals(pricedItems, oldGoldCredit, chitCredit);
    const invoiceNo = `SW-${new Date().getFullYear()}-${String(state.invoices.length + 101).padStart(4, '0')}`;
    
    const newInvoice = {
      id: `inv-rec-${Date.now()}`,
      invoice_no: invoiceNo,
      customer_name: customer.name || 'Walk-in Customer',
      customer_phone: customer.phone || '9999999999',
      customer_address: customer.address || 'Kerala',
      customer_pan: customer.pan || '',
      rate_22k_applied: rates.gold_22k_gram,
      ...totals,
      payment_modes: payments,
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
      items: pricedItems
    };

    state.inventory = state.inventory.map(item => {
      if (itemIdsToMarkSold.includes(item.id)) {
        return { ...item, status: 'SOLD', updated_at: new Date().toISOString() };
      }
      return item;
    });

    state.invoices.unshift(newInvoice);
    state.dayBook.gold_sold_g += totals.total_net_weight_g;
    state.dayBook.closing_gold_stock_g -= totals.total_net_weight_g;
    state.dayBook.total_sales_inr += totals.net_payable;
    state.dayBook.closing_cash_balance += totals.net_payable;

    saveLocalData(state);
    return newInvoice;
  },

  getInvoices: () => {
    const state = getLocalData();
    return state.invoices;
  },

  getInvoiceById: (id) => {
    const state = getLocalData();
    return state.invoices.find(inv => inv.id === id || inv.invoice_no === id);
  },

  getOldGoldReceipts: () => {
    const state = getLocalData();
    return state.oldGoldReceipts;
  },

  createOldGoldReceipt: (evalData) => {
    const state = getLocalData();
    const rates = state.goldRates;
    const evaluated = evaluateOldGold(evalData, rates.old_gold_purchase_rate);
    const receiptNo = `OG-${new Date().getFullYear()}-${String(state.oldGoldReceipts.length + 101).padStart(4, '0')}`;

    const receipt = {
      id: `og-${Date.now()}`,
      receipt_no: receiptNo,
      customer_name: evalData.customer_name || 'Customer',
      customer_phone: evalData.customer_phone || '',
      customer_id_proof: evalData.customer_id_proof || '',
      description: evalData.description || 'Old Gold Ornaments (Assayed)',
      ...evaluated,
      settlement_type: evalData.settlement_type || 'EXCHANGE_DISCOUNT',
      created_at: new Date().toISOString()
    };

    state.oldGoldReceipts.unshift(receipt);
    state.dayBook.old_gold_inflow_g += receipt.net_melt_weight_g;
    state.dayBook.closing_gold_stock_g += receipt.net_melt_weight_g;
    saveLocalData(state);
    return receipt;
  },

  getChittySchemes: () => {
    const state = getLocalData();
    return state.chittySchemes;
  },

  getChittyAccounts: () => {
    const state = getLocalData();
    return state.chittyAccounts;
  },

  payChittyInstallment: ({ accountId, amount }) => {
    const state = getLocalData();
    const acc = state.chittyAccounts.find(a => a.id === accountId);
    if (!acc) throw new Error('Chit account not found');

    const rates = state.goldRates;
    const addedAmount = Number(amount || acc.total_amount_paid / (acc.installments_paid || 1));
    acc.installments_paid += 1;
    acc.total_amount_paid += addedAmount;
    
    const gramsGained = Number((addedAmount / rates.gold_22k_gram).toFixed(3));
    acc.total_gold_accumulated_g = Number((acc.total_gold_accumulated_g + gramsGained).toFixed(3));

    if (acc.installments_paid >= 11) {
      acc.status = 'MATURED';
      acc.bonus_amount = addedAmount;
      acc.total_maturity_value = acc.total_amount_paid + acc.bonus_amount;
    }
    saveLocalData(state);
    return acc;
  },

  getKarigarAccounts: () => {
    const state = getLocalData();
    return state.karigarAccounts;
  },

  getKarigarTransactions: (karigarId) => {
    const state = getLocalData();
    if (!karigarId) return state.karigarTransactions;
    return state.karigarTransactions.filter(tx => tx.karigar_id === karigarId);
  },

  recordKarigarTx: (txPayload) => {
    const state = getLocalData();
    const karigar = state.karigarAccounts.find(k => k.id === txPayload.karigar_id);
    if (!karigar) throw new Error('Karigar account not found');

    const gross = Number(txPayload.gross_weight_g || 0);
    const purity = Number(txPayload.purity_percent || 99.9);
    const fineWeight = Number(((gross * purity) / 100).toFixed(3));
    const makingCharge = Number(txPayload.making_charge_inr || 0);

    const tx = {
      id: `ktx-${Date.now()}`,
      karigar_id: txPayload.karigar_id,
      tx_type: txPayload.tx_type,
      item_description: txPayload.item_description || '',
      gross_weight_g: gross,
      purity_percent: purity,
      fine_gold_weight_g: fineWeight,
      allowed_loss_g: Number(txPayload.allowed_loss_g || 0),
      actual_loss_g: Number(txPayload.actual_loss_g || 0),
      making_charge_inr: makingCharge,
      notes: txPayload.notes || '',
      created_at: new Date().toISOString()
    };

    if (tx.tx_type === 'ISSUE_RAW_GOLD') {
      karigar.pure_gold_balance_g += fineWeight;
    } else if (tx.tx_type === 'RECEIVE_FINISHED') {
      karigar.pure_gold_balance_g -= fineWeight;
      karigar.cash_balance_inr += makingCharge;
    } else if (tx.tx_type === 'CASH_PAYMENT') {
      karigar.cash_balance_inr -= makingCharge;
    }

    karigar.pure_gold_balance_g = Number(karigar.pure_gold_balance_g.toFixed(3));
    karigar.cash_balance_inr = Number(karigar.cash_balance_inr.toFixed(2));

    state.karigarTransactions.unshift(tx);
    saveLocalData(state);
    return { transaction: tx, karigar };
  },

  getDayBook: () => {
    const state = getLocalData();
    return state.dayBook;
  }
};

