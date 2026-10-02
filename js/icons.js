/* Простой набор inline-иконок (без внешних библиотек). Разметка минимальна и может быть
   заменена на собственный набор (Lucide, Phosphor и т.п.) — достаточно поменять ICONS. */
const ICONS = {
  wallet: '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M3 10h18"/><circle cx="16" cy="14.5" r="1.4" fill="currentColor" stroke="none"/>',
  repeat: '<path d="M4 7h13l-3-3"/><path d="M20 17H7l3 3"/>',
  "arrow-up-down": '<path d="M7 16V4M7 4 4 7M7 4l3 3"/><path d="M17 8v12M17 20l3-3M17 20l-3-3"/>',
  "shield-check": '<path d="M12 3 4 6v6c0 5 4 7.5 8 9 4-1.5 8-4 8-9V6l-8-3z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  "credit-card": '<rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path d="M2.5 10h19"/><path d="M6 15h4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-6-3.8-9S9.5 5.6 12 3Z"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "chevron-right": '<path d="m9 6 6 6-6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  star: '<path d="M12 3.5 14.6 9l6 .9-4.3 4.3 1 6-5.3-2.9-5.3 2.9 1-6-4.3-4.3 6-.9z"/>',
  zap: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
  users: '<circle cx="9" cy="8" r="3.3"/><path d="M3.5 20c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/><circle cx="17" cy="8.5" r="2.6"/><path d="M15.5 14.3c2.3.4 4 2.4 4 5.7"/>',
  send: '<path d="M21 3 3 10.5l7 2.5m0 0 2.5 7L21 3M10 13l5.5-5.5"/>',
  check: '<path d="M5 12.5 9.5 17 19 7"/>',
  "circle-check": '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.3 2.4 2.4 4.6-5.2"/>',
  "file-text": '<path d="M6.5 2.5h8l4 4v14a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z"/><path d="M14 2.5V7h4.5"/><path d="M8.5 12h7M8.5 15.5h7M8.5 8.5h3"/>',
  link: '<path d="M9.5 14.5 14.5 9.5"/><path d="M11.3 7.2 13 5.5a3.4 3.4 0 0 1 4.8 4.8l-1.8 1.8"/><path d="M12.7 16.8 11 18.5a3.4 3.4 0 0 1-4.8-4.8l1.8-1.8"/>',
  code: '<path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>',
  download: '<path d="M12 3v12"/><path d="m7 10.5 5 5 5-5"/><path d="M4.5 20h15"/>',
  upload: '<path d="M12 15V3"/><path d="m7 7.5 5-5 5 5"/><path d="M4.5 20h15"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  "message-circle": '<path d="M3.5 12a8.5 8.5 0 1 1 3.3 6.7L3.5 20l1.2-3.6A8.4 8.4 0 0 1 3.5 12Z"/>',
  percent: '<path d="M5 19 19 5"/><circle cx="7.5" cy="7.5" r="2.3"/><circle cx="16.5" cy="16.5" r="2.3"/>',
  smartphone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  building: '<rect x="4" y="3" width="10" height="18" rx="1"/><rect x="14" y="9" width="6" height="12" rx="1"/><path d="M7.5 7h3M7.5 11h3M7.5 15h3"/>',
  terminal: '<rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="m6.5 9 3.5 3-3.5 3"/><path d="M12.5 15h5"/>',
  layers: '<path d="m12 3 8 4.5-8 4.5-8-4.5Z"/><path d="m4 12 8 4.5 8-4.5"/><path d="m4 16.5 8 4.5 8-4.5"/>',
  "triangle-alert": '<path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10.5v4"/><circle cx="12" cy="17" r=".2" fill="currentColor" stroke="currentColor" stroke-width="1.8"/>',
  "eye": '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  mail: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3.5 6.5 8.5 7 8.5-7"/>',
  "arrow-right": '<path d="M4 12h16"/><path d="m13 5 7 7-7 7"/>',
  banknote: '<rect x="2.5" y="6.5" width="19" height="11" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M5.5 9v0M18.5 15v0"/>',
};

function renderIcons(root){
  (root || document).querySelectorAll('[data-icon]').forEach(el => {
    const name = el.getAttribute('data-icon');
    if (el.dataset.iconDone || !ICONS[name]) return;
    const size = el.getAttribute('data-size') || 20;
    el.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
    el.dataset.iconDone = '1';
  });
}
