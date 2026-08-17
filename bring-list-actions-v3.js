/* Mit hozzunk? — card interaction polish. No observers, no polling. */
(() => {
  function runMenuAction(card, action) {
    const menu = card?.querySelector('[data-bring-action="menu"]');
    if (!menu) return;
    const originalPrompt = window.prompt;
    window.prompt = () => action === 'edit' ? '1' : '2';
    try { menu.click(); } finally { window.prompt = originalPrompt; }
    if (action === 'edit') setTimeout(cleanupModal, 0);
    if (action === 'delete') setTimeout(addTrashButtons, 50);
  }

  function addTrashButtons() {
    document.querySelectorAll('#bring-list .bring-card[data-bring-id]').forEach(card => {
      if (card.querySelector('.bring-card__delete')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bring-card__delete';
      button.setAttribute('aria-label', 'Elem törlése');
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      card.appendChild(button);
    });
  }

  function moveSaveToTopAndRemovePreview() {
    const form = document.querySelector('#bring-modal-host .bring-form');
    const save = document.getElementById('bring-save');
    if (!form || !save) return;
    form.querySelector('.bring-preview-label')?.remove();
    form.querySelector('#bring-preview')?.remove();
    save.classList.add('bring-save--top');
    if (form.firstElementChild !== save) form.insertBefore(save, form.firstElementChild);
  }

  function cleanupModal() { moveSaveToTopAndRemovePreview(); }

  document.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.bring-card__delete');
    if (deleteButton) {
      event.preventDefault();
      event.stopPropagation();
      runMenuAction(deleteButton.closest('.bring-card'), 'delete');
      return;
    }

    const card = event.target.closest('#bring-list .bring-card[data-bring-id]');
    if (card && !event.target.closest('[data-bring-action="menu"]')) {
      event.preventDefault();
      runMenuAction(card, 'edit');
      return;
    }

    if (event.target.closest('[data-bring-filter]')) setTimeout(addTrashButtons, 0);
    if (event.target.closest('#bring-add')) setTimeout(cleanupModal, 0);
  }, false);

  const originalShow = window.BringList?.show;
  if (originalShow && !originalShow.__actionsV3) {
    const wrappedShow = function () {
      const result = originalShow.apply(this, arguments);
      setTimeout(addTrashButtons, 150);
      setTimeout(addTrashButtons, 600);
      return result;
    };
    wrappedShow.__actionsV3 = true;
    window.BringList.show = wrappedShow;
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addTrashButtons, 150);
    setTimeout(cleanupModal, 150);
  });
})();
