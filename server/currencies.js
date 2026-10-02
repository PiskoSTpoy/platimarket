/* Серверная копия демо-курсов и валют из js/config.js. Это сделано намеренно —
 * клиенту доверять нельзя, сумма и курс обмена всегда пересчитываются здесь.
 * Если поменяете список валют на фронтенде, поправьте и этот файл. */
const CURRENCIES = [
  { code: 'RUB', rateToUsd: 0.0105 },
  { code: 'USD', rateToUsd: 1 },
  { code: 'EUR', rateToUsd: 1.08 },
  { code: 'USDT', rateToUsd: 1 },
  { code: 'BTC', rateToUsd: 62000 },
  { code: 'ETH', rateToUsd: 2600 },
];
const EXCHANGE_FEE_PCT = 1.5;
const CURRENCY_CODES = CURRENCIES.map(c => c.code);

function isValidCurrency(code) {
  return CURRENCY_CODES.includes(code);
}

/** Сколько получит пользователь при обмене amount единиц fromCode в toCode, после комиссии. */
function convert(amount, fromCode, toCode) {
  const from = CURRENCIES.find(c => c.code === fromCode);
  const to = CURRENCIES.find(c => c.code === toCode);
  if (!from || !to) return null;
  const usd = amount * from.rateToUsd;
  const gross = usd / to.rateToUsd;
  return gross * (1 - EXCHANGE_FEE_PCT / 100);
}

module.exports = { CURRENCIES, CURRENCY_CODES, EXCHANGE_FEE_PCT, isValidCurrency, convert };
