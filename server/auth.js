const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'pm_token';
const TOKEN_TTL = '7d';
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn(
    '[platimarket] ВНИМАНИЕ: переменная окружения JWT_SECRET не задана — используется временный ' +
    'секрет для разработки. Все сессии будут сброшены при перезапуске сервера, и этот режим ' +
    'НЕЛЬЗЯ использовать в продакшене. Задайте JWT_SECRET в .env (см. .env.example).'
  );
}
const EFFECTIVE_SECRET = JWT_SECRET || 'dev-only-insecure-secret-change-me';

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function signToken(userId) {
  return jwt.sign({ uid: userId }, EFFECTIVE_SECRET, { expiresIn: TOKEN_TTL });
}

function setAuthCookie(res, userId) {
  res.cookie(COOKIE_NAME, signToken(userId), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Не авторизован' });
  try {
    const payload = jwt.verify(token, EFFECTIVE_SECRET);
    req.userId = payload.uid;
    next();
  } catch {
    return res.status(401).json({ error: 'Сессия истекла, войдите заново' });
  }
}

module.exports = { hashPassword, verifyPassword, setAuthCookie, clearAuthCookie, requireAuth, COOKIE_NAME };
