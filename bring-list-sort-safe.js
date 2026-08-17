/* Mit hozzunk? — safe client-side sorting, no observers or polling. */
(() => {
  const SORT_KEY = 'bring_list_sort_safe';
  const DIR_KEY = 'bring_list_sort_dir_safe';
  let currentMode = localStorage.getItem(SORT_KEY) || 'assignee';
  let descending = localStorage.getItem(DIR_KEY) === 'desc';

  const assigneeRank = text => {
    const value = String(text || '');
    if (value.includes('Deli és Peti')) return 1;
    if (value.includes('Tina és Kristóf')) return 2;
    if (value.includes('Ármin')) return 3;
    if (value.includes('Ott vesszük')) return 4;
    if (value.includes('Még senki')) return 5;
    return 6;
  };

  function compare(a, b) {
    const aName = a.querySelector('h3')?.textContent?.trim() || '';
    const bName = b.querySelector('h3')?.textContent?.trim() || '';
    let result;
    if (currentMode === 'name') {
      result = aName.localeCompare(bName, 'hu', { sensitivity: 'base' });
    } else {
      result = assigneeRank(a.querySelector('.bring-card__assignees')?.textContent) - assigneeRank(b.querySelector('.bring-card__assignees')?.textContent);
      if (result === 0) result = aName.localeCompare(bName, 'hu', { sensitivity: 'base' });
    }
    return descending ? -result : result;
  }

  function sortCards() {
    const list = document.getElementById('bring-list');
    if (!list) return;
    const cards = [...list.querySelectorAll(':scope > .bring-card[data-bring-id]')];
    if (cards.length < 2) return;
    cards.sort(compare);
    const fragment = document.createDocumentFragment();
    cards.forEach(card => fragment.appendChild(card));
    list.appendChild(fragment);
  }

  function installControls() {
    const filters = document.querySelector('.bring-filters');
    if (!filters || document.querySelector('.bring-sort-safe')) return;

    const wrap = document.createElement('div');
    wrap.className = 'bring-sort bring-sort-safe';
    wrap.innerHTML = `
      <label for="bring-sort-select-safe">Rendezés:</label>
      <select id="bring-sort-select-safe" aria-label="Lista rendezése">
        <option value="assignee">Ki hozza?</option>
        <option value="name">Megnevezés</option>
      </select>
      <button id="bring-sort-dir-safe" type="button" aria-label="Rendezési irány"></button>`;
    filters.insertAdjacentElement('afterend', wrap);

    const select = wrap.querySelector('select');
    const direction = wrap.querySelector('button');
    select.value = currentMode;
    direction.textContent = descending ? '↓' : '↑';

    select.addEventListener('change', () => {
      currentMode = select.value;
      localStorage.setItem(SORT_KEY, currentMode);
      sortCards();
    });
    direction.addEventListener('click', () => {
      descending = !descending;
      localStorage.setItem(DIR_KEY, descending ? 'desc' : 'asc');
      direction.textContent = descending ? '↓' : '↑';
      sortCards();
    });
  }

  function wireView() {
    installControls();
    sortCards();

    const host = document.getElementById('placeholder-view');
    if (!host || host.dataset.sortSafeWired === '1') return;
    host.dataset.sortSafeWired = '1';

    // These listeners run on the actual controls after the existing bring-list
    // document-level handler has rendered the new list. No MutationObserver.
    host.addEventListener('click', event => {
      const filter = event.target.closest('[data-bring-filter]');
      const add = event.target.closest('#bring-add');
      if (!filter && !add) return;
      setTimeout(() => {
        installControls();
        sortCards();
      }, 0);
    });
  }

  // The bottom-nav button is a stable target. After the existing bring-list
  // handler opens the view, wire the sorting controls once the DOM is ready.
  document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.bottom-nav-item[data-view="menu"]');
    menuButton?.addEventListener('click', () => setTimeout(wireView, 0));
  });
})();
