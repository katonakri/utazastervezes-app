/* Mit hozzunk? — "Ott vesszük" option and filter. No observers/polling. */
(() => {
  const OPTION_ID = 'bring-ott-vesz-option';
  const FILTER_ID = 'bring-filter-ott-vesz';

  function addAssigneeOption() {
    const options = document.querySelector('.bring-assignee-options');
    if (!options || document.getElementById(OPTION_ID)) return;
    const label = document.createElement('label');
    label.id = OPTION_ID;
    label.className = 'bring-option bring-option--neutral';
    label.innerHTML = '<input type="checkbox" value="Ott vesszük" data-bring-members="Ott vesszük"><span class="bring-option__dot"></span><span>Ott vesszük</span><span class="bring-check">✓</span>';
    options.appendChild(label);
  }

  function addFilter() {
    const filters = document.querySelector('.bring-filters');
    if (!filters || document.getElementById(FILTER_ID)) return;
    const button = document.createElement('button');
    button.id = FILTER_ID;
    button.className = 'bring-filter bring-filter--neutral';
    button.type = 'button';
    button.textContent = 'Ott vesszük';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      filters.querySelectorAll('.bring-filter').forEach(b => b.classList.remove('is-active'));
      button.classList.add('is-active');
      document.querySelectorAll('#bring-list .bring-card[data-bring-id]').forEach(card => {
        const assigned = [...card.querySelectorAll('.bring-assignee')].some(el => el.textContent.trim() === 'Ott vesszük');
        card.style.display = assigned ? '' : 'none';
      });
    });
    filters.appendChild(button);
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('#bring-add') || event.target.closest('.bring-card[data-bring-id]')) {
      window.setTimeout(addAssigneeOption, 30);
    }
    if (event.target.closest('[data-view="menu"]')) {
      window.setTimeout(() => { addFilter(); addAssigneeOption(); }, 80);
    }
    const allFilter = event.target.closest('[data-bring-filter="all"]');
    if (allFilter) window.setTimeout(() => {
      document.querySelectorAll('#bring-list .bring-card[data-bring-id]').forEach(card => card.style.display = '');
      document.getElementById(FILTER_ID)?.classList.remove('is-active');
    }, 0);
  }, false);

  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(() => { addFilter(); addAssigneeOption(); }, 100);
  });
})();
