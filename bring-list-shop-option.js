/* Mit hozzunk? — "Ott vesszük" option + filter. Intentionally avoids a mutation loop. */
(() => {
  const SHOP_VALUE = 'OTT_VESSZUK';
  const SHOP_LABEL = 'Ott vesszük';
  let lastFilter = false;

  function addShopOptionToModal() {
    const options = document.querySelector('.bring-assignee-options');
    if (!options || options.querySelector('[data-bring-shop-option]')) return;
    const option = document.createElement('label');
    option.className = 'bring-option bring-option--shop';
    option.dataset.bringShopOption = 'true';
    option.innerHTML = `<input type="checkbox" data-bring-members="${SHOP_VALUE}"><span class="bring-option__dot"></span><span>${SHOP_LABEL}</span><span class="bring-check">✓</span>`;
    options.appendChild(option);
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
      lastFilter = !lastFilter;
      filters.querySelectorAll('.bring-filter').forEach(b => b.classList.remove('is-active'));
      if (!lastFilter) filters.querySelector('[data-bring-filter="all"]')?.classList.add('is-active');
      button.classList.toggle('is-active', lastFilter);
      applyShopFilter();
    });
    filters.appendChild(button);
  }

  function applyShopFilter() {
    document.querySelectorAll('.bring-card[data-bring-id]').forEach(card => {
      const hasShop = [...card.querySelectorAll('.bring-assignee')].some(x => x.textContent.trim() === SHOP_VALUE || x.textContent.trim() === SHOP_LABEL);
      card.style.display = !lastFilter || hasShop ? '' : 'none';
    });
  }

  function markShopCards() {
    document.querySelectorAll('.bring-assignee').forEach(chip => {
      if (chip.textContent.trim() === SHOP_VALUE) {
        chip.textContent = SHOP_LABEL;
        chip.classList.add('bring-assignee--shop');
      }
    });
    document.querySelectorAll('.bring-card[data-bring-id]').forEach(card => {
      const hasShop = [...card.querySelectorAll('.bring-assignee')].some(x => x.textContent.trim() === SHOP_LABEL);
      card.classList.toggle('bring-card--shop', hasShop);
    });
  }

  function refresh() {
    addShopOptionToModal();
    addShopFilter();
    markShopCards();
    applyShopFilter();
  }

  function scheduleRefresh() { requestAnimationFrame(refresh); }

  document.addEventListener('DOMContentLoaded', refresh);
  document.addEventListener('click', event => {
    if (event.target.closest('#bring-add, .bring-card[data-bring-id]')) scheduleRefresh();
  });

  const observer = new MutationObserver(() => scheduleRefresh());
  document.addEventListener('DOMContentLoaded', () => {
    const host = document.getElementById('placeholder-view');
    if (host) observer.observe(host, { childList: true, subtree: true });
  });
})();
