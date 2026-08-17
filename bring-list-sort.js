/* Mit hozzunk? — client-side sorting for the rendered list. */
(() => {
  const SORT_KEY = 'bring_list_sort';
  const DIR_KEY = 'bring_list_sort_direction';
  const RANK = { 'Deli és Peti': 1, 'Tina és Kristóf': 2, 'Ármin': 3, 'Ott vesszük': 4, 'Még senki': 99 };
  let sorting = false;

  function currentSort() { return localStorage.getItem(SORT_KEY) || 'assignee'; }
  function currentDir() { return localStorage.getItem(DIR_KEY) === 'desc' ? -1 : 1; }
  function assigneeLabel(card) { return card.querySelector('.bring-assignee')?.textContent?.trim() || 'Még senki'; }

  function sortCards() {
    const list = document.getElementById('bring-list');
    if (!list || sorting) return;
    const cards = [...list.querySelectorAll(':scope > .bring-card[data-bring-id]')];
    if (cards.length < 2) return;
    const sort = currentSort(), dir = currentDir();
    cards.sort((a, b) => {
      if (sort === 'name') return dir * (a.querySelector('h3')?.textContent || '').localeCompare(b.querySelector('h3')?.textContent || '', 'hu');
      const al = assigneeLabel(a), bl = assigneeLabel(b);
      return dir * ((RANK[al] ?? 98) - (RANK[bl] ?? 98) || al.localeCompare(bl, 'hu') || (a.querySelector('h3')?.textContent || '').localeCompare(b.querySelector('h3')?.textContent || '', 'hu'));
    });
    sorting = true;
    const fragment = document.createDocumentFragment();
    cards.forEach(card => fragment.appendChild(card));
    list.appendChild(fragment);
    sorting = false;
  }

  function ensureControls() {
    const filters = document.querySelector('.bring-filters');
    if (!filters || document.querySelector('.bring-sort')) return;
    const wrap = document.createElement('div');
    wrap.className = 'bring-sort';
    wrap.innerHTML = '<label for="bring-sort-select">Rendezés:</label><select id="bring-sort-select" aria-label="Lista rendezése"><option value="assignee">Ki hozza?</option><option value="name">Megnevezés</option></select><button id="bring-sort-direction" type="button" aria-label="Rendezési irány megfordítása">↕</button>';
    filters.insertAdjacentElement('afterend', wrap);
    const select = wrap.querySelector('select');
    select.value = currentSort();
    select.addEventListener('change', () => { localStorage.setItem(SORT_KEY, select.value); sortCards(); });
    wrap.querySelector('button').addEventListener('click', () => { localStorage.setItem(DIR_KEY, currentDir() === 1 ? 'desc' : 'asc'); sortCards(); });
  }

  function refresh() { ensureControls(); sortCards(); }
  document.addEventListener('DOMContentLoaded', refresh);
  const observer = new MutationObserver(() => requestAnimationFrame(refresh));
  document.addEventListener('DOMContentLoaded', () => {
    const host = document.getElementById('placeholder-view');
    if (host) observer.observe(host, { childList: true, subtree: true });
  });
})();
