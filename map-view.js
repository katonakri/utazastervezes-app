/* ==================================================================
 * TÉRKÉP — Leaflet/OpenStreetMap based interactive program map.
 * ================================================================== */

(function () {
  const MAP_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'osszes' && c.id !== 'etterem');
  let map = null;
  let markerLayer = null;
  let userMarker = null;
  let selectedProgramId = null;
  let activeMapCategory = 'osszes';

  function mapPrograms() {
    const programs = state.programs.filter((p) =>
      p.is_active !== false && p.latitude != null && p.longitude != null && p.category !== 'etterem'
    );
    if (activeMapCategory === 'osszes') return programs;
    return programs.filter((p) => p.category === activeMapCategory);
  }

  function categoryConfig(category) {
    return CATEGORIES.find((c) => c.id === category) || { label: category, icon: 'grid' };
  }

  function markerIcon(p) {
    const cat = categoryConfig(p.category);
    return L.divIcon({
      className: 'custom-map-marker',
      html: `<div class="map-marker map-marker--${escapeHtml(p.category)}"><span class="map-marker__inner">${icon(cat.icon, { size: 19 })}</span></div>`,
      iconSize: [42, 42],
      iconAnchor: [21, 42],
      popupAnchor: [0, -42],
    });
  }

  function priceMarkup(p) {
    if (!p.price_adult && !p.price_child_2) return '';
    return `<div class="map-result-prices">
      <div class="map-price"><span>Felnőtt</span><strong>${escapeHtml(p.price_adult || '-')}</strong></div>
      <div class="map-price"><span>2 éves gyermek</span><strong>${escapeHtml(p.price_child_2 || '-')}</strong></div>
    </div>`;
  }

  function showResult(p) {
    selectedProgramId = Number(p.id);
    const cat = categoryConfig(p.category);
    const sheet = document.getElementById('map-result-sheet');
    const content = document.getElementById('map-result-content');
    content.innerHTML = `
      <img class="map-result-image" src="${p.image_url || ''}" alt="${escapeHtml(p.title)}" loading="lazy" onerror="this.style.visibility='hidden'" />
      <div class="map-result-info">
        <h2 class="map-result-title">${escapeHtml(p.title)}</h2>
        <div class="map-result-meta">
          <span class="map-result-category">${icon(cat.icon, { size: 13 })}${escapeHtml(cat.label)}</span>
          <span>${formatKm(p.distance_km ?? '-')} km</span>
          <span>${p.drive_minutes ?? '-'} perc</span>
        </div>
        <p class="map-result-desc">${escapeHtml(p.description || '')}</p>
      </div>
      ${priceMarkup(p)}
      <div class="map-result-actions">
        <button class="btn btn--outline" id="map-detail-btn" type="button">${icon('info', { size: 16 })}Részletek</button>
        <a class="btn btn--outline" href="${p.google_maps_url || '#'}" target="_blank" rel="noopener">${icon('navigation', { size: 16 })}Navigálás</a>
      </div>`;
    sheet.classList.add('is-visible');
    document.getElementById('map-detail-btn').addEventListener('click', () => {
      sheet.classList.remove('is-visible');
      openDetail(Number(p.id));
    });
  }

  function buildFilterBar() {
    const el = document.getElementById('map-filter-bar');
    if (!el) return;
    el.innerHTML = [{ id: 'osszes', label: 'Összes', icon: 'grid' }, ...MAP_CATEGORIES]
      .map((cat) => `<button class="map-filter-pill ${activeMapCategory === cat.id ? 'is-active' : ''}" data-map-category="${cat.id}" type="button">${icon(cat.icon, { size: 15 })}<span>${escapeHtml(cat.label)}</span></button>`)
      .join('');
    el.querySelectorAll('.map-filter-pill').forEach((btn) => btn.addEventListener('click', () => {
      activeMapCategory = btn.dataset.mapCategory;
      buildFilterBar();
      renderMarkers();
    }));
  }

  function renderMarkers() {
    if (!map || !markerLayer) return;
    markerLayer.clearLayers();
    const programs = mapPrograms();
    document.getElementById('map-count').innerHTML = `<strong>${programs.length} találat a térképen</strong><span>A látható területen</span>`;

    programs.forEach((p) => {
      const marker = L.marker([Number(p.latitude), Number(p.longitude)], { icon: markerIcon(p) });
      marker.on('click', () => {
        map.flyTo([Number(p.latitude), Number(p.longitude)], Math.max(map.getZoom(), 12), { duration: .35 });
        showResult(p);
      });
      marker.addTo(markerLayer);
    });

    if (programs.length) {
      const bounds = L.latLngBounds(programs.map((p) => [Number(p.latitude), Number(p.longitude)]));
      map.fitBounds(bounds.pad(.16), { paddingTopLeft: [10, 80], paddingBottomRight: [10, 210], maxZoom: 13 });
    }
  }

  function locateUser() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const latlng = [position.coords.latitude, position.coords.longitude];
      if (userMarker) userMarker.remove();
      userMarker = L.marker(latlng, {
        icon: L.divIcon({ className: 'user-map-marker', html: '<div class="map-location-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
      }).addTo(map);
      map.flyTo(latlng, 13, { duration: .45 });
    }, () => {});
  }

  function createMapView() {
    if (document.getElementById('map-view')) return;
    const view = document.createElement('section');
    view.id = 'map-view';
    view.className = 'map-view hidden';
    view.innerHTML = `
      <div id="map-canvas" class="map-canvas"></div>
      <div id="map-filter-bar" class="map-filter-bar" aria-label="Térkép szűrők"></div>
      <div id="map-count" class="map-count-card"></div>
      <div class="map-control-stack">
        <button class="map-control-btn" id="map-locate-btn" type="button" aria-label="Saját helyzet">${icon('target', { size: 21 })}</button>
      </div>
      <div id="map-result-sheet" class="map-result-sheet" aria-live="polite">
        <div class="map-result-sheet__handle"></div>
        <div id="map-result-content" class="map-result-content"></div>
      </div>`;
    document.getElementById('app').insertBefore(view, document.getElementById('placeholder-view'));
  }

  function ensureLeaflet(callback) {
    if (window.L) { callback(); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = callback;
    script.onerror = () => {
      document.getElementById('map-canvas').innerHTML = '<div class="empty-state"><p>A térkép betöltése nem sikerült.</p></div>';
    };
    document.head.appendChild(script);
  }

  function initMap() {
    if (map || !window.L) return;
    map = L.map('map-canvas', { zoomControl: false, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap közreműködők',
    }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    document.getElementById('map-locate-btn').addEventListener('click', locateUser);
    buildFilterBar();
    renderMarkers();
  }

  function showMapView() {
    document.getElementById('program-list').classList.add('hidden');
    document.querySelector('.sort-bar').classList.add('hidden');
    document.getElementById('category-bar').classList.add('hidden');
    document.getElementById('placeholder-view').classList.add('hidden');
    createMapView();
    document.getElementById('map-view').classList.remove('hidden');
    ensureLeaflet(() => {
      initMap();
      setTimeout(() => { if (map) { map.invalidateSize(); renderMarkers(); } }, 50);
    });
  }

  function hideMapView() {
    const view = document.getElementById('map-view');
    if (view) view.classList.add('hidden');
  }

  function activateNav() {
    document.querySelectorAll('.bottom-nav-item').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.view === 'terkep');
      btn.setAttribute('aria-current', btn.dataset.view === 'terkep' ? 'page' : 'false');
    });
  }

  function switchToMap() {
    state.currentView = 'terkep';
    activateNav();
    showMapView();
  }

  function switchFromMap(view) {
    hideMapView();
    if (view === 'programok') {
      state.currentView = 'programok';
      document.getElementById('program-list').classList.remove('hidden');
      document.querySelector('.sort-bar').classList.remove('hidden');
      document.getElementById('category-bar').classList.remove('hidden');
      document.getElementById('placeholder-view').classList.add('hidden');
      renderProgramList();
    } else {
      state.currentView = view;
      document.getElementById('program-list').classList.add('hidden');
      document.querySelector('.sort-bar').classList.add('hidden');
      document.getElementById('category-bar').classList.add('hidden');
      const content = PLACEHOLDER_CONTENT[view];
      document.getElementById('placeholder-view').innerHTML = `${icon(content.icon, { size: 44 })}<h2>${content.title}</h2><p>${content.text}</p>`;
      document.getElementById('placeholder-view').classList.remove('hidden');
    }
    document.querySelectorAll('.bottom-nav-item').forEach((btn) => {
      const active = btn.dataset.view === view;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  function init() {
    // A Térkép replaces the old Kedvencek slot to keep the bottom bar compact on phones.
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;
    const oldFav = nav.querySelector('[data-view="kedvencek"]');
    if (oldFav) {
      oldFav.dataset.view = 'terkep';
      oldFav.innerHTML = '<span class="bn-icon"></span>Térkép';
    }
    nav.querySelectorAll('.bottom-nav-item').forEach((btn) => {
      if (btn.dataset.view === 'terkep') {
        btn.querySelector('.bn-icon').innerHTML = icon('mapPin', { size: 21 });
        btn.addEventListener('click', switchToMap);
      } else {
        btn.addEventListener('click', () => {
          if (state.currentView === 'terkep') switchFromMap(btn.dataset.view);
        });
      }
    });
  }

  window.addEventListener('DOMContentLoaded', init);
})();
