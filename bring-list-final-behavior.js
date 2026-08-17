/* Final UX behavior for Mit hozzunk?: direct edit + Ott vesszük quick filter. */
(() => {
  const OTT = 'Ott vesszük';

  function addOttFilter() {
    const filters = document.querySelector('.bring-filters');
    if (!filters || filters.querySelector('[data-bring-filter="ottvesz-final"]')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.bringFilter = 'ottvesz-final';
    btn.className = 'bring-filter bring-filter--neutral';
    btn.textContent = OTT;
    btn.addEventListener('click', () => {
      window.setTimeout(() => {
        filters.querySelectorAll('.bring-filter').forEach(x => x.classList.remove('is-active'));
        btn.classList.add('is-active');
        document.querySelectorAll('#bring-list .bring-card[data-bring-id]').forEach(card => {
          card.style.display = (card.querySelector('.bring-card__assignees')?.textContent || '').includes(OTT) ? '' : 'none';
        });
      }, 0);
    });
    filters.appendChild(btn);
  }

  function addDirectEdit() {
    const list = document.getElementById('bring-list');
    if (!list || list.dataset.finalEditBound === '1') return;
    list.dataset.finalEditBound = '1';
    list.addEventListener('click', event => {
      const card = event.target.closest('.bring-card[data-bring-id]');
      if (!card || card.dataset.bringId === 'preview') return;
      if (event.target.closest('.bring-card__menu')) return;
      // Existing app action menu is the only supported editor entry point.
      const menu = card.querySelector('[data-bring-action="menu"]');
      if (!menu) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      menu.click();
      window.setTimeout(() => {
        const candidates = [...document.querySelectorAll('button, [role="button"]')];
        const edit = candidates.find(x => /^szerkeszt/i.test((x.textContent || '').trim()));
        if (edit) edit.click();
      }, 0);
    }, true);
  }

  function run() { addOttFilter(); addDirectEdit(); }
  document.addEventListener('DOMContentLoaded', () => {
    [100, 350, 800, 1500].forEach(ms => setTimeout(run, ms));
  });
  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="menu"]')) [50, 200, 500].forEach(ms => setTimeout(run, ms));
  }, true);
})();
