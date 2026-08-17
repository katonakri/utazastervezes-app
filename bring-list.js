Object.assign(ICON_PATHS, {
  bag: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  grill: '<path d="M5 9h14l-1.2 5.2a6.2 6.2 0 0 1-11.6 0L5 9z"/><line x1="12" y1="14.5" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/><path d="M8 6c0-1.4 1-1.8 1-3M12 6c0-1.4 1-1.8 1-3M16 6c0-1.4 1-1.8 1-3"/>',
  salad: '<path d="M4 11h16c0 5-3.2 8-8 8s-8-3-8-8z"/><path d="M7 11c0-3 2-5 5-5s5 2 5 5M9 8c1-2 2-3 3-3M15 8c-1-2-2-3-3-3"/>',
  drink: '<path d="M7 5h10l-1 15H8L7 5z"/><line x1="8" y1="9" x2="16" y2="9"/><path d="M13 5c1-2 2-3 3-4"/>',
  chips: '<path d="M5 9c2-2 4-2 7 0s5 2 7 0v8c-2 2-4 2-7 0s-5-2-7 0V9z"/><path d="M8 11c1 1 1 2 0 3M12 10c1 1 1 2 0 3M16 11c1 1 1 2 0 3"/>',
  plate: '<ellipse cx="12" cy="13" rx="8" ry="5"/><ellipse cx="12" cy="13" rx="5" ry="2.8"/><path d="M4 13v2c0 3 3.5 5 8 5s8-2 8-5v-2"/>',
  cup: '<path d="M6 6h12l-1 14H7L6 6z"/><path d="M8 6c0-2 1.5-3 4-3s4 1 4 3"/>',
  bottle: '<path d="M10 4h4v3l2 2v11H8V9l2-2V4z"/><line x1="10" y1="4" x2="14" y2="4"/>',
  cutlery: '<path d="M7 4v7M5 4v4c0 2 1 3 2 3s2-1 2-3V4M7 11v9M15 4v16M15 4c3 2 4 5 0 7"/>',
  ice: '<path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9M6.8 4.8l10.4 14.4M17.2 4.8L6.8 19.2"/>',
  towel: '<path d="M6 4h12v16H6z"/><path d="M9 4v16M15 4v16"/>'
});

