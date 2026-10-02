const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { CURRENCY_CODES } = require('./currencies');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'platimarket.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    verified_level INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS balances (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, currency)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    currency TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    meta TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function createUser(email, passwordHash) {
  const insertUser = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
  const insertBalance = db.prepare('INSERT INTO balances (user_id, currency, amount) VALUES (?, ?, 0)');
  const run = db.transaction(() => {
    const info = insertUser.run(email, passwordHash);
    const userId = info.lastInsertRowid;
    for (const code of CURRENCY_CODES) insertBalance.run(userId, code);
    return userId;
  });
  return run();
}

function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function getBalances(userId) {
  return db.prepare('SELECT currency, amount FROM balances WHERE user_id = ? ORDER BY currency').all(userId);
}

function getBalance(userId, currency) {
  return db.prepare('SELECT amount FROM balances WHERE user_id = ? AND currency = ?').get(userId, currency);
}

function adjustBalance(userId, currency, delta) {
  db.prepare(`
    INSERT INTO balances (user_id, currency, amount) VALUES (?, ?, ?)
    ON CONFLICT(user_id, currency) DO UPDATE SET amount = amount + excluded.amount
  `).run(userId, currency, delta);
}

function addTransaction(userId, type, currency, amount, status, meta) {
  const info = db.prepare(`
    INSERT INTO transactions (user_id, type, currency, amount, status, meta)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, type, currency, amount, status, meta ? JSON.stringify(meta) : null);
  return info.lastInsertRowid;
}

function listTransactions(userId, limit = 100) {
  return db.prepare(`
    SELECT id, type, currency, amount, status, meta, created_at
    FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT ?
  `).all(userId, limit).map(row => ({ ...row, meta: row.meta ? JSON.parse(row.meta) : null }));
}

/** Выполняет несколько шагов в одной SQLite-транзакции (атомарно). */
function runInTransaction(fn) {
  return db.transaction(fn)();
}

module.exports = {
  db,
  createUser,
  findUserByEmail,
  findUserById,
  getBalances,
  getBalance,
  adjustBalance,
  addTransaction,
  listTransactions,
  runInTransaction,
};
