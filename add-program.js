/* ==================================================================
 * PROGRAM HOZZÁADÁSA — bárki felvehet új programot a Programok nézetből.
 * ================================================================== */
(function () {
  const ADD_BUTTON_ID = 'add-program-btn';
  const MODAL_ID = 'add-program-modal';

  const fields = [
    ['title', 'Program neve', 'text'],
    ['category', 'Kategória', 'select'],
    ['description', 'Rövid leírás', 'textarea'],
    ['image_url', 'Kép URL-je', 'url'],
    ['distance_km', 'Távolság (km)', 'number'],
    ['drive_minutes', 'Autóval (perc)', 'number'],
    ['duration', 'Időtartam', 'text'],
    ['duration_hours_min', 'Időtartam órában', 'number'],
    ['price', 'Kártyán megjelenő ár', 'text'],
    ['price_adult', 'Felnőtt ár', 'text'],
    ['price_child_2', '2 éves gyermek ára', 'text'],
    ['price_sort_value', 'Ár szerinti rendezés értéke', 'number'],
    ['google_rating', 'Google értékelés', 'number'],
    ['google_review_count', 'Google értékelések száma', 'number'],
    ['google_maps_url', 'Google Maps link', 'url'],
    ['official_url', 'Hivatalos / további infó link', 'url'],
    ['latitude', 'Szélesség (latitude)', 'number'],
    ['longitude', 'Hosszúság (longitude)', 'number'],
  ];

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function categoryOptions() {
    return CATEGORIES.filter((cat) => cat.id !== 'osszes')
      .map((cat) => `<option value="${esc(cat.id)}">${esc(cat.label)}</option>`)
      .join('');
  }

  function fieldHtml(name, label, type) {
    const required = ['title', 'category', 'description', 'distance_km', 'drive_minutes', 'duration', 'duration_hours_min', 'price', 'google_maps_url', 'latitude', 'longitude'].includes(name);
    const requiredMark = required ? '' : ' <span>(opcionális)</span>';
    const attrs = [
      `id="add-${name}"`,
      `name="${name}"`,
      `data-field="${name}"`,
      type !== 'textarea' && type !== 'select' ? `type="${type}"` : '',
      required ? 'required' : '',
      ['distance_km', 'duration_hours_min', 'google_rating'].includes(name) ? 'step="0.1" min="0"' : '',
      ['drive_minutes', 'price_sort_value', 'google_review_count'].includes(name) ? 'min="0" step="1"' : '',
      name === 'google_rating' ? 'min="0" max="5" step="0.1"' : '',
      name === 'latitude' ? 'min="-90" max="90" step="any"' : '',
      name === 'longitude' ? 'min="-180" max="180" step="any"' : '',
    ].filter(Boolean).join(' ');

    let control = '';
    if (type === 'textarea') {
      control = `<textarea ${attrs} placeholder="Írj 1–3 mondatot a programról"></textarea>`;
    } else if (type === 'select') {
      control = `<select ${attrs}><option value="">Válassz kategóriát…</option>${categoryOptions()}</select>`;
    } else {
      control = `<input ${attrs} autocomplete="off" />`;
    }
    return `<div class="add-program-field ${name === 'description' || name === 'image_url' || name === 'google_maps_url' || name === 'official_url' ? 'add-program-field--full' : ''}"><label for="add-${name}">${esc(label)}${requiredMark}</label>${control}</div>`;
  }

  function createModal() {
    if (document.getElementById(MODAL_ID)) return;
    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'add-program-modal hidden';
    modal.innerHTML = `
      <div class="add-program-panel" role="dialog" aria-modal="true" aria-labelledby="add-program-title">
        <div class="add-program-header">
          <div>
            <h2 id="add-program-title">Új program hozzáadása</h2>
            <p>A felvitt program azonnal megjelenik a Programok oldalon.</p>
          </div>
          <button class="add-program-close" id="add-program-close" type="button" aria-label="Bezárás">${icon('close', { size: 18 })}</button>
        </div>
        <form class="add-program-form" id="add-program-form">
          <section class="add-program-section">
            <h3 class="add-program-section-title">Alapadatok</h3>
            <div class="add-program-grid">
              ${fieldHtml('title', 'Program neve', 'text')}
              ${fieldHtml('category', 'Kategória', 'select')}
              ${fieldHtml('description', 'Rövid leírás', 'textarea')}
              ${fieldHtml('image_url', 'Kép URL-je', 'url')}
            </div>
          </section>
          <section class="add-program-section">
            <h3 class="add-program-section-title">Távolság és idő</h3>
            <div class="add-program-grid">
              ${fieldHtml('distance_km', 'Távolság (km)', 'number')}
              ${fieldHtml('drive_minutes', 'Autóval (perc)', 'number')}
              ${fieldHtml('duration', 'Időtartam', 'text')}
              ${fieldHtml('duration_hours_min', 'Időtartam órában', 'number')}
            </div>
            <p class="add-program-help">Az „Időtartam órában” csak a rövid/közepes/hosszú jelöléshez és a rendezéshez kell, pl. 1,5 vagy 3.</p>
          </section>
          <section class="add-program-section">
            <h3 class="add-program-section-title">Árak és értékelés</h3>
            <div class="add-program-grid">
              ${fieldHtml('price', 'Kártyán megjelenő ár', 'text')}
              ${fieldHtml('price_adult', 'Felnőtt ár', 'text')}
              ${fieldHtml('price_child_2', '2 éves gyermek ára', 'text')}
              ${fieldHtml('price_sort_value', 'Ár szerinti rendezés értéke', 'number')}
              ${fieldHtml('google_rating', 'Google értékelés', 'number')}
              ${fieldHtml('google_review_count', 'Google értékelések száma', 'number')}
            </div>
            <p class="add-program-help">Az ár szerinti rendezéshez adj meg egy összehasonlítható numerikus értéket, általában a legfontosabb / felnőtt belépő árát forintban.</p>
          </section>
          <section class="add-program-section">
            <h3 class="add-program-section-title">Helyszín és linkek</h3>
            <div class="add-program-grid">
              ${fieldHtml('google_maps_url', 'Google Maps link', 'url')}
              ${fieldHtml('official_url', 'Hivatalos / további infó link', 'url')}
              ${fieldHtml('latitude', 'Szélesség (latitude)', 'number')}
              ${fieldHtml('longitude', 'Hosszúság (longitude)', 'number')}
            </div>
            <p class="add-program-help">A latitude és longitude a Térkép nézetben való pinhez szükséges. Google Mapsből kimásolható koordinátaként.</p>
          </section>
          <p class="add-program-status" id="add-program-status" role="status" aria-live="polite"></p>
          <div class="add-program-actions">
            <button class="add-program-action add-program-action--cancel" id="add-program-cancel" type="button">Mégsem</button>
            <button class="add-program-action add-program-action--save" id="add-program-save" type="submit">Program mentése</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);

    document.getElementById('add-program-close').addEventListener('click', closeModal);
    document.getElementById('add-program-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });
    document.getElementById('add-program-form').addEventListener('submit', saveProgram);
  }

  function openModal() {
    if (state.currentView !== 'programok') return;
    createModal();
    const modal = document.getElementById(MODAL_ID);
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('add-title')?.focus(), 0);
  }

  function closeModal() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function value(name) {
    return document.querySelector(`[data-field="${name}"]`)?.value.trim() || '';
  }

  function num(name) {
    const raw = value(name).replace(',', '.');
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function parseMoney(valueText) {
    const match = String(valueText || '').replace(/\s/g, '').match(/-?\d+(?:[.,]\d+)?/);
    return match ? Number(match[0].replace(',', '.')) : null;
  }

  function setStatus(message, success) {
    const status = document.getElementById('add-program-status');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-success', Boolean(success));
  }

  async function saveProgram(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const saveButton = document.getElementById('add-program-save');
    saveButton.disabled = true;
    setStatus('Mentés…', false);

    const priceText = value('price');
    const priceSort = num('price_sort_value');
    const payload = {
      title: value('title'),
      category: value('category'),
      icon: null,
      image_url: value('image_url') || null,
      description: value('description') || null,
      distance_km: num('distance_km'),
      drive_minutes: num('drive_minutes'),
      duration: value('duration') || null,
      duration_hours_min: num('duration_hours_min'),
      price: priceText || null,
      price_sort_value: priceSort ?? parseMoney(value('price_adult')) ?? parseMoney(priceText),
      google_maps_url: value('google_maps_url') || null,
      official_url: value('official_url') || null,
      is_active: true,
      google_rating: num('google_rating'),
      google_review_count: num('google_review_count'),
      price_adult: value('price_adult') || null,
      price_child_2: value('price_child_2') || null,
      latitude: num('latitude'),
      longitude: num('longitude'),
    };

    try {
      const { error } = await supabase.from('programs').insert(payload);
      if (error) throw error;

      state.programs = await DataStore.getPrograms();
      renderProgramList();
      if (typeof window.refreshProgramMapMarkers === 'function') window.refreshProgramMapMarkers();
      setStatus('A program sikeresen hozzáadva.', true);
      form.reset();
      setTimeout(closeModal, 700);
    } catch (error) {
      console.error('Program hozzáadása sikertelen:', error);
      setStatus(`A mentés nem sikerült: ${error?.message || 'ismeretlen hiba'}`, false);
    } finally {
      saveButton.disabled = false;
    }
  }

  function updateButtonVisibility() {
    const button = document.getElementById(ADD_BUTTON_ID);
    if (!button) return;
    button.classList.toggle('hidden', state.currentView !== 'programok');
  }

  function init() {
    const button = document.getElementById(ADD_BUTTON_ID);
    if (!button) return;
    button.innerHTML = `${icon('plus', { size: 17 })}<span>Új program</span>`;
    button.addEventListener('click', openModal);
    document.querySelectorAll('.bottom-nav-item').forEach((navButton) => navButton.addEventListener('click', () => setTimeout(updateButtonVisibility, 0)));
    updateButtonVisibility();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
