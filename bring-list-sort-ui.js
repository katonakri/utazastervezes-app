/* Mit hozzunk? — stable sorting UI. */
(() => {
  const SORT_KEY = 'bring_list_sort_v2', DIR_KEY = 'bring_list_sort_dir_v2';
  const rank = text => {
    if (text.includes('Deli és Peti')) return 1;
    if (text.includes('Tina és Kristóf')) return 2;
    if (text.includes('Ármin')) return 3;
    if (text.includes('Ott vesszük')) return 4;
    if (text.includes('Még senki')) return 99;
    return 50;
  };
  let sorting = false;

  function sortDom() {
    const list = document.getElementById('bring-list');
    if (!list || sorting) return;
    const cards = [...list.querySelectorAll(':scope > .bring-card[data-bring-id]')];
    if (cards.length < 2) return;
    const mode = localStorage.getItem(SORT_KEY) || 'assignee';
    const dir = localStorage.getItem(DIR_KEY) === 'desc' ? -1 : 1;
    cards.sort((a, b) => {
      let c;
      if (mode === 'name') c = (a.querySelector('h3')?.textContent || '').localeCompare(b.querySelector('h3')?.textContent || '', 'hu');
      else c = rank(a.querySelector('.bring-card__assignees')?.textContent || '') - rank(b.querySelector('.bring-card__assignees')?.textContent || '');
      if (!c) c = (a.querySelector('h3')?.textContent || '').localeCompare(b.querySelector('h3')?.textContent || '', 'hu');
      return c * dir;
    });
    const current = [...list.children];
    const changed = cards.some((card, i) => current[i] !== card);
    if (!changed) return;
    sorting = true;
    const fragment = document.createDocumentFragment();
    cards.forEach(card => fragment.appendChild(card));
    list.appendChild(fragment);
    sorting = false;
  }

  function addControls() {
    const filters = document.querySelector('.bring-filters');
    if (!filters || document.querySelector('.bring-sort')) return;
    const wrap = document.createElement('div');
    wrap.className = 'bring-sort';
    const current = localStorage.getItem(SORT_KEY) || 'assignee';
    const desc = localStorage.getItem(DIR_KEY) === 'desc';
    wrap.innerHTML = `<label for="bring-sort-select">Rendezés:</label><select id="bring-sort-select" aria-label="Lista rendezése"><option value="assignee">Ki hozza?</option><option value="name">Megnevezés</option></select><button id="bring-sort-dir" type="button" aria-label="Rendezési irány">${desc ? '↓' : '↑'}</button>`;
    filters.insertAdjacentElement('afterend', wrap);
    const select = wrap.querySelector('select');
    select.value = current;
    select.addEventListener('change', () => { localStorage.setItem(SORT_KEY, select.value); sortDom(); });
    wrap.querySelector('button').addEventListener('click', () => {
      const next = localStorage.getItem(DIR_KEY) === 'desc' ? 'asc' : 'desc';
      localStorage.setItem(DIR_KEY, next);
      wrap.querySelector('button').textContent = next === 'desc' ? '↓' : '↑';
      sortDom();
    });
  }

  function refresh() { addControls(); sortDom(); }
  document.addEventListener('DOMContentLoaded', refresh);
  const observer = new MutationObserver(() => requestAnimationFrame(refresh));
  document.addEventListener('DOMContentLoaded', () => {
    const host = document.getElementById('placeholder-view');
    if (host) observer.observe(host, { childList: true, subtree: true });
  });
})();
