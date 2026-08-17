/* Program szerkesztés a felületről. Nincs observer/polling. */
(() => {
  const fields = [
    ['title', 'Cím', 'text'],
    ['description', 'Leírás', 'textarea'],
    ['category', 'Kategória', 'select'],
    ['image_url', 'Kép URL', 'text'],
    ['google_maps_url', 'Google Maps link', 'text'],
    ['official_url', 'Hivatalos weboldal', 'text'],
    ['drive_minutes', 'Autóút (perc)', 'number'],
    ['distance_km', 'Távolság (km)', 'number'],
    ['duration', 'Időtartam', 'text'],
    ['price', 'Ár', 'text']
  ];
  let editingId = null;

  function esc(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function categoryOptions(current) {
    const cats = window.CATEGORIES || [];
    return cats.map(c => `<option value="${esc(c.id)}" ${String(c.id) === String(current) ? 'selected' : ''}>${esc(c.label)}</option>`).join('');
  }
  function openEditor(program) {
    editingId = program.id;
    const html = `<div class="program-edit-backdrop" id="program-edit-backdrop"></div>
      <section class="program-edit-modal" role="dialog" aria-modal="true" aria-labelledby="program-edit-title">
        <div class="program-edit-header">
          <button type="button" id="program-edit-close" aria-label="Bezárás">‹</button>
          <div><div class="program-edit-kicker">Program szerkesztése</div><h2 id="program-edit-title">${esc(program.title)}</h2></div>
        </div>
        <div class="program-edit-form">
          <button type="button" class="program-edit-save" id="program-edit-save">Mentés</button>
          ${fields.map(([key,label,type]) => {
            if (type === 'textarea') return `<label>${label}<textarea id="program-edit-${key}" maxlength="2000">${esc(program[key])}</textarea></label>`;
            if (type === 'select') return `<label>${label}<select id="program-edit-${key}">${categoryOptions(program[key])}</select></label>`;
            return `<label>${label}<input id="program-edit-${key}" type="${type}" value="${esc(program[key])}"></label>`;
          }).join('')}
        </div>
      </section>`;
    const host = document.createElement('div'); host.id = 'program-edit-host'; host.innerHTML = html; document.body.appendChild(host);
    document.getElementById('program-edit-close').addEventListener('click', closeEditor);
    document.getElementById('program-edit-backdrop').addEventListener('click', closeEditor);
    document.getElementById('program-edit-save').addEventListener('click', saveEditor);
  }
  function closeEditor() { document.getElementById('program-edit-host')?.remove(); editingId = null; }
  async function saveEditor() {
    const p = state.programs.find(x => String(x.id) === String(editingId));
    if (!p) return;
    const payload = {
      title: document.getElementById('program-edit-title').value.trim(),
      description: document.getElementById('program-edit-description').value.trim() || null,
      category: document.getElementById('program-edit-category').value,
      image_url: document.getElementById('program-edit-image_url').value.trim() || null,
      google_maps_url: document.getElementById('program-edit-google_maps_url').value.trim() || null,
      official_url: document.getElementById('program-edit-official_url').value.trim() || null,
      drive_minutes: Number(document.getElementById('program-edit-drive_minutes').value) || null,
      distance_km: Number(document.getElementById('program-edit-distance_km').value) || null,
      duration: document.getElementById('program-edit-duration').value.trim() || null,
      price: document.getElementById('program-edit-price').value.trim() || null
    };
    const button = document.getElementById('program-edit-save');
    button.disabled = true; button.textContent = 'Mentés…';
    try {
      const { error } = await supabase.from('programs').update(payload).eq('id', editingId);
      if (error) throw error;
      Object.assign(p, payload);
      closeEditor();
      renderProgramList();
      if (state.activeDetailId === editingId) renderDetailBody(editingId);
    } catch (e) {
      console.error('Program módosítási hiba', e);
      alert('A program módosítása nem sikerült.');
      button.disabled = false; button.textContent = 'Mentés';
    }
  }

  const originalDetail = window.renderDetailBody;
  if (typeof originalDetail === 'function' && !originalDetail.__programEditWrapped) {
    const wrapped = function(id) {
      const result = originalDetail.apply(this, arguments);
      const p = state.programs.find(x => String(x.id) === String(id));
      const content = document.querySelector('#sheet-body .sheet-content');
      if (p && content && !content.querySelector('.program-edit-trigger')) {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'program-edit-trigger'; btn.textContent = 'Program módosítása';
        btn.addEventListener('click', () => openEditor(p));
        content.appendChild(btn);
      }
      return result;
    };
    wrapped.__programEditWrapped = true;
    window.renderDetailBody = wrapped;
  }
})();
