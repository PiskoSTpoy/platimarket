function renderHeader() {
  const host = document.getElementById('site-header');
  if (!host) return;
  const current = location.pathname.split('/').pop() || 'index.html';
  const isDashboard = document.body.dataset.page === 'dashboard';
  const navHtml = SITE.nav.map(item => {
    const active = item.href === current ? ' class="active"' : '';
    return `<a href="${item.href}"${active}>${item.label}</a>`;
  }).join('');
  const authButtons = isDashboard ? '' : `
          <a class="btn btn-outline btn-sm" href="cabinet.html?tab=login">Войти</a>
          <a class="btn btn-sm" href="cabinet.html?tab=register">Регистрация</a>`;
  host.innerHTML = `
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="index.html"><img src="assets/logo.svg" alt="${SITE.name}">${SITE.name}</a>
        <nav class="main-nav" id="main-nav">${navHtml}</nav>
        <div class="header-actions">${authButtons}
          <button class="menu-toggle" id="menu-toggle" aria-label="Меню" aria-expanded="false"><span data-icon="menu" data-size="24"></span></button>
        </div>
      </div>
    </header>`;
}

function renderNotice() {
  const host = document.getElementById('notice-bar');
  if (!host) return;
  host.innerHTML = `<div class="notice-bar">PlatiMarket в разработке: регистрация и баланс в кошельке настоящие, но пополнение — демо-зачисление, вывод и приём платежей для бизнеса ещё не подключены к реальным провайдерам.</div>`;
}

function renderFooter() {
  const host = document.getElementById('site-footer');
  if (!host) return;
  const c = SITE.contacts;
  host.innerHTML = `
    <footer class="site-footer"><div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand"><img src="assets/logo.svg" alt="${SITE.name}">${SITE.name}</div>
          <p>${SITE.tagline}.</p>
          <div class="footer-social">
            <a href="${c.tg}" target="_blank" rel="noopener" aria-label="Telegram"><span data-icon="send" data-size="16"></span></a>
            <a href="mailto:${c.email}" aria-label="Email"><span data-icon="mail" data-size="16"></span></a>
          </div>
        </div>
        <div>
          <h4>Продукты</h4>
          <ul>
            <li><a href="individuals.html">Частным клиентам</a></li>
            <li><a href="business.html">Бизнесу</a></li>
            <li><a href="api.html">API для разработчиков</a></li>
          </ul>
        </div>
        <div>
          <h4>Инструменты</h4>
          <ul>
            <li><a href="fees.html">Тарифы и лимиты</a></li>
            <li><a href="security.html">Безопасность</a></li>
            <li><a href="faq.html">Частые вопросы</a></li>
          </ul>
        </div>
        <div>
          <h4>Поддержка</h4>
          <ul>
            <li><a href="${c.tg}" target="_blank" rel="noopener">Telegram: ${c.tgHandle}</a></li>
            <li><a href="mailto:${c.email}">${c.email}</a></li>
            <li><a href="contacts.html">Контакты</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${SITE.name}. Демо-версия сайта, не является публичной офертой.</span>
        <span>Работаем ${c.hours}</span>
      </div>
    </div></footer>`;
  renderIcons(host);
}

function renderFaqList(selector, limit) {
  document.querySelectorAll(selector).forEach(host => {
    const tag = host.getAttribute('data-faq-tag');
    let items = SITE.faq;
    if (tag) items = items.filter(f => f.tag === tag);
    const max = limit || host.getAttribute('data-faq-limit');
    if (max) items = items.slice(0, Number(max));
    host.innerHTML = items.map(f => `
      <div class="faq-item">
        <button class="faq-q" type="button">${f.q}<span data-icon="chevron-down" data-size="18"></span></button>
        <div class="faq-a"><p>${f.a}</p></div>
      </div>`).join('');
  });
  renderIcons();
}

function initFaqAccordion() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.faq-q');
    if (!btn) return;
    btn.closest('.faq-item').classList.toggle('open');
  });
}

function initMobileNav() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('mobile-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open
      ? '<span data-icon="x" data-size="24"></span>'
      : '<span data-icon="menu" data-size="24"></span>';
    renderIcons();
  });
}

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !items.length) {
    items.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
}

function showToast(text) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2600);
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderNotice();
  renderFooter();
  renderFaqList('[data-faq]');
  initFaqAccordion();
  initMobileNav();
  initReveal();
  renderIcons();
});
