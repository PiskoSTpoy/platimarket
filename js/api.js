/*
 * Клиент к бэкенду PlatiMarket (server/index.js, Express + SQLite). Аутентификация,
 * баланс, обмен, пополнение и вывод — реальные запросы к серверу (с демо-пополнением:
 * баланс зачисляется мгновенно, без подключения настоящего платёжного провайдера).
 *
 * Бизнес-инструменты (счета, массовые выплаты) пока не реализованы на сервере —
 * createInvoice()/createMassPayout() остаются демо-заглушками до интеграции с
 * платёжными провайдерами.
 */
async function apiRequest(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* пустой ответ */ }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Ошибка запроса (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const API = {
  async register(email, password) {
    return apiRequest('POST', '/api/auth/register', { email, password });
  },

  async login(email, password) {
    return apiRequest('POST', '/api/auth/login', { email, password });
  },

  async logout() {
    return apiRequest('POST', '/api/auth/logout');
  },

  async getProfile() {
    return apiRequest('GET', '/api/me');
  },

  async getBalances() {
    return apiRequest('GET', '/api/balances');
  },

  async createExchange(from, to, amount) {
    return apiRequest('POST', '/api/exchange', { from, to, amount });
  },

  async createDeposit(method, currency, amount) {
    return apiRequest('POST', '/api/deposits', { method, currency, amount });
  },

  async createWithdrawal(method, currency, amount, requisites) {
    return apiRequest('POST', '/api/withdrawals', { method, currency, amount, requisites });
  },

  async listTransactions() {
    return apiRequest('GET', '/api/transactions');
  },

  // TODO: бизнес-методы ниже всё ещё демо — на сервере нет реальной логики счетов и выплат.
  async createInvoice(amount, currency, description) {
    console.info('[demo] createInvoice()', { amount, currency, description });
    return Promise.resolve({ demo: true, id: 'demo-inv-' + Date.now(), payUrl: '#' });
  },

  async createMassPayout(items) {
    console.info('[demo] createMassPayout()', items);
    return Promise.resolve({ demo: true, batchId: 'demo-batch-' + Date.now(), status: 'queued', count: items.length });
  },
};
