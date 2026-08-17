/* Direct card-to-editor behavior for Mit hozzunk? */
(() => {
  function bind() {
    const list = document.getElementById('bring-list');
    if (!list || list.dataset.directEditBound === '1') return;
    list.dataset.directEditBound = '1';
    list.addEventListener('click', (event) => {
      const card = event.target.closest('.bring-card[data-bring-id]');
      if (!card) return;
      // Never intercept the add-preview card or empty state.
      const id = card.dataset.bringId;
      if (!id || id === 'preview') return;
      event.preventDefault();
      event.stopPropagation();
      const item = (window.BringListItems || []).find(x => String(x.id) === String(id));
      if (item && typeof window.openBringEditModal === 'function') {
        window.openBringEditModal(item);
      }
    }, true);
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(bind, 150));
  window.setTimeout(bind, 500);
})();
