/* Add the Ott vesszük quick filter without touching the stable bring-list renderer. */
(() => {
  const FILTER_ID = 'ottvesz';
  const LABEL = 'Ott vesszük';

  function addFilter() {
    const filters = document.querySelector('.bring-filters');
    if (!filters || filters.querySelector('[data-bring-filter="ottvesz"]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bring-filter bring-filter--ottvesz';
    button.dataset.bringFilter = FILTER_ID;
    button.textContent = LABEL;
    button.addEventListener('click', () => {
      document.querySelectorAll('.bring-filter').forEach(b => b.classList.remove('is-active'));
      button.classList.add('is-active');
      document.querySelectorAll('.bring-card[data-bring-id]').forEach(card => {
        const assignees = card.querySelector('.bring-card__assignees')?.textContent || '';
        card.style.display = assignees.includes(LABEL) ? '' : 'none';
      });
    });
    filters.appendChild(button);
  }

  function resetOnAll() {
    const all = document.querySelector('[data-bring-filter="all"]');
    if (!all || all.dataset.ottveszBound) return;
    all.dataset.ottveszBound = '1';
    all.addEventListener('click', () => {
      document.querySelectorAll('.bring-card[data-bring-id]').forEach(card => { card.style.display = ''; });
    });
  }

  function run() { addFilter(); resetOnAll(); }
  document.addEventListener('DOMContentLoaded', () => { setTimeout(run, 200); setTimeout(run, 800); });
})();
