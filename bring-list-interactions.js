/* Mit hozzunk? — közvetlen kártya-szerkesztés és kuka */
(() => {
  const TRASH_PATH = '<path d="M5 7h14"/><path d="M9 7V5h6v2"/><path d="M7 7l1 13h8l1-13"/><path d="M10 10v7M14 10v7"/>';
  try { Object.assign(ICON_PATHS, { trash: TRASH_PATH }); } catch (e) {}

  function enhanceCards() {
    document.querySelectorAll('.bring-card[data-bring-id]').forEach(card => {
      const button = card.querySelector('.bring-card__menu');
      if (!button || button.dataset.enhanced === '1') return;
      button.dataset.enhanced = '1';
      button.removeAttribute('data-bring-action');
      button.dataset.bringTrash = '1';
      button.setAttribute('aria-label', 'Elem törlése');
      button.title = 'Elem törlése';
      try { button.innerHTML = icon('trash', { size: 17, strokeWidth: 1.8 }); } catch (e) { button.textContent = '×'; }
    });
  }

  async function deleteItem(card) {
    const id = card?.dataset?.bringId;
    const name = card?.querySelector('h3')?.textContent?.trim() || 'ezt az elemet';
    if (!id) return;
    if (!window.confirm(`Biztosan törlöd ezt: „${name}”?`)) return;
    try {
      const { error } = await supabase.from('bring_items').delete().eq('id', id);
      if (error) throw error;
      if (window.BringList?.show) window.BringList.show();
    } catch (error) {
      console.error('Mit hozzunk? törlési hiba', error);
      window.alert('Az elem törlése nem sikerült.');
    }
  }

  document.addEventListener('click', (event) => {
    const trash = event.target.closest('.bring-card__menu[data-bring-trash="1"]');
    if (trash) {
      event.preventDefault();
      event.stopPropagation();
      deleteItem(trash.closest('.bring-card'));
      return;
    }

    const card = event.target.closest('.bring-card[data-bring-id]');
    if (!card || event.target.closest('.bring-card__menu')) return;

    /* A meglévő szerkesztő modalt használjuk, de a régi választó promptot kihagyjuk. */
    const menu = card.querySelector('.bring-card__menu');
    if (!menu) return;
    event.preventDefault();
    const oldPrompt = window.prompt;
    try {
      window.prompt = () => '1';
      menu.setAttribute('data-bring-action', 'menu');
      menu.click();
    } finally {
      window.prompt = oldPrompt;
      menu.removeAttribute('data-bring-action');
    }
  }, true);

  const observer = new MutationObserver(() => enhanceCards());
  document.addEventListener('DOMContentLoaded', () => {
    enhanceCards();
    const host = document.getElementById('placeholder-view');
    if (host) observer.observe(host, { childList: true, subtree: true });
  });
})();
