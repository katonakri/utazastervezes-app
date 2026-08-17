/* ==================================================================
 * PROGRAM KEZELÉS — új program hozzáadása + meglévő program szerkesztése
 * ================================================================== */
(function () {
  const MODAL_ID = 'program-editor-modal';
  const BUTTON_ID = 'add-program-btn';
  let editingId = null;

  const fields = [
    ['title', 'Program neve', 'text', true],
    ['category', 'Kategória', 'select', true],
    ['description', 'Rövid leírás', 'textarea', false],
    ['image_url', 'Kép URL-je', 'url', false],
    ['distance_km', 'Távolság (km)', 'number', false],
    ['drive_minutes', 'Autóval (perc)', 'number', false],
    ['duration', 'Időtartam', 'text', false],
    ['duration_hours_min', 'Időtartam órában', 'number', false],
    ['price', 'Kártyán megjelenő ár', 'text', false],
    ['price_adult', 'Felnőtt ár', 'text', false],
    ['price_child_2', '2 éves gyermek ára', 'text', false],
    ['price_sort_value', 'Ár szerinti rendezés értéke', 'number', false],
    ['google_rating', 'Google értékelés', 'number', false],
    ['google_review_count', 'Google értékelések száma', 'number', false],
    ['google_maps_url', 'Google Maps link', 'url', false],
    ['official_url', 'Hivatalos / további infó link', 'url', false],
    ['latitude', 'Szélesség (latitude)', 'number', false],
    ['longitude', 'Hosszúság (longitude)', 'number', false],
  ];

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categories = () => CATEGORIES.filter(c => c.id !== 'osszes').map(c => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join('');

  function control([name, label, type, required]) {
    const req = required ? ' required' : '';
    const cls = ['description','image_url','google_maps_url','official_url'].includes(name) ? ' program-editor-field--full' : '';
    let el;
    if (type === 'textarea') el = `<textarea id="pe-${name}" data-field="${name}"${req} placeholder="1–3 mondat a programról"></textarea>`;
    else if (type === 'select') el = `<select id="pe-${name}" data-field="${name}"${req}><option value="">Válassz kategóriát…</option>${categories()}</select>`;
    else el = `<input id="pe-${name}" data-field="${name}" type="${type}"${req} autocomplete="off">`;
    return `<div class="program-editor-field${cls}"><label for="pe-${name}">${esc(label)}${required ? '' : ' <span>opcionális</span>'}</label>${el}</div>`;
  }

  function createModal() {
    if (document.getElementById(MODAL_ID)) return;
    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'program-editor-modal hidden';
    modal.innerHTML = `<div class="program-editor-panel" role="dialog" aria-modal="true" aria-labelledby="pe-title">
      <div class="program-editor-header"><div><h2 id="pe-title">Új program hozzáadása</h2><p id="pe-subtitle">A program azonnal megjelenik a Programok oldalon.</p></div><button type="button" class="program-editor-close" id="pe-close">×</button></div>
      <form id="program-editor-form" class="program-editor-form">
        <section><h3>Alapadatok</h3><div class="program-editor-grid">${fields.slice(0,4).map(control).join('')}</div></section>
        <section><h3>Távolság és idő</h3><div class="program-editor-grid">${fields.slice(4,8).map(control).join('')}</div></section>
        <section><h3>Árak és értékelés</h3><div class="program-editor-grid">${fields.slice(8,14).map(control).join('')}</div><p class="program-editor-help">Az ár szerinti rendezési érték opcionális; ha üres, a rendszer megpróbálja az első számszerű árat használni.</p></section>
        <section><h3>Helyszín és linkek</h3><div class="program-editor-grid">${fields.slice(14).map(control).join('')}</div><p class="program-editor-help">A latitude és longitude a Térkép nézet pinjéhez szükséges.</p></section>
        <p id="pe-status" class="program-editor-status"></p>
        <div class="program-editor-actions"><button type="button" id="pe-cancel" class="program-editor-cancel">Mégsem</button><button type="submit" id="pe-save" class="program-editor-save">Program mentése</button></div>
      </form></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#pe-close').onclick = close;
    modal.querySelector('#pe-cancel').onclick = close;
    modal.onclick = e => { if (e.target === modal) close(); };
    modal.querySelector('#program-editor-form').onsubmit = save;
  }

  const val = n => document.querySelector(`[data-field="${n}"]`)?.value.trim() || '';
  const num = n => { const v = val(n).replace(',', '.'); if (!v) return null; const x = Number(v); return Number.isFinite(x) ? x : null; };
  const money = v => { const m = String(v || '').replace(/\s/g,'').match(/\d+(?:[.,]\d+)?/); return m ? Number(m[0].replace(',','.')) : null; };

  function fill(p) {
    fields.forEach(([name]) => { const el = document.querySelector(`[data-field="${name}"]`); if (!el) return; el.value = p[name] ?? ''; });
  }

  function open(p = null) {
    if (state.currentView !== 'programok') return;
    createModal(); editingId = p ? Number(p.id) : null;
    const modal = document.getElementById(MODAL_ID);
    document.getElementById('pe-title').textContent = p ? 'Program szerkesztése' : 'Új program hozzáadása';
    document.getElementById('pe-subtitle').textContent = p ? 'Módosítsd a program adatait, majd mentsd el.' : 'A program azonnal megjelenik a Programok oldalon.';
    document.getElementById('pe-save').textContent = p ? 'Módosítások mentése' : 'Program mentése';
    document.getElementById('pe-status').textContent = '';
    document.getElementById('program-editor-form').reset();
    if (p) fill(p);
    modal.classList.remove('hidden'); document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('pe-title')?.focus(), 0);
  }
  function close() { const m = document.getElementById(MODAL_ID); if (m) m.classList.add('hidden'); document.body.style.overflow = ''; editingId = null; }

  async function save(e) {
    e.preventDefault();
    const form = e.currentTarget; if (!form.reportValidity()) return;
    const button = document.getElementById('pe-save'); button.disabled = true; document.getElementById('pe-status').textContent = 'Mentés…';
    const price = val('price');
    const payload = {
      title: val('title'), category: val('category'), icon: null, image_url: val('image_url') || null, description: val('description') || null,
      distance_km: num('distance_km'), drive_minutes: num('drive_minutes'), duration: val('duration') || null, duration_hours_min: num('duration_hours_min'),
      price: price || null, price_sort_value: num('price_sort_value') ?? money(val('price_adult')) ?? money(price),
      google_maps_url: val('google_maps_url') || null, official_url: val('official_url') || null, is_active: true,
      google_rating: num('google_rating'), google_review_count: num('google_review_count'), price_adult: val('price_adult') || null,
      price_child_2: val('price_child_2') || null, latitude: num('latitude'), longitude: num('longitude')
    };
    try {
      const result = editingId
        ? await supabase.from('programs').update(payload).eq('id', editingId)
        : await supabase.from('programs').insert(payload);
      if (result.error) throw result.error;
      state.programs = await DataStore.getPrograms(); renderProgramList();
      if (typeof window.refreshProgramMapMarkers === 'function') window.refreshProgramMapMarkers();
      document.getElementById('pe-status').textContent = editingId ? 'A módosítások mentve.' : 'A program hozzáadva.';
      setTimeout(close, 500);
    } catch (err) {
      console.error(err); document.getElementById('pe-status').textContent = `A mentés nem sikerült: ${err?.message || 'ismeretlen hiba'}`;
    } finally { button.disabled = false; }
  }

  function ensureAddButton() {
    if (document.getElementById(BUTTON_ID)) return;
    const header = document.querySelector('.header-content'); if (!header) return;
    const b = document.createElement('button'); b.id = BUTTON_ID; b.className = 'add-program-btn'; b.type = 'button'; b.setAttribute('aria-label','Új program hozzáadása'); b.innerHTML = '<span class="add-program-plus">+</span><span class="add-program-label">Új program</span>';
    b.onclick = () => open(); header.appendChild(b);
  }

  function ensureEditButton() {
    const body = document.getElementById('sheet-body'); if (!body || body.querySelector('.program-edit-detail-btn')) return;
    const p = state.programs.find(x => Number(x.id) === Number(state.activeDetailId)); if (!p) return;
    const actions = body.querySelector('.sheet-actions'); if (!actions) return;
    const b = document.createElement('button'); b.type='button'; b.className='btn btn--outline program-edit-detail-btn'; b.innerHTML='✎ Program szerkesztése'; b.onclick=()=>open(p); actions.prepend(b);
  }

  function updateVisibility() { const b=document.getElementById(BUTTON_ID); if(b) b.classList.toggle('is-hidden', state.currentView !== 'programok'); }

  document.addEventListener('DOMContentLoaded', () => {
    ensureAddButton(); createModal(); updateVisibility();
    document.querySelectorAll('.bottom-nav-item').forEach(b => b.addEventListener('click', () => setTimeout(updateVisibility, 0)));
    const headerObserver = new MutationObserver(() => { ensureAddButton(); updateVisibility(); }); headerObserver.observe(document.getElementById('app'), {childList:true,subtree:true});
    const sheet = document.getElementById('sheet-body'); if(sheet) new MutationObserver(ensureEditButton).observe(sheet,{childList:true,subtree:true});
    document.addEventListener('keydown', e => { if(e.key==='Escape' && !document.getElementById(MODAL_ID)?.classList.contains('hidden')) close(); });
  });
})();
