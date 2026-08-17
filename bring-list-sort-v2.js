/* Mit hozzunk? — safe client-side sorting. No observers, no polling. */
(() => {
  const SORT_KEY = 'bring_list_sort_v2';
  const DIR_KEY = 'bring_list_sort_dir_v2';
  const DEFAULT_SORT = 'assignee';
  const DEFAULT_DIR = 'asc';

  function getSort() { try { return localStorage.getItem(SORT_KEY) || DEFAULT_SORT; } catch { return DEFAULT_SORT; } }
  function getDir() { try { return localStorage.getItem(DIR_KEY) || DEFAULT_DIR; } catch { return DEFAULT_DIR; } }
  function save(key, value) { try { localStorage.setItem(key, value); } catch {} }

  function assigneeRank(card) {
    const text = card.querySelector('.bring-card__assignees')?.textContent?.trim() || 'Még senki';
    if (text.includes('Deli és Peti')) return 1;
    if (text.includes('Tina és Kristóf')) return 2;
    if (text.includes('Ármin')) return 3;
    if (text.includes('Ott vesszük')) return 4;
    return 5;
  }

  function sortCards() {
    const list = document.getElementById('bring-list');
    if (!list) return;
    const cards = [...list.querySelectorAll('.bring-card[data-bring-id]')];
    if (cards.length < 2) return;
    const sort = getSort();
    const dir = getDir() === 'desc' ? -1 : 1;
    cards.sort((a, b) => {
      let result = 0;
      if (sort === 'name') {
        result = (a.querySelector('h3')?.textContent || '').localeCompare(b.querySelector('h3')?.textContent || '', 'hu');
      } else {
        result = assigneeRank(a) - assigneeRank(b);
        if (!result) result = (a.querySelector('h3')?.textContent || '').localeCompare(b.querySelector('h3')?.textContent || '', 'hu');
      }
      return result * dir;
    });
    const fragment = document.createDocumentFragment();
    cards.forEach(card => fragment.appendChild(card));
    list.appendChild(fragment);
  }

  function updateDirectionButton() {
    const button = document.getElementById('bring-sort-direction');
    if (!button) return;
    const desc = getDir() === 'desc';
    button.textContent = desc ? '↓' : '↑';
    button.setAttribute('aria-label', desc ? 'Fordított sorrend' : 'Növekvő sorrend');
  }

  function ensureControls() {
    const view = document.querySelector('.bring-view');
    const filters = view?.querySelector('.bring-filters');
    if (!view || !filters) return;
    let controls = document.getElementById('bring-sort-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.id = 'bring-sort-controls';
      controls.className = 'bring-sort-controls';
      controls.innerHTML = `
        <label for="bring-sort-select">Rendezés:</label>
        <select id="bring-sort-select" aria-label="Lista rendezése">
          <option value="assignee">Ki hozza?</option>
          <option value="name">Megnevezés</option>
        </select>
        <button id="bring-sort-direction" type="button" aria-label="Növekvő sorrend">↑</button>`;
      filters.insertAdjacentElement('afterend', controls);
      const select = controls.querySelector('#bring-sort-select');
      select.value = getSort();
      select.addEventListener('change', () => { save(SORT_KEY, select.value); sortCards(); });
      controls.querySelector('#bring-sort-direction').addEventListener('click', () => {
        save(DIR_KEY, getDir() === 'desc' ? 'asc' : 'desc');
        updateDirectionButton();
        sortCards();
      });
    }
    const select = controls.querySelector('#bring-sort-select');
    if (select) select.value = getSort();
    updateDirectionButton();
    sortCards();
  }

  function refreshAfterNavigation() {
    window.setTimeout(() => { ensureControls(); }, 0);
  }

  document.addEventListener('click', event => {
    if (event.target.closest('.bottom-nav-item[data-view="menu"]') || event.target.closest('[data-bring-filter]')) {
      refreshAfterNavigation();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    ensureControls();
    // The main bring-list renderer runs on the same DOMContentLoaded cycle.
    window.setTimeout(ensureControls, 50);
  });
})();
