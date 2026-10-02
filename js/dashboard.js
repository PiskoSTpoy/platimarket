/* Логика личного кабинета: требует авторизации (cookie от server/index.js),
   иначе редиректит на cabinet.html. Все операции — реальные запросы к API (js/api.js). */

function fmtAmount(n) {
  return Number(n).toLocaleString('ru-RU', { maximumFractionDigits: Math.abs(n) < 10 ? 6 : 2 });
}

function verifiedLabel(level) {
  return ['Без верификации', 'Базовая верификация', 'Полная верификация'][level] || 'Без верификации';
}

async function renderBalances() {
  const { balances } = await API.getBalances();
  const host = document.getElementById('balances-grid');
  host.innerHTML = balances.map(b => `
    <div class="card balance-card">
      <span class="bal-code">${b.currency}</span>
      <span class="bal-amount">${fmtAmount(b.amount)}</span>
    </div>`).join('');
  return balances;
}

const TX_LABELS = {
  deposit: 'Пополнение',
  withdrawal: 'Вывод',
  exchange: 'Обмен',
};

async function renderTransactions() {
  const { items } = await API.listTransactions();
  const host = document.getElementById('tx-table-wrap');
  if (!items.length) {
    host.innerHTML = '<div class="empty-state">Операций пока нет — сделайте первое пополнение или обмен выше.</div>';
    return;
  }
  host.innerHTML = `
    <table class="fees">
      <thead><tr><th>Дата</th><th>Операция</th><th>Сумма</th><th>Статус</th></tr></thead>
      <tbody>
        ${items.map(tx => {
          const sign = tx.amount > 0 ? '+' : '';
          const extra = tx.type === 'exchange' && tx.meta ? ` → ${fmtAmount(tx.meta.receivedAmount)} ${tx.meta.to}` : '';
          const statusLabel = tx.status === 'completed' ? 'Выполнено' : 'В обработке';
          return `<tr>
            <td>${new Date(tx.created_at + 'Z').toLocaleString('ru-RU')}</td>
            <td><b>${TX_LABELS[tx.type] || tx.type}</b></td>
            <td>${sign}${fmtAmount(tx.amount)} ${tx.currency}${extra}</td>
            <td><span class="status-pill ${tx.status}">${statusLabel}</span></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function fillCurrencySelects() {
  const opts = currencyOptions();
  ['ex-from', 'ex-to', 'dep-currency', 'wd-currency'].forEach(id => {
    document.getElementById(id).innerHTML = opts;
  });
  document.getElementById('ex-to').value = SITE.currencies[1] ? SITE.currencies[1].code : SITE.currencies[0].code;
}

function initWalletTabs() {
  document.getElementById('wallet-tabs').addEventListener('click', e => {
    const btn = e.target.closest('button[data-panel]');
    if (!btn) return;
    document.querySelectorAll('#wallet-tabs button').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.wallet-panel').forEach(p => p.hidden = p.id !== 'panel-' + btn.dataset.panel);
  });
}

function initExchangePanel() {
  const amount = document.getElementById('ex-amount');
  const from = document.getElementById('ex-from');
  const to = document.getElementById('ex-to');
  const preview = document.getElementById('ex-preview');

  function updatePreview() {
    const a = parseFloat(amount.value) || 0;
    if (!a || from.value === to.value) { preview.textContent = '—'; return; }
    const result = convert(a, from.value, to.value);
    preview.innerHTML = `Получите: <b>${fmtAmount(result)} ${to.value}</b>`;
  }
  [amount, from, to].forEach(el => el.addEventListener('input', updatePreview));

  document.getElementById('panel-exchange').addEventListener('submit', async e => {
    e.preventDefault();
    const a = parseFloat(amount.value);
    if (!a || a <= 0) return showToast('Укажите сумму обмена');
    if (from.value === to.value) return showToast('Выберите разные валюты');
    try {
      const res = await API.createExchange(from.value, to.value, a);
      showToast(`Обменяно: получено ${fmtAmount(res.transaction.receivedAmount)} ${to.value}`);
      amount.value = '';
      preview.textContent = '—';
      await Promise.all([renderBalances(), renderTransactions()]);
    } catch (err) {
      showToast(err.message);
    }
  });
}

function initDepositPanel() {
  document.getElementById('panel-deposit').addEventListener('submit', async e => {
    e.preventDefault();
    const currency = document.getElementById('dep-currency').value;
    const amount = parseFloat(document.getElementById('dep-amount').value);
    const method = document.getElementById('dep-method').value;
    if (!amount || amount <= 0) return showToast('Укажите сумму пополнения');
    try {
      await API.createDeposit(method, currency, amount);
      showToast(`Баланс пополнен на ${fmtAmount(amount)} ${currency} (демо)`);
      document.getElementById('dep-amount').value = '';
      await Promise.all([renderBalances(), renderTransactions()]);
    } catch (err) {
      showToast(err.message);
    }
  });
}

function initWithdrawPanel() {
  document.getElementById('panel-withdraw').addEventListener('submit', async e => {
    e.preventDefault();
    const currency = document.getElementById('wd-currency').value;
    const amount = parseFloat(document.getElementById('wd-amount').value);
    const requisites = document.getElementById('wd-requisites').value;
    if (!amount || amount <= 0) return showToast('Укажите сумму вывода');
    if (!requisites.trim()) return showToast('Укажите реквизиты');
    try {
      await API.createWithdrawal('Вывод', currency, amount, requisites);
      showToast('Заявка на вывод создана и переведена в обработку');
      document.getElementById('wd-amount').value = '';
      document.getElementById('wd-requisites').value = '';
      await Promise.all([renderBalances(), renderTransactions()]);
    } catch (err) {
      showToast(err.message);
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  let profile;
  try {
    profile = (await API.getProfile()).user;
  } catch {
    location.href = 'cabinet.html?tab=login';
    return;
  }

  document.getElementById('wallet-user').textContent = `${profile.email} · ${verifiedLabel(profile.verifiedLevel)}`;
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await API.logout().catch(() => {});
    location.href = 'index.html';
  });

  fillCurrencySelects();
  initWalletTabs();
  initExchangePanel();
  initDepositPanel();
  initWithdrawPanel();
  await Promise.all([renderBalances(), renderTransactions()]);
});
