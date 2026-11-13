/**
 * Utility formatters for Kerala Jewellery ERP
 */

export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatWeight(grams, showUnit = true) {
  if (grams === undefined || grams === null || isNaN(grams)) return showUnit ? '0.000 g' : '0.000';
  const val = Number(grams).toFixed(3);
  return showUnit ? `${val} g` : val;
}

export function formatPavan(pavan, showUnit = true) {
  if (pavan === undefined || pavan === null || isNaN(pavan)) return showUnit ? '0.000 Pavan' : '0.000';
  const val = Number(pavan).toFixed(3);
  return showUnit ? `${val} Pavan` : val;
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

