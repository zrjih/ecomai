/**
 * Format a number as BDT (Bangladeshi Taka) price.
 * @param {number|string} amount
 * @param {object} [opts]
 * @param {number} [opts.decimals=2] - Decimal places
 * @param {boolean} [opts.locale=true] - Use locale grouping (1,234.56)
 * @returns {string} e.g. "৳1,234.56"
 */
export function formatPrice(amount, { decimals = 2, locale = true } = {}) {
  const num = Number(amount) || 0;
  if (locale) {
    return `৳${num.toLocaleString('en-BD', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  }
  return `৳${num.toFixed(decimals)}`;
}

/**
 * Currency symbol constant.
 */
export const CURRENCY_SYMBOL = '৳';
export const CURRENCY_CODE = 'BDT';
