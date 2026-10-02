require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const db = require('./db');
const { hashPassword, verifyPassword, setAuthCookie, clearAuthCookie, requireAuth } = require('./auth');
const { CURRENCIES, isValidCurrency, convert, EXCHANGE_FEE_PCT } = require('./currencies');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(cookieParser());

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPositiveAmount(v) {
  return typeof v === 'number' && Number.isFinite(v) && v > 0;
}

function publicUser(user) {
  return { id: user.id, email: user.email, verifiedLevel: user.verified_level, createdAt: user.created_at };
}

// ---- auth ----

app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Укажите корректный email' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Пароль должен быть не короче 6 символов' });
  }
  if (db.findUserByEmail(email)) {
    return res.status(409).json({ error: 'Этот email уже зарегистрирован' });
  }
  const userId = db.createUser(email, hashPassword(password));
  setAuthCookie(res, userId);
  res.status(201).json({ user: publicUser(db.findUserById(userId)) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = typeof email === 'string' ? db.findUserByEmail(email) : null;
  if (!user || typeof password !== 'string' || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }
  setAuthCookie(res, user.id);
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

app.get('/api/me', requireAuth, (req, res) => {
  const user = db.findUserById(req.userId);
  if (!user) return res.status(401).json({ error: 'Не авторизован' });
  res.json({ user: publicUser(user) });
});

// ---- wallet ----

app.get('/api/balances', requireAuth, (req, res) => {
  res.json({ balances: db.getBalances(req.userId) });
});

app.get('/api/transactions', requireAuth, (req, res) => {
  res.json({ items: db.listTransactions(req.userId) });
});

app.post('/api/exchange', requireAuth, (req, res) => {
  const { from, to, amount } = req.body || {};
  if (!isValidCurrency(from) || !isValidCurrency(to) || from === to) {
    return res.status(400).json({ error: 'Некорректная валютная пара' });
  }
  if (!isPositiveAmount(amount)) {
    return res.status(400).json({ error: 'Некорректная сумма' });
  }
  const balanceRow = db.getBalance(req.userId, from);
  if (!balanceRow || balanceRow.amount < amount) {
    return res.status(400).json({ error: 'Недостаточно средств' });
  }
  const received = convert(amount, from, to);
  let txId;
  db.runInTransaction(() => {
    db.adjustBalance(req.userId, from, -amount);
    db.adjustBalance(req.userId, to, received);
    txId = db.addTransaction(req.userId, 'exchange', from, -amount, 'completed', {
      to, receivedAmount: received, feePct: EXCHANGE_FEE_PCT,
    });
  });
  res.json({
    transaction: { id: txId, from, to, amount, receivedAmount: received },
    balances: db.getBalances(req.userId),
  });
});

app.post('/api/deposits', requireAuth, (req, res) => {
  const { currency, amount, method } = req.body || {};
  if (!isValidCurrency(currency)) return res.status(400).json({ error: 'Неизвестная валюта' });
  if (!isPositiveAmount(amount)) return res.status(400).json({ error: 'Некорректная сумма' });
  let txId;
  db.runInTransaction(() => {
    db.adjustBalance(req.userId, currency, amount);
    txId = db.addTransaction(req.userId, 'deposit', currency, amount, 'completed', { method, demo: true });
  });
  res.status(201).json({
    transaction: { id: txId, currency, amount, status: 'completed', demo: true },
    balances: db.getBalances(req.userId),
  });
});

app.post('/api/withdrawals', requireAuth, (req, res) => {
  const { currency, amount, method, requisites } = req.body || {};
  if (!isValidCurrency(currency)) return res.status(400).json({ error: 'Неизвестная валюта' });
  if (!isPositiveAmount(amount)) return res.status(400).json({ error: 'Некорректная сумма' });
  if (typeof requisites !== 'string' || !requisites.trim()) {
    return res.status(400).json({ error: 'Укажите реквизиты для вывода' });
  }
  const balanceRow = db.getBalance(req.userId, currency);
  if (!balanceRow || balanceRow.amount < amount) {
    return res.status(400).json({ error: 'Недостаточно средств' });
  }
  let txId;
  db.runInTransaction(() => {
    db.adjustBalance(req.userId, currency, -amount);
    txId = db.addTransaction(req.userId, 'withdrawal', currency, -amount, 'pending', { method, requisites, demo: true });
  });
  res.status(201).json({
    transaction: { id: txId, currency, amount, status: 'pending', demo: true },
    balances: db.getBalances(req.userId),
  });
});

app.get('/api/currencies', (req, res) => {
  res.json({ currencies: CURRENCIES.map(c => c.code), feePct: EXCHANGE_FEE_PCT });
});

// ---- статика сайта (главная, кабинет, дашборд и т.д.) ----
app.use(express.static(ROOT, { extensions: ['html'] }));

app.use((req, res) => res.status(404).json({ error: 'Не найдено' }));

app.listen(PORT, () => {
  console.log(`PlatiMarket запущен: http://localhost:${PORT}`);
});
