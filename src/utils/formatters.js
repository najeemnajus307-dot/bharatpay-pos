/**
 * Formats a numeric amount to standard Indian Rupees notation (INR)
 * @param {number} amount 
 * @param {boolean} includeCents 
 */
export const formatRupee = (amount, includeCents = true) => {
  if (isNaN(amount)) return '₹0.00';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0
  }).format(amount);
};

/**
 * Formats a JS Date object or ISO String to a standard Indian billing date
 * @param {Date|string} dateObj 
 */
export const formatBillDate = (dateObj) => {
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Formats time to 12-hour AM/PM billing system format
 * @param {Date|string} dateObj 
 */
export const formatBillTime = (dateObj) => {
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

/**
 * Generates an instantaneous standard unique billing Invoice/Txn reference ID
 */
export const generateTxnId = () => {
  const prefix = "BP";
  const stamp = Date.now().toString().slice(-6);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${stamp}${rand}`;
};
