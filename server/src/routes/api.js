const express = require('express');
const router = express.Router();
const store = require('../models/store');
const keralaGoldMath = require('../services/keralaGoldMath');

// ==========================================
// 1. LIVE GOLD & SILVER RATES
// ==========================================
router.get('/rates', (req, res) => {
  try {
    const rates = store.getRates();
    res.json({ success: true, data: rates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/rates', (req, res) => {
  try {
    const updated = store.updateRates(req.body);
    res.json({ success: true, message: 'Gold board rates updated', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. PRODUCT CATEGORIES
// ==========================================
router.get('/categories', (req, res) => {
  try {
    res.json({ success: true, data: store.getCategories() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. INVENTORY & HUID
// ==========================================
router.get('/inventory', (req, res) => {
  try {
    const items = store.getInventory(req.query);
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/inventory/:code', (req, res) => {
  try {
    const item = store.getInventoryItem(req.params.code);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found with this Barcode or HUID' });
    }
    // Return with live dynamic pricing attached
    const rates = store.getRates();
    const pricing = keralaGoldMath.calculateItemPricing(item, rates);
    res.json({ success: true, data: { ...item, live_pricing: pricing } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/inventory', (req, res) => {
  try {
    const newItem = store.addInventoryItem(req.body);
    res.status(201).json({ success: true, message: 'Inventory item tagged successfully', data: newItem });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. POS BILLING & CALCULATION ENGINE
// ==========================================
router.post('/calculate-preview', (req, res) => {
  try {
    const rates = store.getRates();
    const { items = [], oldGoldCredit = 0, chitCredit = 0 } = req.body;
    
    const pricedItems = items.map(it => {
      const pricing = keralaGoldMath.calculateItemPricing(it, rates);
      return { ...it, ...pricing };
    });

    const totals = keralaGoldMath.calculateInvoiceTotals(pricedItems, oldGoldCredit, chitCredit);
    res.json({ success: true, data: { items: pricedItems, totals } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/invoices', (req, res) => {
  try {
    const invoice = store.createInvoice(req.body);
    res.status(201).json({ success: true, message: 'Invoice generated successfully', data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/invoices', (req, res) => {
  try {
    res.json({ success: true, data: store.getInvoices() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/invoices/:id', (req, res) => {
  try {
    const invoice = store.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. OLD GOLD EXCHANGE & VALUATION
// ==========================================
router.get('/old-gold', (req, res) => {
  try {
    res.json({ success: true, data: store.getOldGoldReceipts() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/old-gold', (req, res) => {
  try {
    const receipt = store.createOldGoldReceipt(req.body);
    res.status(201).json({ success: true, message: 'Old gold valuation recorded', data: receipt });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. SWARNA NIDHI CHIT SAVINGS SCHEMES
// ==========================================
router.get('/chitty/schemes', (req, res) => {
  try {
    res.json({ success: true, data: store.getChittySchemes() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/chitty/accounts', (req, res) => {
  try {
    res.json({ success: true, data: store.getChittyAccounts() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/chitty/pay', (req, res) => {
  try {
    const { accountId, amount } = req.body;
    const account = store.payChittyInstallment(accountId, amount);
    res.json({ success: true, message: 'Chit installment recorded in passbook', data: account });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. KARIGAR (GOLDSMITH) DUAL LEDGER
// ==========================================
router.get('/karigar/accounts', (req, res) => {
  try {
    res.json({ success: true, data: store.getKarigarAccounts() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/karigar/transactions', (req, res) => {
  try {
    const txs = store.getKarigarTransactions(req.query.karigarId);
    res.json({ success: true, data: txs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/karigar/transactions', (req, res) => {
  try {
    const result = store.recordKarigarTx(req.body);
    res.status(201).json({ success: true, message: 'Karigar ledger updated', data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. DAY BOOK & RECONCILIATION
// ==========================================
router.get('/reports/day-book', (req, res) => {
  try {
    res.json({ success: true, data: store.getDayBook() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

