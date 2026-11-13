import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Rates
export const getRates = () => api.get('/rates').then(res => res.data);
export const updateRates = (rates) => api.put('/rates', rates).then(res => res.data);

// Categories
export const getCategories = () => api.get('/categories').then(res => res.data);

// Inventory
export const getInventory = (params) => api.get('/inventory', { params }).then(res => res.data);
export const getInventoryItem = (code) => api.get(`/inventory/${code}`).then(res => res.data);
export const addInventoryItem = (data) => api.post('/inventory', data).then(res => res.data);

// POS & Invoices
export const calculatePreview = (payload) => api.post('/calculate-preview', payload).then(res => res.data);
export const createInvoice = (payload) => api.post('/invoices', payload).then(res => res.data);
export const getInvoices = () => api.get('/invoices').then(res => res.data);
export const getInvoiceById = (id) => api.get(`/invoices/${id}`).then(res => res.data);

// Old Gold
export const getOldGoldReceipts = () => api.get('/old-gold').then(res => res.data);
export const createOldGoldReceipt = (payload) => api.post('/old-gold', payload).then(res => res.data);

// Chit Schemes
export const getChittySchemes = () => api.get('/chitty/schemes').then(res => res.data);
export const getChittyAccounts = () => api.get('/chitty/accounts').then(res => res.data);
export const payChittyInstallment = (payload) => api.post('/chitty/pay', payload).then(res => res.data);

// Karigar
export const getKarigarAccounts = () => api.get('/karigar/accounts').then(res => res.data);
export const getKarigarTransactions = (karigarId) => api.get('/karigar/transactions', { params: { karigarId } }).then(res => res.data);
export const recordKarigarTx = (payload) => api.post('/karigar/transactions', payload).then(res => res.data);

// Day Book
export const getDayBook = () => api.get('/reports/day-book').then(res => res.data);

export default api;

