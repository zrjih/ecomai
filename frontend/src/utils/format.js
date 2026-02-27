/**
 * Format a number as a price with configurable currency.
 * @param {number|string} amount
 * @param {object} [opts]
 * @param {number} [opts.decimals=2] - Decimal places
 * @param {boolean} [opts.locale=true] - Use locale grouping (1,234.56)
 * @param {string} [opts.symbol='৳'] - Currency symbol
 * @param {string} [opts.position='before'] - Symbol position: 'before' or 'after'
 * @returns {string} e.g. "৳1,234.56" or "1,234.56$"
 */
export function formatPrice(amount, { decimals = 2, locale = true, symbol = '৳', position = 'before' } = {}) {
  const num = Number(amount) || 0;
  let formatted;
  if (locale) {
    formatted = num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  } else {
    formatted = num.toFixed(decimals);
  }
  return position === 'after' ? `${formatted}${symbol}` : `${symbol}${formatted}`;
}

/**
 * Default currency constants (can be overridden by website settings).
 */
export const CURRENCY_SYMBOL = '৳';
export const CURRENCY_CODE = 'BDT';
