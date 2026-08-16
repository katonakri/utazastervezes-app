/* ==================================================================
 * TÉRKÉP — Leaflet/OpenStreetMap based interactive program map.
 * ================================================================== */

(function () {
  const MAP_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'osszes');
  const ACCOMMODATION = {
    title: 'Mustármag Vendégház',
    address: 'Noszvaj, Béke út 22., 3325',
    latitude: 47.94197,
    longitude: 20.47364,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Must%C3%A1rmag+Vend%C3%A9gh%C3%A1z+Noszvaj+B%C3%A9ke+%C3%BAt+22',
    website: 'https://mustarmagnoszvaj.hu/'
  };

  let map = null;
  let markerLayer = null;
  let accommodationLayer = null;
  let userMarker = null;
  let activeMapCategory = 'osszes';

  function mapPrograms() {
    const programs = state.programs.filter((p) =>
      p.is_active !== false && p.latitude != null && p.longitude != null
    );
    return activeMapCategory === 'osszes' ? programs : programs.filter((p) => p.category === activeMapCategory);
  }

  function categoryConfig(category) {
    return CATEGORIES.find((c) => c.id === category) || { label: category, icon: 'grid' };
  }

  function markerIcon(p) {
    const cat = categoryConfig(p.category);
    return L.divIcon({
      className: 'custom-map-marker',
      html: `<div class="map-marker map-marker--${escapeHtml(p.category)}"><span class="map-marker__inner">${icon(cat.icon, { size: 19 })}</span></div>`,
      iconSize: [42, 42], iconAnchor: [21, 42], popupAnchor: [0, -42],
    });
  }

  function accommodationIcon() {
    return L.divIcon({
      className: 'custom-map-marker accommodation-marker-wrap',
      html: `<div class="map-marker map-marker--accommodation"><span class="map-marker__inner">${icon('home', { size: 20 })}</span></div>`,
      iconSize: [46, 46], iconAnchor: [23, 46], popupAnchor: [0, -46],
    });
  }

  function priceMarkup(p) {
    if (!p.price_adult && !p.price_child_2) return '';
    return `<div class="map-result-prices">
      <div class="map-price"><span>Felnőtt</span><strong>${escapeHtml(p.price_adult || '-')}</strong></div>
      <div class="map-price"><span>2 éves gyermek</span><strong>${escapeHtml(p.price_child_2 || '-')}</strong></div>
    </div>`;
  }

  function hideResult() {
    const sheet = document.getElementById('map-result-sheet');
    if (sheet) sheet.classList.remove('is-visible');
  }

  function showResult(p) {
    const cat = categoryConfig(p.category);
    const sheet = document.getElementById('map-result-sheet');
    document.getElementById('map-result-content').innerHTML = `
      <img class="map-result-image" src="${p.image_url || ''}" alt="${escapeHtml(p.title)}" loading="lazy" onerror="this.style.visibility='hidden'" />
      <div class="map-result-info">
        <h2 class="map-result-title">${escapeHtml(p.title)}</h2>
        <div class="map-result-meta">
          <span class="map-result-category">${icon(cat.icon, { size: 13 })}${escapeHtml(cat.label)}</span>
          <span>${formatKm(p.distance_km ?? '-')} km</span><span>${p.drive_minutes ?? '-'} perc</span>
        </div>
        <p class="map-result-desc">${escapeHtml(p.description || '')}</p>
      </div>
      ${priceMarkup(p)}
      <div class="map-result-actions">
        <button class="btn btn--outline" id="map-detail-btn" type="button">${icon('info', { size: 16 })}Részletek</button>
        <a class="btn btn--outline" href="${p.google_maps_url || '#'}" target="_blank" rel="noopener">${icon('mapPin', { size: 16 })}Navigálás</a>
      </div>`;
    sheet.classList.add('is-visible');
    document.getElementById('map-detail-btn').addEventListener('click', () => {
      hideResult();
      openDetail(Number(p.id));
    });
  }

  function showAccommodationResult() {
    const sheet = document.getElementById('map-result-sheet');
    document.getElementById('map-result-content').innerHTML = `
      <div class="map-accommodation-card">
        <div class="map-accommodation-icon">${icon('home', { size: 25 })}</div>
        <div class="map-result-info">
          <h2 class="map-result-title">${escapeHtml(ACCOMMODATION.title)}</h2>
          <div class="map-result-meta">
            <span class="map-result-category map-result-category--accommodation">Szállás</span>
          </div>
          <p class="map-result-desc">${escapeHtml(ACCOMMODATION.address)}</p>
        </div>
      </div>
      <div class="map-result-actions">
        <a class="btn btn--outline" href="${ACCOMMODATION.googleMapsUrl}" target="_blank" rel="noopener">${icon('mapPin', { size: 16 })}Navigálás</a>
        <a class="btn btn--outline" href="${ACCOMMODATION.website}" target="_blank" rel="noopener">${icon('info', { size: 16 })}Szállás infó</a>
      </div>`;
    sheet.classList.add('is-visible');
  }

  function buildFilterBar() {
    const el = document.getElementById('map-filter-bar');
    if (!el) return;
    el.innerHTML = [{ id: 'osszes', label: 'Összes', icon: 'grid' }, ...MAP_CATEGORIES]
      .map((cat) => `<button class="map-filter-pill ${activeMapCategory === cat.id ? 'is-active' : ''}" data-map-category="${cat.id}" type="button">${icon(cat.icon, { size: 15 })}<span>${escapeHtml(cat.label)}</span></button>`).join('');
    el.querySelectorAll('.map-filter-pill').forEach((btn) => btn.addEventListener('click', () => {
      activeMapCategory = btn.dataset.mapCategory;
      hideResult();
      buildFilterBar();
      renderMarkers();
    }));
  }

  function renderMarkers() {
    if (!map || !markerLayer || !accommodationLayer) return;
    markerLayer.clearLayers();
    accommodationLayer.clearLayers();

    const programs = mapPrograms();
    document.getElementById('map-count').innerHTML = `<strong>${programs.length} találat a térképen</strong><span>A látható területen · szállás külön jelölve</span>`;

    programs.forEach((p) => {
      const marker = L.marker([Number(p.latitude), Number(p.longitude)], { icon: markerIcon(p) });
      marker.on('click', (event) => {
        L.DomEvent.stopPropagation(event);
        map.flyTo([Number(p.latitude), Number(p.longitude)], Math.max(map.getZoom(), 12), { duration: .35 });
        showResult(p);
      });
      marker.addTo(markerLayer);
    });

    // A szállás fix térképi elem: nincs benne a programs táblában,
    // ezért a programlistában és a kategóriaszűrésekben nem jelenik meg.
    const accommodationMarker = L.marker(
      [ACCOMMODATION.latitude, ACCOMMODATION.longitude],
      { icon: accommodationIcon(), zIndexOffset: 1000 }
    );
    accommodationMarker.on('click', (event) => {
      L.DomEvent.stopPropagation(event);
      map.flyTo([ACCOMMODATION.latitude, ACCOMMODATION.longitude], Math.max(map.getZoom(), 13), { duration: .35 });
      showAccommodationResult();
    });
    accommodationMarker.addTo(accommodationLayer);

    if (programs.length) {
      const points = programs.map((p) => [Number(p.latitude), Number(p.longitude)]);
      points.push([ACCOMMODATION.latitude, ACCOMMODATION.longitude]);
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds.pad(.16), { paddingTopLeft: [10, 80], paddingBottomRight: [10, 230], maxZoom: 13 });
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
      <div class="map-control-stack"><button class="map-control-btn" id="map-locate-btn" type="button" aria-label="Saját helyzet">${icon('mapPin', { size: 21 })}</button></div>
      <div id="map-result-sheet" class="map-result-sheet" aria-live="polite"><div class="map-result-sheet__handle"></div><div id="map-result-content" class="map-result-content"></div></div>`;
    document.getElementById('app').insertBefore(view, document.getElementById('placeholder-view'));
  }

  function ensureLeaflet(callback) {
    if (window.L) { callback(); return; }
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
    const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload = callback;
    script.onerror = () => { document.getElementById('map-canvas').innerHTML = '<div class="empty-state"><p>A térkép betöltése nem sikerült.</p></div>'; };
    document.head.appendChild(script);
  }

  function initMap() {
    if (map || !window.L) return;
    map = L.map('map-canvas', { zoomControl: false, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap közreműködők' }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    accommodationLayer = L.layerGroup().addTo(map);
    map.on('click', hideResult);
    document.getElementById('map-locate-btn').addEventListener('click', locateUser);
    buildFilterBar(); renderMarkers();
  }

  function showMapView() {
    document.getElementById('program-list').classList.add('hidden');
    document.querySelector('.sort-bar').classList.add('hidden');
    document.getElementById('category-bar').classList.add('hidden');
    document.getElementById('placeholder-view').classList.add('hidden');
    createMapView(); document.getElementById('map-view').classList.remove('hidden');
    ensureLeaflet(() => { initMap(); setTimeout(() => { if (map) { map.invalidateSize(); renderMarkers(); } }, 50); });
  }

  function hideMapView() {
    const view = document.getElementById('map-view');
    if (view) view.classList.add('hidden');
    hideResult();
  }

  function activateNav(view) {
    document.querySelectorAll('.bottom-nav-item').forEach((btn) => {
      const active = btn.dataset.view === view;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  function switchToMap() {
    state.currentView = 'terkep';
    activateNav('kedvencek');
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
    activateNav(view);
  }

  function init() {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;
    const oldFav = nav.querySelector('[data-view="kedvencek"]');
    if (oldFav) {
      oldFav.innerHTML = '<span class="bn-icon"></span>Térkép';
      oldFav.setAttribute('aria-label', 'Térkép');
      oldFav.querySelector('.bn-icon').innerHTML = icon('mapPin', { size: 21 });
    }

    nav.addEventListener('click', (event) => {
      const button = event.target.closest('.bottom-nav-item');
      if (!button) return;

      if (state.currentView === 'terkep') {
        event.preventDefault();
        event.stopImmediatePropagation();
        const targetView = button.dataset.view === 'kedvencek' ? 'terkep' : button.dataset.view;
        if (targetView === 'terkep') switchToMap();
        else switchFromMap(targetView);
        return;
      }

      if (button.dataset.view === 'kedvencek') {
        event.preventDefault();
        event.stopImmediatePropagation();
        switchToMap();
      }
    }, true);
  }

  window.addEventListener('DOMContentLoaded', init);
})();