/*
 * Демо-слой API. Сейчас все методы — заглушки (возвращают Promise с демо-данными),
 * бэкенда нет. Когда появится сервер, нужно:
 *  1) указать SITE.api.baseUrl в js/config.js;
 *  2) заменить тело методов на fetch(...) к реальным эндпоинтам (сигнатуры ниже — ориентир);
 *  3) настроить CORS и аутентификацию (токен/cookie) на сервере.
 *
 * Предлагаемые эндпоинты бэкенда (TODO, под личный кабинет):
 *   POST /api/auth/register      { email, password }              -> { userId }
 *   POST /api/auth/login         { email, password }               -> { token }
 *   GET  /api/me                                                   -> { id, email, verified }
 *   GET  /api/balances                                              -> { balances: [{code, amount}] }
 *   GET  /api/rates                                                 -> { rates: { USD: 1, BTC: 62000, ... } }
 *   POST /api/exchange           { from, to, amount }               -> { id, rate, receiveAmount }
 *   POST /api/deposits           { method, currency, amount }       -> { id, status, paymentDetails }
 *   POST /api/withdrawals        { method, currency, amount, requisites } -> { id, status }
 *   GET  /api/transactions                                          -> { items: [...] }
 *   POST /api/business/invoices  { amount, currency, description }  -> { id, payUrl }
 *   POST /api/business/payouts   { items: [{to, currency, amount}] } -> { batchId, status }
 */
const API = {
  async getRates() {
    const rates = {};
    SITE.currencies.forEach(c => { rates[c.code] = c.rateToUsd; });
    return Promise.resolve({ rates, demo: true });
  },

  async register(email, password) {
    console.info('[demo] register()', { email });
    return Promise.resolve({ demo: true, userId: 'demo-user', email });
  },

  async login(email, password) {
    console.info('[demo] login()', { email });
    return Promise.resolve({ demo: true, token: 'demo-token' });
  },

  async getProfile() {
    return Promise.resolve({ demo: true, id: 'demo-user', email: null, verified: false });
  },

  async getBalances() {
    return Promise.resolve({ demo: true, balances: SITE.currencies.map(c => ({ code: c.code, amount: 0 })) });
  },

  async createExchange(from, to, amount) {
    console.info('[demo] createExchange()', { from, to, amount });
    return Promise.resolve({ demo: true, id: 'demo-ex-' + Date.now(), status: 'pending' });
  },

  async createDeposit(method, currency, amount) {
    console.info('[demo] createDeposit()', { method, currency, amount });
    return Promise.resolve({ demo: true, id: 'demo-dep-' + Date.now(), status: 'pending', paymentDetails: null });
  },

  async createWithdrawal(method, currency, amount, requisites) {
    console.info('[demo] createWithdrawal()', { method, currency, amount, requisites });
    return Promise.resolve({ demo: true, id: 'demo-wd-' + Date.now(), status: 'pending' });
  },

  async createInvoice(amount, currency, description) {
    console.info('[demo] createInvoice()', { amount, currency, description });
    return Promise.resolve({ demo: true, id: 'demo-inv-' + Date.now(), payUrl: '#' });
  },

  async createMassPayout(items) {
    console.info('[demo] createMassPayout()', items);
    return Promise.resolve({ demo: true, batchId: 'demo-batch-' + Date.now(), status: 'queued', count: items.length });
  },

  async listTransactions() {
    return Promise.resolve({ demo: true, items: [] });
  },
};
