/* Виджеты, собранные из js/config.js: конвертер валют (демо-курсы), списки методов,
   таблица тарифов, лимиты верификации, форма "личного кабинета" (пока без бэкенда). */

function convert(amount, fromCode, toCode) {
  const list = SITE.currencies;
  const from = list.find(c => c.code === fromCode);
  const to = list.find(c => c.code === toCode);
  if (!from || !to || !amount) return 0;
  const usd = amount * from.rateToUsd;
  const gross = usd / to.rateToUsd;
  return gross * (1 - SITE.exchangeFeePct / 100);
}

function currencyOptions(selected) {
  return SITE.currencies.map(c => `<option value="${c.code}"${c.code === selected ? ' selected' : ''}>${c.code}</option>`).join('');
}

function initConverter(hostSelector, opts) {
  const host = document.querySelector(hostSelector);
  if (!host) return;
  const options = Object.assign({ from: 'RUB', to: 'USDT', amount: 10000 }, opts || {});
  host.innerHTML = `
    <div class="conv-row">
      <div style="flex:1">
        <label>Отдаёте</label>
        <input type="number" min="0" step="any" inputmode="decimal" id="conv-give" value="${options.amount}">
      </div>
      <select class="conv-select" id="conv-give-cur">${currencyOptions(options.from)}</select>
    </div>
    <div class="conv-swap"><button type="button" id="conv-swap" aria-label="Поменять валюты"><span data-icon="arrow-up-down" data-size="16"></span></button></div>
    <div class="conv-row">
      <div style="flex:1">
        <label>Получаете</label>
        <input type="text" id="conv-get" readonly>
      </div>
      <select class="conv-select" id="conv-get-cur">${currencyOptions(options.to)}</select>
    </div>
    <div class="conv-rate" id="conv-rate-text"></div>
    <a class="btn btn-block" href="cabinet.html?tab=register">Начать обмен<span data-icon="arrow-right" data-size="18"></span></a>
  `;
  renderIcons(host);

  const give = host.querySelector('#conv-give');
  const get = host.querySelector('#conv-get');
  const giveCur = host.querySelector('#conv-give-cur');
  const getCur = host.querySelector('#conv-get-cur');
  const rateText = host.querySelector('#conv-rate-text');
  const swap = host.querySelector('#conv-swap');

  function fmt(n) {
    return n.toLocaleString('ru-RU', { maximumFractionDigits: n < 10 ? 6 : 2 });
  }

  function update() {
    const amount = parseFloat(give.value) || 0;
    const result = convert(amount, giveCur.value, getCur.value);
    get.value = amount ? fmt(result) : '';
    const one = convert(1, giveCur.value, getCur.value);
    rateText.innerHTML = `Курс: <b>1 ${giveCur.value} ≈ ${fmt(one)} ${getCur.value}</b> · комиссия ${SITE.exchangeFeePct}% включена`;
  }

  [give, giveCur, getCur].forEach(el => el.addEventListener('input', update));
  swap.addEventListener('click', () => {
    const a = giveCur.value, b = getCur.value;
    giveCur.value = b; getCur.value = a;
    update();
  });
  update();
}

function renderMethodChips(selector) {
  document.querySelectorAll(selector).forEach(host => {
    host.innerHTML = SITE.depositMethods.map(m => `<div class="chip"><span data-icon="${m.icon}" data-size="16"></span>${m.name}</div>`).join('');
  });
  renderIcons();
}

function renderFeesTable(selector) {
  document.querySelectorAll(selector).forEach(host => {
    host.innerHTML = `
      <table class="fees">
        <thead><tr><th>Операция</th><th>Комиссия</th><th>Примечание</th></tr></thead>
        <tbody>
          ${SITE.feesTable.map(r => `<tr><td><b>${r.op}</b></td><td>${r.fee}</td><td>${r.note || '—'}</td></tr>`).join('')}
        </tbody>
      </table>`;
  });
}

function renderLimitsTable(selector) {
  document.querySelectorAll(selector).forEach(host => {
    host.innerHTML = `
      <table class="fees">
        <thead><tr><th>Уровень</th><th>Лимит на операции</th></tr></thead>
        <tbody>
          ${SITE.limits.map(r => `<tr><td><b>${r.tier}</b></td><td>${r.limit}</td></tr>`).join('')}
        </tbody>
      </table>`;
  });
}

function initCabinetForm() {
  const root = document.getElementById('cabinet-root');
  if (!root) return;
  const params = new URLSearchParams(location.search);
  const initialTab = params.get('tab') === 'register' ? 'register' : 'login';

  function render(tab) {
    root.innerHTML = `
      <div class="auth-card">
        <div class="auth-tabs">
          <button type="button" data-tab="login" class="${tab === 'login' ? 'active' : ''}">Вход</button>
          <button type="button" data-tab="register" class="${tab === 'register' ? 'active' : ''}">Регистрация</button>
        </div>
        <form id="cabinet-form" novalidate>
          <div class="field"><label for="cab-email">Email</label><input id="cab-email" type="email" required placeholder="you@example.com"></div>
          <div class="field"><label for="cab-pass">Пароль</label><input id="cab-pass" type="password" required minlength="6" placeholder="минимум 6 символов"></div>
          <button class="btn btn-block" type="submit">${tab === 'register' ? 'Создать аккаунт' : 'Войти'}</button>
        </form>
        <div class="demo-note">Личный кабинет в разработке: регистрация и вход пока не сохраняют данные — это демонстрация интерфейса (см. js/api.js).</div>
      </div>`;

    root.querySelectorAll('.auth-tabs button').forEach(btn => {
      btn.addEventListener('click', () => render(btn.dataset.tab));
    });

    root.querySelector('#cabinet-form').addEventListener('submit', async e => {
      e.preventDefault();
      const email = root.querySelector('#cab-email').value;
      const password = root.querySelector('#cab-pass').value;
      if (tab === 'register') {
        await API.register(email, password);
        showToast('Демо: заявка на регистрацию отправлена в API.register()');
      } else {
        await API.login(email, password);
        showToast('Демо: запрос на вход отправлен в API.login()');
      }
    });
  }

  render(initialTab);
}

document.addEventListener('DOMContentLoaded', () => {
  initConverter('#hero-converter', { amount: 10000 });
  initConverter('#full-converter', { amount: 1000, from: 'USD', to: 'RUB' });
  renderMethodChips('[data-methods]');
  renderFeesTable('[data-fees-table]');
  renderLimitsTable('[data-limits-table]');
  initCabinetForm();
});
