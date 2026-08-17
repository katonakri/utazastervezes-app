/* Mit hozzunk? — "Ott vesszük" option + filter */
(() => {
  const SHOP_VALUE = 'OTT_VESSZUK';
  const SHOP_LABEL = 'Ott vesszük';
  let filterActive = false;

  function addShopOptionToModal() {
    const options = document.querySelector('.bring-assignee-options');
    if (!options || options.querySelector('[data-bring-shop-option]')) return;

    const option = document.createElement('label');
    option.className = 'bring-option bring-option--shop';
    option.dataset.bringShopOption = 'true';
    option.innerHTML = `<input type="checkbox" data-bring-members="${SHOP_VALUE}"><span class="bring-option__dot"></span><span>${SHOP_LABEL}</span><span class="bring-check">✓</span>`;
    options.appendChild(option);

    const editingId = document.querySelector('#bring-modal-host')?.dataset?.editingId;
    if (editingId) return;
  }

  function addShopFilter() {
    const filters = document.querySelector('.bring-filters');
    if (!filters || filters.querySelector('[data-bring-shop-filter]')) return;

    const button = document.createElement('button');
    button.className = 'bring-filter bring-filter--shop';
    button.type = 'button';
    button.dataset.bringShopFilter = 'true';
    button.textContent = SHOP_LABEL;
    button.addEventListener('click', () => {
      filterActive = !filterActive;
      filters.querySelectorAll('.bring-filter').forEach(b => b.classList.remove('is-active'));
      button.classList.toggle('is-active', filterActive);
      applyShopFilter();
    });
    filters.appendChild(button);
  }

  function applyShopFilter() {
    document.querySelectorAll('.bring-card[data-bring-id]').forEach(card => {
      const hasShop = [...card.querySelectorAll('.bring-assignee')].some(x => x.textContent.trim() === SHOP_LABEL);
      card.style.display = !filterActive || hasShop ? '' : 'none';
    });
  }

  function markShopCards() {
    document.querySelectorAll('.bring-card[data-bring-id]').forEach(card => {
      const hasShop = [...card.querySelectorAll('.bring-assignee')].some(x => x.textContent.trim() === SHOP_LABEL);
      card.classList.toggle('bring-card--shop', hasShop);
    });
    applyShopFilter();
  }

  function refresh() {
    addShopOptionToModal();
    addShopFilter();
    markShopCards();
  }

  const observer = new MutationObserver(refresh);
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', refresh);
})();
