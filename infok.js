(() => {
  const INFO_COLORS = [
    { id: 'mint', label: 'Mentazöld', bg: '#E7F6ED', fg: '#2E9E5B' },
    { id: 'yellow', label: 'Halványsárga', bg: '#FBF2DC', fg: '#B9840D' },
    { id: 'blue', label: 'Világoskék', bg: '#E8F2FD', fg: '#2B7FD1' },
    { id: 'purple', label: 'Halványlila', bg: '#F0EBFA', fg: '#7C5CBF' },
    { id: 'pink', label: 'Halványrózsaszín', bg: '#FBEAEC', fg: '#C45A70' },
    { id: 'gray', label: 'Világosszürke', bg: '#F1F2F4', fg: '#667085' },
  ];

  const infoState = { items: [], editingId: null, menuId: null };

  function esc(value) {
    return String(value ?? '').replace(/[&<>\"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function linkify(value) {
    const safe = esc(value);
    return safe.replace(/(^|[\s>])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
  }

  function colorDef(id) { return INFO_COLORS.find(c => c.id === id) || INFO_COLORS[0]; }

  function renderCard(item) {
    const color = colorDef(item.color);
    const menuOpen = infoState.menuId === item.id;
    return `<article class="info-card info-card--${esc(color.id)}" data-info-id="${item.id}">
      <div class="info-card__content"><h3>${esc(item.title)}</h3><div class="info-card__description">${linkify(item.description)}</div></div>
      <button class="info-card__menu" type="button" aria-label="Műveletek" aria-expanded="${menuOpen}">⋮</button>
      ${menuOpen ? `<div class="info-card__actions" role="menu"><button type="button" data-info-action="edit" role="menuitem">Szerkesztés</button><button type="button" data-info-action="delete" role="menuitem">Törlés</button></div>` : ''}
    </article>`;
  }

  function renderList() {
    const list = document.getElementById('info-list');
    if (!list) return;
    if (!infoState.items.length) {
      list.innerHTML = `<div class="info-empty">${icon('info', { size: 42 })}<h3>Még nincs hozzáadott infó</h3><p>Rögzítsétek itt a szállás címét, érkezési időt, linkeket és minden egyéb fontos tudnivalót.</p></div>`;
      return;
    }
    list.innerHTML = infoState.items.map(renderCard).join('');
  }

  function renderView() {
    const host = document.getElementById('info-view');
    if (!host) return;
    host.innerHTML = `<section class="info-page" aria-label="Infók">
      <div class="info-page__header"><div><div class="info-kicker">Közös utazási információk</div><h2>Infók</h2><p>Itt gyűjthetitek össze egy helyre az utazással kapcsolatos fontos tudnivalókat.</p></div></div>
      <div class="info-list" id="info-list"></div>
      <button class="info-add" id="info-add" type="button"><span aria-hidden="true">+</span>Új infó hozzáadása</button>
    </section>`;
    renderList();
    document.getElementById('info-add').addEventListener('click', () => openModal());
  }

  async function loadItems() {
    const { data, error } = await supabase.from('info_items').select('id, title, description, color, created_by, created_at, updated_at').order('created_at', { ascending: false });
    if (error) throw error;
    infoState.items = data || [];
    renderList();
  }

  function modalHtml(item = null) {
    const selected = item?.color || 'mint';
    return `<div class="info-modal-backdrop" id="info-modal-backdrop"></div>
      <section class="info-modal" role="dialog" aria-modal="true" aria-labelledby="info-modal-title">
        <div class="info-modal__header"><button class="info-back" id="info-cancel" type="button" aria-label="Vissza">${icon('chevronLeft', { size: 22 })}</button><h2 id="info-modal-title">${item ? 'Infó szerkesztése' : 'Új infó hozzáadása'}</h2><button class="info-header-save" id="info-header-save" type="button">Mentés</button></div>
        <div class="info-form">
          <label for="info-title">Cím <span>*</span></label>
          <input id="info-title" maxlength="120" placeholder="Pl. Szállás címe, Érkezés tervezett időpontja..." value="${esc(item?.title || '')}" autocomplete="off">
          <label for="info-description">Leírás <span>*</span></label>
          <textarea id="info-description" maxlength="2000" placeholder="Írd ide az információkat, címeket, linkeket, időpontokat, egyéb tudnivalókat...">${esc(item?.description || '')}</textarea>
          <div class="info-color-label">Kártya színe</div>
          <div class="info-color-options" role="radiogroup" aria-label="Kártya színe">${INFO_COLORS.map(c => `<button type="button" class="info-color-option ${selected === c.id ? 'is-selected' : ''}" data-info-color="${c.id}" role="radio" aria-checked="${selected === c.id}" title="${c.label}" style="--info-color-bg:${c.bg}; --info-color-fg:${c.fg}"><span></span></button>`).join('')}</div>
          <button class="info-save" id="info-save" type="button">Mentés</button>
        </div>
      </section>`;
  }

  function openModal(item = null) {
    infoState.editingId = item?.id || null;
    const host = document.createElement('div');
    host.id = 'info-modal-host';
    host.innerHTML = modalHtml(item);
    document.body.appendChild(host);
    document.getElementById('info-title').focus();
    const save = () => saveItem();
    document.getElementById('info-cancel').addEventListener('click', closeModal);
    document.getElementById('info-modal-backdrop').addEventListener('click', closeModal);
    document.getElementById('info-save').addEventListener('click', save);
    document.getElementById('info-header-save').addEventListener('click', save);
    host.querySelectorAll('[data-info-color]').forEach(btn => btn.addEventListener('click', () => {
      host.querySelectorAll('[data-info-color]').forEach(x => { const active = x === btn; x.classList.toggle('is-selected', active); x.setAttribute('aria-checked', String(active)); });
    }));
  }

  function closeModal() { document.getElementById('info-modal-host')?.remove(); infoState.editingId = null; }

  async function saveItem() {
    const titleEl = document.getElementById('info-title');
    const descriptionEl = document.getElementById('info-description');
    const title = titleEl?.value.trim() || '';
    const description = descriptionEl?.value.trim() || '';
    const selected = document.querySelector('.info-color-option.is-selected')?.dataset.infoColor || 'mint';
    if (!title) { titleEl?.focus(); return; }
    if (!description) { descriptionEl?.focus(); return; }
    const payload = { title, description, color: selected, created_by: state.currentUser || SafeStorage.get(CURRENT_USER_KEY) || null, updated_at: new Date().toISOString() };
    try {
      if (infoState.editingId) {
        const { error } = await supabase.from('info_items').update(payload).eq('id', infoState.editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('info_items').insert(payload);
        if (error) throw error;
      }
      await loadItems();
      closeModal();
    } catch (error) {
      console.error('Infó mentési hiba', error);
      alert('Az infó mentése nem sikerült. Ellenőrizd a Supabase kapcsolatot.');
    }
  }

  async function deleteItem(item) {
    if (!confirm(`Biztosan törlöd ezt: „${item.title}”?`)) return;
    try {
      const { error } = await supabase.from('info_items').delete().eq('id', item.id);
      if (error) throw error;
      infoState.menuId = null;
      await loadItems();
    } catch (error) {
      console.error('Infó törlési hiba', error);
      alert('Az infó törlése nem sikerült.');
    }
  }

  function openInfoView() {
    const programList = document.getElementById('program-list');
    const sortBar = document.querySelector('.sort-bar');
    const categoryBar = document.getElementById('category-bar');
    const placeholder = document.getElementById('placeholder-view');
    const infoView = document.getElementById('info-view');
    programList?.classList.add('hidden'); sortBar?.classList.add('hidden'); categoryBar?.classList.add('hidden'); placeholder?.classList.add('hidden'); infoView?.classList.remove('hidden');
    document.querySelectorAll('.bottom-nav-item').forEach(btn => { const active = btn.dataset.view === 'infok'; btn.classList.toggle('is-active', active); btn.setAttribute('aria-current', active ? 'page' : 'false'); });
    if (!infoView?.dataset.rendered) { renderView(); infoView.dataset.rendered = 'true'; }
    loadItems().catch(error => { console.error('Infók betöltési hiba', error); const list = document.getElementById('info-list'); if (list) list.innerHTML = `<div class="info-empty"><h3>Az infók betöltése nem sikerült.</h3><p>Ellenőrizd a Supabase kapcsolatot.</p></div>`; });
  }

  function handleNavigationCapture(event) {
    const btn = event.target.closest?.('.bottom-nav-item');
    if (!btn) return;
    if (btn.dataset.view === 'infok') {
      event.preventDefault(); event.stopImmediatePropagation(); state.currentView = 'infok'; openInfoView();
    } else {
      document.getElementById('info-view')?.classList.add('hidden');
    }
  }

  function handleInfoListClick(event) {
    const card = event.target.closest?.('.info-card');
    if (!card) return;
    const item = infoState.items.find(x => String(x.id) === card.dataset.infoId);
    if (!item) return;
    if (event.target.closest('.info-card__menu')) { infoState.menuId = infoState.menuId === item.id ? null : item.id; renderList(); return; }
    const action = event.target.closest('[data-info-action]')?.dataset.infoAction;
    if (action === 'edit') { infoState.menuId = null; openModal(item); }
    if (action === 'delete') { infoState.menuId = null; deleteItem(item); }
  }

  document.addEventListener('click', event => {
    const list = document.getElementById('info-list');
    if (!list || document.getElementById('info-view')?.classList.contains('hidden')) return;
    if (!event.target.closest('.info-card__actions') && !event.target.closest('.info-card__menu')) { infoState.menuId = null; renderList(); }
  });
  document.addEventListener('click', handleNavigationCapture, true);
  document.addEventListener('click', event => { const list = document.getElementById('info-list'); if (list && !list.classList.contains('hidden')) handleInfoListClick(event); });

  const boot = () => {
    const infoBtn = document.querySelector('#bottom-nav [data-view="infok"]');
    if (infoBtn) infoBtn.querySelector('.bn-icon').innerHTML = icon('info', { size: 21 });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
