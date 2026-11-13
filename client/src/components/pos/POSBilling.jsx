import React, { useState, useEffect, useMemo } from 'react';
import { useGoldRates } from '../../context/GoldRateContext';
import { getInventory, createInvoice } from '../../api';
import { calculateItemPricing, calculateInvoiceTotals } from '../../utils/keralaGoldMath';
import { formatINR, formatWeight, formatPavan } from '../../utils/formatters';
import { ReceiptInvoice } from './ReceiptInvoice';
import { Modal } from '../common/Modal';
import { 
  Barcode, 
  Search, 
  Trash2, 
  Plus, 
  CreditCard, 
  Wallet, 
  Coins, 
  ArrowRight, 
  Printer, 
  Receipt, 
  Sparkles, 
  AlertCircle, 
  FileCheck,
  FileText
} from 'lucide-react';

export function POSBilling() {
  const { rates } = useGoldRates();
  const [stockItems, setStockItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart
  const [cart, setCart] = useState([]);
  
  // Customer Details
  const [customer, setCustomer] = useState({
    name: 'Anjali Nair',
    phone: '9847012345',
    address: 'Kaloor, Kochi, Kerala',
    pan: ''
  });

  // Deductions
  const [oldGoldCredit, setOldGoldCredit] = useState(0);
  const [chitCredit, setChitCredit] = useState(0);

  // Split Payments
  const [payments, setPayments] = useState({
    cash: 0,
    upi: 0,
    card: 0,
    neft: 0
  });

  // Modals & States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [isGeneratedEstimate, setIsGeneratedEstimate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEstimateMode, setIsEstimateMode] = useState(false);

  // Instant Estimate Generation without committing sale
  const handleGenerateEstimate = () => {
    if (cart.length === 0) return;
    const estNo = `EST-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const estimateDoc = {
      id: `est-${Date.now()}`,
      invoice_no: estNo,
      customer_name: customer.name || 'Walk-in Customer',
      customer_phone: customer.phone || 'N/A',
      customer_address: customer.address || 'Kerala',
      customer_pan: customer.pan || '',
      rate_22k_applied: rates.gold_22k_gram,
      ...billTotals,
      payment_modes: { 'Estimate': billTotals.net_payable },
      status: 'ESTIMATE',
      isEstimate: true,
      created_at: new Date().toISOString(),
      items: pricedItems
    };

    setGeneratedInvoice(estimateDoc);
    setIsGeneratedEstimate(true);
    setIsInvoiceModalOpen(true);
  };

  // Fetch in-stock items
  const fetchStock = async () => {
    try {
      const res = await getInventory({ status: 'IN_STOCK' });
      if (res.success && res.data) {
        setStockItems(res.data);
      }
    } catch (err) {
      console.error('Failed to load stock:', err);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // Filter available items for quick scan
  const availableItems = useMemo(() => {
    const cartIds = cart.map(c => c.id);
    return stockItems.filter(item => !cartIds.includes(item.id));
  }, [stockItems, cart]);

  // Handle barcode search or scanner input
  const handleAddItemByCode = (code) => {
    if (!code) return;
    const cleanCode = code.trim().toUpperCase();
    const found = availableItems.find(i => 
      i.barcode.toUpperCase() === cleanCode || 
      i.huid.toUpperCase() === cleanCode ||
      i.item_name.toLowerCase().includes(cleanCode.toLowerCase())
    );

    if (found) {
      addToCart(found);
      setSearchQuery('');
    }
  };

  const addToCart = (item) => {
    setCart(prev => [...prev, { ...item }]);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateItemVA = (id, newVA) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, va_percent: Number(newVA) || 0 };
      }
      return item;
    }));
  };

  // Recalculate line-item pricing dynamically with current live board rates
  const pricedItems = useMemo(() => {
    return cart.map(item => {
      const pricing = calculateItemPricing(item, rates);
      return { ...item, ...pricing };
    });
  }, [cart, rates]);

  // Compute bill totals
  const billTotals = useMemo(() => {
    return calculateInvoiceTotals(pricedItems, oldGoldCredit, chitCredit);
  }, [pricedItems, oldGoldCredit, chitCredit]);

  // Handle settlement modal
  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    // Pre-fill UPI or Cash with net payable amount
    setPayments({
      cash: 0,
      upi: billTotals.net_payable,
      card: 0,
      neft: 0
    });
    setIsPaymentModalOpen(true);
  };

  const handleTotalPaid = () => {
    return Number(payments.cash || 0) + Number(payments.upi || 0) + Number(payments.card || 0) + Number(payments.neft || 0);
  };

  const handleCompleteSale = async () => {
    setSubmitting(true);
    try {
      const payload = {
        customer,
        items: cart,
        oldGoldCredit: Number(oldGoldCredit || 0),
        chitCredit: Number(chitCredit || 0),
        payments: payments
      };

      const res = await createInvoice(payload);
      if (res.success && res.data) {
        setGeneratedInvoice(res.data);
        setIsGeneratedEstimate(false);
        setIsPaymentModalOpen(false);
        setIsInvoiceModalOpen(true);
        // Refresh inventory
        fetchStock();
        // Reset cart
        setCart([]);
        setOldGoldCredit(0);
        setChitCredit(0);
      }
    } catch (err) {
      alert('Error creating invoice: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPaid = handleTotalPaid();
  const paymentBalance = billTotals.net_payable - totalPaid;

  return (
    <div className="space-y-4">
      {/* Top Header / Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Showroom Counter POS</h2>
            {isEstimateMode && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Quotation / Estimate Mode
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant HUID/Barcode tag billing • Applied 22K rate: <strong className="text-gold-700">{formatINR(rates.gold_22k_gram)}/g</strong> ({formatINR(rates.gold_22k_pavan)}/Pavan)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEstimateMode(!isEstimateMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              isEstimateMode 
                ? 'bg-amber-50 border-amber-300 text-amber-900' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isEstimateMode ? '✓ Estimate Mode Active' : 'Switch to Estimate Mode'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ======================================================== */}
        {/* LEFT 2 COLUMNS: ITEM SEARCH & CART TABLE */}
        {/* ======================================================== */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barcode / HUID Quick Input Box */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddItemByCode(searchQuery);
                    }
                  }}
                  placeholder="Scan Barcode, Enter HUID (e.g. KL916A) or item name..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition font-mono uppercase"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddItemByCode(searchQuery)}
                className="px-4 py-2.5 bg-royal-900 hover:bg-royal-800 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-gold-400" />
                <span>Add Tag</span>
              </button>
            </div>

            {/* Quick Suggestions from Available Stock */}
            {searchQuery && (
              <div className="mt-3 max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
                {availableItems
                  .filter(i => 
                    i.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.huid.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.item_name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        addToCart(item);
                        setSearchQuery('');
                      }}
                      className="p-2.5 hover:bg-gold-50/60 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{item.item_name}</span>
                        <div className="text-[11px] text-slate-500">
                          HUID: <span className="font-mono font-bold text-gold-800">{item.huid}</span> • Gross: {formatWeight(item.gross_weight_g)} • Net: {formatWeight(item.net_weight_g)} ({formatPavan(item.net_weight_g / 8)})
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-gold-100 text-gold-900 font-bold rounded">
                        Add to Bill
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Billing Cart Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Cart Items ({cart.length})
              </span>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Clear Cart
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Item / HUID</th>
                    <th className="p-3 text-right">Gross (g)</th>
                    <th className="p-3 text-right">Stone (g)</th>
                    <th className="p-3 text-right">Net (g)</th>
                    <th className="p-3 text-right">Pavan</th>
                    <th className="p-3 text-right">Rate/g</th>
                    <th className="p-3 text-right">VA %</th>
                    <th className="p-3 text-right">Taxable (₹)</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pricedItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-slate-400">
                        Scan or enter a barcode/HUID to add jewellery items to this bill.
                      </td>
                    </tr>
                  ) : (
                    pricedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{item.item_name}</div>
                          <div className="text-[10px] font-mono text-gold-700 font-bold">
                            {item.huid} • {item.purity_karat || '22K'}
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono">{formatWeight(item.gross_weight_g, false)}</td>
                        <td className="p-3 text-right font-mono text-slate-400">{formatWeight(item.stone_weight_g, false)}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">{formatWeight(item.net_weight_g, false)}</td>
                        <td className="p-3 text-right font-mono font-bold text-gold-800">{formatPavan(item.pavan, false)}</td>
                        <td className="p-3 text-right font-mono">{formatINR(item.rate_per_g).replace('₹', '')}</td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            step="0.1"
                            value={item.va_percent}
                            onChange={(e) => updateItemVA(item.id, e.target.value)}
                            className="w-14 px-1.5 py-1 text-right bg-white border border-slate-300 rounded font-mono font-bold focus:ring-1 focus:ring-gold-500"
                          />
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          {formatINR(item.taxable_value)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Add Quick-Chips */}
            <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="font-semibold text-slate-400 whitespace-nowrap">Quick Select:</span>
              {availableItems.slice(0, 4).map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="px-2.5 py-1 bg-white hover:bg-gold-50 border border-slate-200 rounded-lg text-slate-700 font-medium whitespace-nowrap text-[11px] shadow-2xs"
                >
                  + {item.item_name} ({formatWeight(item.gross_weight_g)})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: CUSTOMER & BILL SETTLEMENT */}
        {/* ======================================================== */}
        <div className="space-y-4">
          {/* Customer Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Customer Details</h3>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500">Customer Name</label>
              <input
                type="text"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500">Mobile Phone</label>
              <input
                type="text"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-gold-500"
              />
            </div>
            {billTotals.net_payable > 200000 && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                <div className="flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Statutory Notice (&gt; ₹2 Lakhs)</span>
                </div>
                <label className="block mt-1 font-semibold">Customer PAN Card (Mandatory):</label>
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={customer.pan}
                  onChange={(e) => setCustomer({ ...customer, pan: e.target.value.toUpperCase() })}
                  className="mt-1 w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs font-mono font-bold"
                />
              </div>
            )}
          </div>

          {/* Trade-In & Chit Scheme Deductions */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Deductions & Credits</h3>
            
            <div>
              <div className="flex items-center justify-between text-[11px]">
                <label className="font-semibold text-slate-600">Old Gold Exchange Credit (₹):</label>
                {oldGoldCredit > 0 && <span className="text-amber-600 font-bold">Applied</span>}
              </div>
              <input
                type="number"
                value={oldGoldCredit || ''}
                onChange={(e) => setOldGoldCredit(Number(e.target.value) || 0)}
                placeholder="₹ 0.00"
                className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-gold-500 font-bold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px]">
                <label className="font-semibold text-slate-600">Swarna Nidhi Chit Voucher (₹):</label>
                {chitCredit > 0 && <span className="text-purple-600 font-bold">Applied</span>}
              </div>
              <input
                type="number"
                value={chitCredit || ''}
                onChange={(e) => setChitCredit(Number(e.target.value) || 0)}
                placeholder="₹ 0.00"
                className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-gold-500 font-bold"
              />
            </div>
          </div>

          {/* Bill Calculation Summary */}
          <div className="bg-gradient-to-b from-royal-900 to-royal-950 text-white p-5 rounded-xl border border-royal-800 shadow-lg space-y-3">
            <div className="text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Net Gold Weight:</span>
                <span className="font-bold font-mono text-gold-300">{formatWeight(billTotals.total_net_weight_g)} ({formatPavan(billTotals.total_pavan)})</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Taxable Amount:</span>
                <span className="font-mono">{formatINR(billTotals.taxable_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>CGST (1.5%):</span>
                <span className="font-mono">{formatINR(billTotals.cgst_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>SGST (1.5% - Kerala):</span>
                <span className="font-mono">{formatINR(billTotals.sgst_amount)}</span>
              </div>

              {oldGoldCredit > 0 && (
                <div className="flex justify-between text-amber-300 text-xs">
                  <span>Old Gold Trade-In:</span>
                  <span className="font-mono">- {formatINR(oldGoldCredit)}</span>
                </div>
              )}

              {chitCredit > 0 && (
                <div className="flex justify-between text-purple-300 text-xs">
                  <span>Chit Voucher Credit:</span>
                  <span className="font-mono">- {formatINR(chitCredit)}</span>
                </div>
              )}

              {billTotals.round_off !== 0 && (
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>Round Off:</span>
                  <span className="font-mono">{billTotals.round_off > 0 ? `+${billTotals.round_off}` : billTotals.round_off}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-royal-700/80 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-300">Net Payable</span>
                <p className="text-[10px] text-slate-400">Total with 3% GST</p>
              </div>
              <div className="text-2xl font-black text-gold-300 font-mono">
                {formatINR(billTotals.net_payable)}
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleGenerateEstimate}
                className="w-full py-2.5 bg-royal-800 hover:bg-royal-750 text-gold-300 hover:text-gold-200 border border-gold-500/40 font-bold rounded-xl text-xs transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
              >
                <FileText className="w-4 h-4 text-gold-400" />
                <span>Print Estimate / Proforma Bill</span>
              </button>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleOpenPayment}
                className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-royal-950 font-black rounded-xl text-sm shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Proceed to Final GST Billing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MULTI-TENDER PAYMENT SPLIT MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Multi-Tender Payment Split"
        subtitle={`Settle total bill of ${formatINR(billTotals.net_payable)} via Cash, UPI, Card, or NEFT.`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Total Due:</span>
            <span className="text-lg font-black text-slate-900 font-mono">{formatINR(billTotals.net_payable)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600">UPI (GPay / PhonePe / QR)</label>
              <input
                type="number"
                value={payments.upi || ''}
                onChange={(e) => setPayments({ ...payments, upi: Number(e.target.value) || 0 })}
                className="mt-1 w-full px-3 py-2 border rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">Cash in Hand</label>
              <input
                type="number"
                value={payments.cash || ''}
                onChange={(e) => setPayments({ ...payments, cash: Number(e.target.value) || 0 })}
                className="mt-1 w-full px-3 py-2 border rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">Card (Debit / Credit POS)</label>
              <input
                type="number"
                value={payments.card || ''}
                onChange={(e) => setPayments({ ...payments, card: Number(e.target.value) || 0 })}
                className="mt-1 w-full px-3 py-2 border rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">Bank Transfer (NEFT/RTGS)</label>
              <input
                type="number"
                value={payments.neft || ''}
                onChange={(e) => setPayments({ ...payments, neft: Number(e.target.value) || 0 })}
                className="mt-1 w-full px-3 py-2 border rounded-lg font-mono font-bold text-slate-900 focus:ring-1 focus:ring-gold-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg border text-xs flex items-center justify-between font-bold">
            <span>Remaining Balance:</span>
            <span className={`font-mono ${paymentBalance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatINR(paymentBalance)}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={handleCompleteSale}
              disabled={submitting || paymentBalance !== 0}
              className="px-6 py-2 bg-gold-500 hover:bg-gold-600 text-royal-950 font-black rounded-lg text-xs shadow transition disabled:opacity-40"
            >
              {submitting ? 'Generating Tax Invoice...' : 'Complete Sale & Print Bill'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* FINALIZED INVOICE / ESTIMATE PREVIEW & PRINT MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title={isGeneratedEstimate ? "Estimate / Proforma Quotation Generated" : "Showroom Tax Invoice Generated"}
        subtitle={`${isGeneratedEstimate ? 'Estimate No' : 'Invoice No'}: ${generatedInvoice?.invoice_no}`}
        maxWidth="max-w-4xl"
      >
        <ReceiptInvoice
          invoice={generatedInvoice}
          isEstimate={isGeneratedEstimate}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default POSBilling;

