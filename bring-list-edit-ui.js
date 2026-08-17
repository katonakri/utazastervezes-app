/* Mit hozzunk? card editing/deletion UI. Deliberately event-driven: no observers or polling. */
(() => {
  let activeItemId = null;

  function visibleTextElements() {
    return [...document.querySelectorAll('button, [role="button"], a')].filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
  }

  function openEditFromCard(card) {
    activeItemId = card?.dataset?.bringId || null;
    if (!activeItemId) return;
    const menu = card.querySelector('[data-bring-action="menu"]');
    if (!menu) return;
    menu.click();
    window.setTimeout(() => {
      const candidates = visibleTextElements();
      const edit = candidates.find(el => {
        const t = (el.textContent || '').trim().toLocaleLowerCase('hu-HU');
        return t === 'szerkesztés' || t === 'módosítás' || t.includes('szerkesztés');
      });
      if (edit) edit.click();
      window.setTimeout(addDeleteButtonToModal, 30);
    }, 30);
  }

  function addDeleteButtonToModal() {
    const modal = document.querySelector('#bring-modal-host .bring-modal');
    if (!modal || !activeItemId || modal.querySelector('#bring-delete-top')) return;
    const header = modal.querySelector('.bring-modal__header');
    if (!header) return;
    const button = document.createElement('button');
    button.id = 'bring-delete-top';
    button.type = 'button';
    button.className = 'bring-delete-top';
    button.setAttribute('aria-label', 'Elem törlése');
    button.innerHTML = '<span class="bring-delete-top__icon" aria-hidden="true">🗑</span><span>Törlés</span>';
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!activeItemId) return;
      const name = modal.querySelector('#bring-name')?.value?.trim() || 'ezt az elemet';
      if (!window.confirm(`Biztosan törlöd ezt: „${name}”?`)) return;
      button.disabled = true;
      try {
        const { error: assigneeError } = await supabase.from('bring_item_assignees').delete().eq('item_id', activeItemId);
        if (assigneeError) throw assigneeError;
        const { error } = await supabase.from('bring_items').delete().eq('id', activeItemId);
        if (error) throw error;
        document.getElementById('bring-modal-host')?.remove();
        document.querySelector(`.bring-card[data-bring-id="${CSS.escape(activeItemId)}"]`)?.remove();
        const count = document.getElementById('bring-count');
        const remaining = document.querySelectorAll('.bring-card[data-bring-id]').length;
        if (count) count.textContent = `${remaining} elem`;
        activeItemId = null;
      } catch (error) {
        console.error('Mit hozzunk? törlési hiba', error);
        button.disabled = false;
        alert('Az elem törlése nem sikerült.');
      }
    });
    header.appendChild(button);
  }

  document.addEventListener('click', event => {
    const card = event.target.closest?.('.bring-card[data-bring-id]');
    if (!card) return;
    if (event.target.closest('[data-bring-action="menu"]')) return;
    if (event.target.closest('button, input, textarea, select, a')) return;
    openEditFromCard(card);
  });

  document.addEventListener('click', event => {
    if (event.target.closest('#bring-cancel, #bring-modal-backdrop')) activeItemId = null;
  });
})();
