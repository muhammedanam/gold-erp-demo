import axios from 'axios';
import { clientStore } from './clientStore';
import { calculateItemPricing, calculateInvoiceTotals } from '../utils/keralaGoldMath';

// Base URL from Vite environment variable or relative '/api' fallback
const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper to safely execute API call or fallback seamlessly to clientStore
async function safeCall(apiPromise, fallbackFn) {
  try {
    const res = await apiPromise;
    // Check if valid JSON API response (not an HTML error page from Vercel rewrite)
    if (res && res.data && typeof res.data === 'object' && res.data.success !== undefined) {
      return res.data;
    }
  } catch (err) {
    // API is offline or deployed as static SPA on Vercel
  }
  return { success: true, data: fallbackFn() };
}

// Rates
export const getRates = () => safeCall(api.get('/rates'), () => clientStore.getRates());
export const updateRates = (rates) => safeCall(api.put('/rates', rates), () => clientStore.updateRates(rates));

// Categories
export const getCategories = () => safeCall(api.get('/categories'), () => clientStore.getCategories());

// Inventory
export const getInventory = (params) => safeCall(api.get('/inventory', { params }), () => clientStore.getInventory(params));
export const getInventoryItem = (code) => safeCall(api.get(`/inventory/${code}`), () => {
  const item = clientStore.getInventoryItem(code);
  if (!item) return null;
  const rates = clientStore.getRates();
  const pricing = calculateItemPricing(item, rates);
  return { ...item, live_pricing: pricing };
});
export const addInventoryItem = (data) => safeCall(api.post('/inventory', data), () => clientStore.addInventoryItem(data));

// POS & Invoices
export const calculatePreview = (payload) => safeCall(api.post('/calculate-preview', payload), () => {
  const rates = clientStore.getRates();
  const { items = [], oldGoldCredit = 0, chitCredit = 0 } = payload;
  const pricedItems = items.map(it => ({ ...it, ...calculateItemPricing(it, rates) }));
  const totals = calculateInvoiceTotals(pricedItems, oldGoldCredit, chitCredit);
  return { items: pricedItems, totals };
});

export const createInvoice = (payload) => safeCall(api.post('/invoices', payload), () => clientStore.createInvoice(payload));
export const getInvoices = () => safeCall(api.get('/invoices'), () => clientStore.getInvoices());
export const getInvoiceById = (id) => safeCall(api.get(`/invoices/${id}`), () => clientStore.getInvoiceById(id));

// Old Gold
export const getOldGoldReceipts = () => safeCall(api.get('/old-gold'), () => clientStore.getOldGoldReceipts());
export const createOldGoldReceipt = (payload) => safeCall(api.post('/old-gold', payload), () => clientStore.createOldGoldReceipt(payload));

// Chit Schemes
export const getChittySchemes = () => safeCall(api.get('/chitty/schemes'), () => clientStore.getChittySchemes());
export const getChittyAccounts = () => safeCall(api.get('/chitty/accounts'), () => clientStore.getChittyAccounts());
export const payChittyInstallment = (payload) => safeCall(api.post('/chitty/pay', payload), () => clientStore.payChittyInstallment(payload));

// Karigar
export const getKarigarAccounts = () => safeCall(api.get('/karigar/accounts'), () => clientStore.getKarigarAccounts());
export const getKarigarTransactions = (karigarId) => safeCall(api.get('/karigar/transactions', { params: { karigarId } }), () => clientStore.getKarigarTransactions(karigarId));
export const recordKarigarTx = (payload) => safeCall(api.post('/karigar/transactions', payload), () => clientStore.recordKarigarTx(payload));

// Day Book
export const getDayBook = () => safeCall(api.get('/reports/day-book'), () => clientStore.getDayBook());

export default api;