(() => {
  const BRING_USERS = [
    { id: 'Deli', label: 'Deli és Peti', members: ['Deli', 'Peti'], color: 'purple' },
    { id: 'Tina', label: 'Tina és Kristóf', members: ['Tina', 'Kristóf'], color: 'teal' },
    { id: 'Ármin', label: 'Ármin', members: ['Ármin'], color: 'yellow' },
  ];
  const USER_COLOR = { Deli: 'purple', Peti: 'purple', Tina: 'teal', Kristóf: 'teal', 'Ármin': 'yellow' };
  const ICON_KEYWORDS = [
    { icon: 'grill', words: ['grill', 'szén', 'faszén'] },
    { icon: 'salad', words: ['saláta', 'zöldség'] },
    { icon: 'drink', words: ['limonádé', 'üdítő', 'ital', 'víz', 'cola', 'lé'] },
    { icon: 'chips', words: ['chips', 'ropi', 'nasi', 'snack'] },
    { icon: 'plate', words: ['tányér', 'tál'] },
    { icon: 'cup', words: ['pohár', 'bögre'] },
    { icon: 'bottle', words: ['ketchup', 'mustár', 'szósz', 'palack'] },
    { icon: 'cutlery', words: ['evőeszköz', 'villa', 'kanál', 'kés'] },
    { icon: 'ice', words: ['jég', 'hűtő'] },
    { icon: 'towel', words: ['papír', 'törlő', 'szalvéta'] },
    { icon: 'bag', words: ['szemetes', 'zsák', 'zacskó'] },
  ];
  const state = { items: [], filter: 'all', editingId: null };

  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function detectIcon(text) {
    const normalized = String(text || '').toLocaleLowerCase('hu-HU');
    return (ICON_KEYWORDS.find(x => x.words.some(w => normalized.includes(w))) || {}).icon || 'bag';
  }
  function getAssignees(item) { return item.assignees || []; }
  function colorForAssignees(assignees) {
    if (!assignees.length) return 'unassigned';
    const colors = [...new Set(assignees.map(a => USER_COLOR[a]).filter(Boolean))];
    return colors.length === 1 ? colors[0] : 'mixed';
  }
  function isMine(item) {
    const current = state.currentUser || SafeStorage.get(CURRENT_USER_KEY);
    return getAssignees(item).includes(current);
  }
  function visibleItems() {
    if (state.filter === 'mine') return state.items.filter(isMine);
    const group = BRING_USERS.find(x => x.id === state.filter);
    if (group) return state.items.filter(item => getAssignees(item).some(a => group.members.includes(a)));
    return state.items;
  }
  function groupLabelForUser(name) {
    const group = BRING_USERS.find(g => g.members.includes(name));
    return group ? group.label : name;
  }
  function assigneeChips(item) {
    const assignees = getAssignees(item);
    if (!assignees.length) return '<span class="bring-assignee bring-assignee--none">Még senki</span>';
    const labels = [...new Set(assignees.map(groupLabelForUser))];
    return labels.map(label => {
      const member = BRING_USERS.find(g => g.label === label);
      const color = member?.color || 'neutral';
      return `<span class="bring-assignee bring-assignee--${color}">${icon('users', { size: 14 })}${esc(label)}</span>`;
    }).join('');
  }
  function itemCard(item) {
    const color = colorForAssignees(getAssignees(item));
    return `<article class="bring-card bring-card--${color}" data-bring-id="${item.id}">
      <div class="bring-card__icon">${icon(item.icon_key || detectIcon(item.name), { size: 30, strokeWidth: 1.7 })}</div>
      <div class="bring-card__body"><h3>${esc(item.name)}</h3>${item.description ? `<p>${esc(item.description)}</p>` : ''}<div class="bring-card__assignees">${assigneeChips(item)}</div></div>
      <button class="bring-card__menu" type="button" aria-label="Műveletek" data-bring-action="menu">⋮</button>
    </article>`;
  }
  function filtersHtml() {
    return `<div class="bring-filters" role="tablist" aria-label="Lista szűrése">
      <button class="bring-filter ${state.filter === 'all' ? 'is-active' : ''}" data-bring-filter="all" type="button">Összes</button>
      <button class="bring-filter ${state.filter === 'mine' ? 'is-active' : ''}" data-bring-filter="mine" type="button">${icon('users', { size: 15 })}Saját elemeim</button>
      ${BRING_USERS.map(g => `<button class="bring-filter bring-filter--${g.color} ${state.filter === g.id ? 'is-active' : ''}" data-bring-filter="${esc(g.id)}" type="button"><span class="bring-dot"></span>${esc(g.label)}</button>`).join('')}
    </div>`;
  }
  function renderList() {
    const el = document.getElementById('bring-list');
    if (!el) return;
    const items = visibleItems();
    el.innerHTML = items.length ? items.map(itemCard).join('') : `<div class="bring-empty">${icon('bag', { size: 38 })}<h3>Nincs még ilyen elem</h3><p>Adj hozzá valamit a listához a <strong>+</strong> gombbal.</p></div>`;
    const count = document.getElementById('bring-count');
    if (count) count.textContent = `${items.length} elem`;
  }
  function renderView() {
    const placeholder = document.getElementById('placeholder-view');
    placeholder.innerHTML = `<section class="bring-view" aria-label="Mit hozzunk?">
      <div class="bring-view__header"><div><div class="bring-kicker">Közös lista</div><h2>Mit hozzunk?</h2><p>Hogy semmi ne maradjon otthon.</p></div><div class="bring-total" id="bring-count"></div></div>
      ${filtersHtml()}<div class="bring-list" id="bring-list"></div>
      <div class="bring-legend"><span><i class="purple"></i>Deli és Peti</span><span><i class="teal"></i>Tina és Kristóf</span><span><i class="yellow"></i>Ármin</span><span><i class="none"></i>Nincs gazda</span></div>
      <button class="bring-add" id="bring-add" type="button" aria-label="Új elem hozzáadása"><span>+</span><small>Új elem</small></button>
    </section>`;
    renderList();
  }
  function selectedMembers() { return [...document.querySelectorAll('[data-bring-members]:checked')].flatMap(input => input.dataset.bringMembers.split(',')); }
  function modalHtml(item = null) {
    const assignees = new Set(getAssignees(item || {}));
    return `<div class="bring-modal-backdrop" id="bring-modal-backdrop"></div><section class="bring-modal" role="dialog" aria-modal="true" aria-labelledby="bring-modal-title">
      <div class="bring-modal__header"><button class="bring-back" id="bring-cancel" type="button">${icon('chevronLeft', { size: 22 })}</button><div><div class="bring-kicker">${item ? 'Szerkesztés' : 'Új elem'}</div><h2 id="bring-modal-title">${item ? 'Elem módosítása' : 'Új elem hozzáadása'}</h2></div></div>
      <div class="bring-form">
        <label>Mit hozzunk?<input id="bring-name" maxlength="80" placeholder="Pl. Saláta, Limonádé, Tányérok..." value="${esc(item?.name || '')}" autocomplete="off"></label>
        <label>Leírás <span>(opcionális)</span><textarea id="bring-description" maxlength="160" placeholder="További részletek, mennyiség, megjegyzés...">${esc(item?.description || '')}</textarea></label>
        <div class="bring-field-label">Ki hozza? <span>(opcionális, később is bejelölhető)</span></div>
        <div class="bring-assignee-options">${BRING_USERS.map(g => `<label class="bring-option bring-option--${g.color}"><input type="checkbox" value="${esc(g.members.join(','))}" data-bring-members="${esc(g.members.join(','))}" ${g.members.some(m => assignees.has(m)) ? 'checked' : ''}><span class="bring-option__dot"></span><span>${esc(g.label)}</span><span class="bring-check">✓</span></label>`).join('')}</div>
        <div class="bring-preview-label">Előnézet</div><div class="bring-preview" id="bring-preview"></div><button class="bring-save" id="bring-save" type="button">${item ? 'Mentés' : 'Hozzáadás'}</button>
      </div></section>`;
  }
  function updatePreview() {
    const name = document.getElementById('bring-name')?.value.trim() || 'Saláta';
    const description = document.getElementById('bring-description')?.value.trim() || '';
    const el = document.getElementById('bring-preview');
    if (el) el.innerHTML = itemCard({ id: 'preview', name, description, assignees: selectedMembers() });
  }
  function openModal(item = null) {
    const host = document.createElement('div'); host.id = 'bring-modal-host'; host.innerHTML = modalHtml(item); document.body.appendChild(host); state.editingId = item?.id || null;
    document.getElementById('bring-name').focus();
    document.getElementById('bring-name').addEventListener('input', updatePreview);
    document.getElementById('bring-description').addEventListener('input', updatePreview);
    document.querySelectorAll('[data-bring-members]').forEach(x => x.addEventListener('change', updatePreview));
    document.getElementById('bring-cancel').addEventListener('click', closeModal);
    document.getElementById('bring-modal-backdrop').addEventListener('click', closeModal);
    document.getElementById('bring-save').addEventListener('click', saveItem); updatePreview();
  }
  function closeModal() { document.getElementById('bring-modal-host')?.remove(); state.editingId = null; }
  async function saveItem() {
    const name = document.getElementById('bring-name').value.trim();
    const description = document.getElementById('bring-description').value.trim() || null;
    const assignees = selectedMembers();
    if (!name) { document.getElementById('bring-name').focus(); return; }
    const payload = { name, description, icon_key: detectIcon(name), created_by: state.currentUser || SafeStorage.get(CURRENT_USER_KEY) || null, updated_at: new Date().toISOString() };
    try {
      let itemId = state.editingId;
      if (itemId) { const { error } = await supabase.from('bring_items').update(payload).eq('id', itemId); if (error) throw error; const { error: deleteError } = await supabase.from('bring_item_assignees').delete().eq('item_id', itemId); if (deleteError) throw deleteError; }
      else { const { data, error } = await supabase.from('bring_items').insert(payload).select('id').single(); if (error) throw error; itemId = data.id; }
      if (assignees.length) { const { error } = await supabase.from('bring_item_assignees').insert(assignees.map(user_name => ({ item_id: itemId, user_name }))); if (error) throw error; }
      await loadItems(); closeModal(); renderList();
    } catch (error) { console.error('Mit hozzunk? mentési hiba', error); alert('Az elem mentése nem sikerült. Ellenőrizd a Supabase beállításokat.'); }
  }
  async function deleteItem(item) {
    if (!confirm(`Biztosan törlöd ezt: „${item.name}”?`)) return;
    try { const { error } = await supabase.from('bring_items').delete().eq('id', item.id); if (error) throw error; await loadItems(); renderList(); }
    catch (error) { console.error('Mit hozzunk? törlési hiba', error); alert('Az elem törlése nem sikerült.'); }
  }
  async function loadItems() {
    const { data, error } = await supabase.from('bring_items').select('id,name,description,icon_key,created_by,created_at,updated_at,bring_item_assignees(user_name)').order('created_at', { ascending: true });
    if (error) throw error;
    state.items = (data || []).map(row => ({ ...row, assignees: (row.bring_item_assignees || []).map(x => x.user_name) }));
  }
  function showBringView() {
    state.filter = 'all';
    document.getElementById('program-list').classList.add('hidden'); document.querySelector('.sort-bar').classList.add('hidden'); document.getElementById('category-bar').classList.add('hidden'); document.getElementById('placeholder-view').classList.remove('hidden');
    renderView();
    loadItems().then(renderList).catch(error => { console.error('Mit hozzunk? betöltési hiba', error); const list = document.getElementById('bring-list'); if (list) list.innerHTML = '<div class="bring-empty"><h3>Nem sikerült betölteni a listát</h3><p>Ellenőrizd a Supabase kapcsolatot.</p></div>'; });
    document.querySelectorAll('.bottom-nav-item').forEach(btn => btn.classList.toggle('is-active', btn.dataset.view === 'menu'));
  }
  function init() {
    const menuBtn = document.querySelector('.bottom-nav-item[data-view="menu"]'); if (!menuBtn) return;
    menuBtn.innerHTML = `<span class="bn-icon"></span>Mit hozzunk?`; menuBtn.querySelector('.bn-icon').innerHTML = icon('bag', { size: 21 });
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.bottom-nav-item[data-view="menu"]');
      if (btn) { e.preventDefault(); e.stopImmediatePropagation(); showBringView(); return; }
      const filter = e.target.closest('[data-bring-filter]');
      if (filter) { state.filter = filter.dataset.bringFilter; document.querySelectorAll('[data-bring-filter]').forEach(x => x.classList.toggle('is-active', x === filter)); renderList(); return; }
      if (e.target.closest('#bring-add')) { openModal(); return; }
      const card = e.target.closest('.bring-card');
      if (card && e.target.closest('[data-bring-action="menu"]')) { const item = state.items.find(x => String(x.id) === card.dataset.bringId); if (!item) return; const choice = prompt(`Mit szeretnél tenni?\n\n1 = Szerkesztés\n2 = Törlés`, '1'); if (choice === '1') openModal(item); if (choice === '2') deleteItem(item); }
    }, true);
  }
  document.addEventListener('DOMContentLoaded', init);
  window.BringList = { show: showBringView, leave: () => document.getElementById('bring-modal-host')?.remove() };
})();
