(() => {
  const COLORS = ['mint','yellow','blue','purple','pink','gray'];
  const COLOR_LABELS = { mint:'Mentazöld', yellow:'Sárga', blue:'Kék', purple:'Lila', pink:'Rózsaszín', gray:'Szürke' };
  const state = { items: [], color:'mint', selected:null };
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const currentUser = () => window.state?.currentUser || SafeStorage.get(CURRENT_USER_KEY) || null;

  // A leírásban szereplő URL-ek automatikusan valódi, kattintható linkekké válnak.
  function linkify(text) {
    const safe = esc(text);
    return safe.replace(/(https?:\/\/[^\s<]+)/g, raw => {
      const trailing = raw.match(/[.,!?;:)]+$/)?.[0] || '';
      const url = trailing ? raw.slice(0, -trailing.length) : raw;
      return `<a class="info-link" href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>${trailing}`;
    });
  }

  function card(item) {
    return `<article class="info-card info-card--${esc(item.color)}" data-info-id="${item.id}" tabindex="0" role="button" aria-label="${esc(item.title)} részletei">
      <div class="info-card__body"><h3>${esc(item.title)}</h3><p>${linkify(item.description)}</p></div>
      <button class="info-card__menu" type="button" aria-label="Szerkesztés" data-info-action="edit">${icon('menu',{size:20})}</button>
    </article>`;
  }

  function render() {
    const p = document.getElementById('placeholder-view');
    if (!p) return;
    p.innerHTML = `<section class="info-view" aria-label="Infók">
      <div class="info-view__header"><div class="info-kicker">Hasznos tudnivalók</div><h2>Infók</h2><p>Fontos információk az utazáshoz, egy helyen.</p></div>
      <div class="info-list" id="info-list">${state.items.length ? state.items.map(card).join('') : `<div class="info-empty">${icon('info',{size:38})}<h3>Még nincs infó</h3><p>Adj hozzá egy fontos tudnivalót a + gombbal.</p></div>`}</div>
      <button class="info-add" id="info-add" type="button" aria-label="Új infó hozzáadása"><span>+</span><small>Új infó</small></button>
    </section>`;
  }

  async function load() {
    const { data, error } = await supabase.from('info_items').select('*').order('created_at',{ascending:true});
    if (error) throw error;
    state.items = data || [];
    render();
  }

  function openDetail(item) {
    closeHost();
    const host = document.createElement('div');
    host.id = 'info-modal-host';
    host.innerHTML = `<div class="info-modal-backdrop" id="info-detail-backdrop"></div>
      <section class="info-modal info-detail-modal" role="dialog" aria-modal="true" aria-labelledby="info-detail-title">
        <div class="info-modal__header">
          <button class="bring-back" id="info-detail-close" type="button" aria-label="Vissza">${icon('chevronLeft',{size:22})}</button>
          <div><div class="info-kicker">Infó</div><h2 id="info-detail-title">${esc(item.title)}</h2></div>
        </div>
        <div class="info-detail-content info-card--${esc(item.color)}"><p>${linkify(item.description)}</p></div>
      </section>`;
    document.body.appendChild(host);
    host.querySelector('#info-detail-close').onclick = closeHost;
    host.querySelector('#info-detail-backdrop').onclick = closeHost;
  }

  function openEditor(item = null) {
    closeHost();
    state.color = item?.color || 'mint';
    const options = COLORS.map(c => `<button type="button" class="info-color-option ${state.color===c?'is-selected':''}" data-info-color="${c}">${COLOR_LABELS[c]}</button>`).join('');
    const host = document.createElement('div');
    host.id = 'info-modal-host';
    host.innerHTML = `<section class="info-modal info-editor" role="dialog" aria-modal="true" aria-labelledby="info-editor-title">
      <div class="info-editor__header">
        <button class="bring-back" id="info-editor-close" type="button" aria-label="Vissza">${icon('chevronLeft',{size:22})}</button>
        <div class="info-editor__heading"><div class="info-kicker">${item ? 'Szerkesztés' : 'Új infó'}</div><h2 id="info-editor-title">${item ? 'Infó módosítása' : 'Új infó hozzáadása'}</h2></div>
        <button class="info-save info-save--top" id="info-save" type="button">${item ? 'Mentés' : 'Hozzáadás'}</button>
      </div>
      <div class="info-form">
        <label>Cím<input id="info-title" maxlength="120" value="${esc(item?.title||'')}" placeholder="Pl. Szállás"></label>
        <label>Leírás <span>– az ide beírt URL-ek automatikusan kattinthatók lesznek</span><textarea id="info-description" maxlength="2000" placeholder="Írd le a fontos tudnivalót...">${esc(item?.description||'')}</textarea></label>
        <div class="info-color-label">Kártya színe</div><div class="info-color-options">${options}</div>
        ${item ? `<button class="info-delete" id="info-delete" type="button">${icon('close',{size:17})} Kártya törlése</button>` : ''}
      </div>
    </section>`;
    document.body.appendChild(host);
    host.querySelector('#info-editor-close').onclick = closeHost;
    host.querySelector('#info-save').onclick = () => save(item?.id || null);
    host.querySelectorAll('[data-info-color]').forEach(b => b.onclick = () => {
      state.color = b.dataset.infoColor;
      host.querySelectorAll('[data-info-color]').forEach(x => x.classList.toggle('is-selected', x === b));
    });
    if (item) host.querySelector('#info-delete').onclick = () => remove(item);
    host.querySelector('#info-title').focus();
  }

  function closeHost() { document.getElementById('info-modal-host')?.remove(); }

  async function save(id) {
    const title = document.getElementById('info-title')?.value.trim();
    const description = document.getElementById('info-description')?.value.trim();
    if (!title || !description) { alert('A cím és a leírás megadása kötelező.'); return; }
    const payload = { title, description, color:state.color, created_by:currentUser(), updated_at:new Date().toISOString() };
    try {
      const q = id ? await supabase.from('info_items').update(payload).eq('id',id) : await supabase.from('info_items').insert(payload);
      if (q.error) throw q.error;
      closeHost(); await load();
    } catch(e) { console.error('Infó mentési hiba',e); alert('Az infó mentése nem sikerült.'); }
  }

  async function remove(item) {
    if (!confirm(`Biztosan törlöd ezt az infót?\n\n„${item.title}”`)) return;
    try {
      const {error} = await supabase.from('info_items').delete().eq('id',item.id);
      if (error) throw error;
      closeHost(); await load();
    } catch(e) { console.error('Infó törlési hiba',e); alert('Az infó törlése nem sikerült.'); }
  }

  function show() {
    document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.toggle('is-active', b.dataset.view === 'info'));
    const infoNav = document.querySelector('.bottom-nav-item[data-view="info"] .bn-icon');
    if (infoNav) infoNav.innerHTML = icon('info',{size:21});
    document.getElementById('program-list')?.classList.add('hidden');
    document.querySelector('.sort-bar')?.classList.add('hidden');
    document.getElementById('category-bar')?.classList.add('hidden');
    document.getElementById('placeholder-view')?.classList.remove('hidden');
    render(); load().catch(e => console.error('Infók betöltési hiba',e));
  }

  function init() {
    const infoNav = document.querySelector('.bottom-nav-item[data-view="info"] .bn-icon');
    if (infoNav) infoNav.innerHTML = icon('info',{size:21});
    document.addEventListener('click', e => {
      const nav = e.target.closest('.bottom-nav-item[data-view="info"]');
      if (nav) { e.preventDefault(); e.stopImmediatePropagation(); show(); return; }
      if (e.target.closest('#info-add')) { openEditor(); return; }
      const editBtn = e.target.closest('[data-info-action="edit"]');
      if (editBtn) { e.stopPropagation(); const c = editBtn.closest('.info-card'); const item = state.items.find(x => String(x.id) === c?.dataset.infoId); if(item) openEditor(item); return; }
      const c = e.target.closest('.info-card');
      if (c && !e.target.closest('a')) { const item = state.items.find(x => String(x.id) === c.dataset.infoId); if(item) openDetail(item); }
    }, true);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeHost();
      const c = e.target.closest?.('.info-card');
      if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); const item = state.items.find(x => String(x.id) === c.dataset.infoId); if(item) openDetail(item); }
    });
  }
  document.addEventListener('DOMContentLoaded', init);
  window.InfoView = { show };
})();