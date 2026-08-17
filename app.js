/* ================================================================
 * Noszvaj és környéke — frontend application
 * Supabase-backed data layer
 * ================================================================ */

const SafeStorage = (() => {
  let memoryFallback = {};
  let storageOk = false;
  try {
    const key = '__noszvaj_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    storageOk = true;
  } catch (e) {}
  return {
    get(key) {
      if (storageOk) {
        try { return localStorage.getItem(key); } catch (e) {}
      }
      return memoryFallback[key] ?? null;
    },
    set(key, value) {
      if (storageOk) {
        try { localStorage.setItem(key, value); return; } catch (e) {}
      }
      memoryFallback[key] = value;
    },
  };
})();

const CURRENT_USER_KEY = 'noszvaj_current_user';

/* ================== SUPABASE DATA ACCESS ======================== */
const DataStore = (() => {
  function checkError(result, operation) {
    if (result.error) {
      console.error(`Supabase ${operation} hiba:`, result.error);
      throw result.error;
    }
    return result.data ?? [];
  }

  return {
    async getPrograms() {
      const result = await supabase
        .from('programs')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true });
      return checkError(result, 'programs lekérdezés');
    },

    async getVotes() {
      const result = await supabase
        .from('votes')
        .select('id, program_id, user_name, vote_type, created_at, updated_at');
      return checkError(result, 'votes lekérdezés');
    },

    async upsertVote(programId, userName, voteType) {
      const result = await supabase
        .from('votes')
        .upsert(
          { program_id: programId, user_name: userName, vote_type: voteType },
          { onConflict: 'program_id,user_name' }
        );
      checkError(result, 'vote mentés');
    },

    async deleteVote(programId, userName) {
      const result = await supabase
        .from('votes')
        .delete()
        .eq('program_id', programId)
        .eq('user_name', userName);
      checkError(result, 'vote törlés');
    },
  };
})();

/* ================== STATE + HELPERS ============================= */
const state = {
  currentUser: null,
  programs: [],
  votes: [],
  activeCategory: 'osszes',
  sortBy: 'liked',
  sortReversed: false,
  currentView: 'programok',
  activeDetailId: null,
};

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function formatKm(km) {
  return String(km).replace('.', ',');
}

function getVotesForProgram(programId) {
  return state.votes.filter((v) => Number(v.program_id) === Number(programId));
}

function getUserVote(programId, userName) {
  const v = state.votes.find(
    (x) => Number(x.program_id) === Number(programId) && x.user_name === userName
  );
  return v ? v.vote_type : null;
}

function getLikeCount(programId) {
  return state.votes.filter((v) => Number(v.program_id) === Number(programId) && v.vote_type === 'like').length;
}

function getDislikeCount(programId) {
  return state.votes.filter((v) => Number(v.program_id) === Number(programId) && v.vote_type === 'dislike').length;
}

function getFilteredPrograms() {
  if (state.activeCategory === 'osszes') return state.programs;
  return state.programs.filter((p) => p.category === state.activeCategory);
}

function getSortedPrograms() {
  const list = [...getFilteredPrograms()];
  const dir = state.sortReversed ? -1 : 1;
  list.sort((a, b) => {
    let cmp = 0;
    if (state.sortBy === 'liked') {
      const likeDiff = getLikeCount(b.id) - getLikeCount(a.id);
      cmp = likeDiff !== 0 ? likeDiff : getDislikeCount(a.id) - getDislikeCount(b.id);
    } else if (state.sortBy === 'closest') {
      cmp = Number(a.distance_km) - Number(b.distance_km);
    } else if (state.sortBy === 'shortest') {
      cmp = Number(a.duration_hours_min) - Number(b.duration_hours_min);
    } else if (state.sortBy === 'price') {
      cmp = Number(a.price_sort_value) - Number(b.price_sort_value);
    }
    return cmp * dir;
  });
  return list;
}

async function reloadVotes() {
  state.votes = await DataStore.getVotes();
}

async function toggleVote(programId, voteType) {
  if (!state.currentUser) return;
  const existing = getUserVote(programId, state.currentUser);
  try {
    if (existing === voteType) {
      await DataStore.deleteVote(programId, state.currentUser);
    } else {
      await DataStore.upsertVote(programId, state.currentUser, voteType);
    }
    await reloadVotes();
    renderProgramList();
    if (state.activeDetailId === programId) renderDetailBody(programId);
  } catch (error) {
    console.error(error);
    alert('A szavazat mentése nem sikerült. Ellenőrizd a Supabase kapcsolatot.');
  }
}

/* ================== RENDER ====================================== */
function handleImgError(imgEl) {
  const container = imgEl.closest('.program-card__media, .sheet-media');
  if (container) container.classList.add('has-error');
}
window.handleImgError = handleImgError;

function renderLogos() {
  const logoSvg = `
    <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none" aria-hidden="true">
      <circle cx="24" cy="8" r="3.2" fill="#F5C245"/>
      <path d="M2 24 L11 12 L16.5 19 L20 14.5 L30 24 Z" fill="#2E9E5B"/>
      <path d="M2 24 L11 12 L16.5 19 L14.5 21.5 L8 24 Z" fill="#227A46"/>
      <circle cx="9" cy="17.5" r="2.6" fill="#3CB873"/>
      <line x1="9" y1="20.1" x2="9" y2="24" stroke="#227A46" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`;
  document.getElementById('header-logo').innerHTML = logoSvg;
  const nameLogo = document.getElementById('name-select-logo');
  if (nameLogo) nameLogo.innerHTML = logoSvg;
}

function renderNameSelect() {
  const list = document.getElementById('name-select-list');
  list.innerHTML = USERS.map((name) => `
    <button class="name-btn" data-name="${escapeHtml(name)}" type="button">
      <span>${escapeHtml(name)}</span><span class="name-btn__dot" aria-hidden="true"></span>
    </button>`).join('');
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.name-btn');
    if (btn) selectUser(btn.dataset.name);
  });
}

function selectUser(name) {
  state.currentUser = name;
  SafeStorage.set(CURRENT_USER_KEY, name);
  document.getElementById('name-select-overlay').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  renderProgramList();
}

function renderCategoryBar() {
  const el = document.getElementById('category-bar');
  el.innerHTML = CATEGORIES.map((cat) => `
    <button class="category-pill ${state.activeCategory === cat.id ? 'is-active' : ''}"
      data-category="${cat.id}" type="button" aria-pressed="${state.activeCategory === cat.id}">
      ${icon(cat.icon, { size: 16 })}<span>${cat.label}</span>
    </button>`).join('');
  el.querySelectorAll('.category-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeCategory = btn.dataset.category;
      renderCategoryBar();
      renderProgramList();
    });
  });
}

function renderSortControls() {
  const select = document.getElementById('sort-select');
  select.innerHTML = SORT_OPTIONS.map((o) => `<option value="${o.id}">${o.label}</option>`).join('');
  select.value = state.sortBy;
  select.addEventListener('change', () => { state.sortBy = select.value; renderProgramList(); });

  const dirBtn = document.getElementById('sort-direction-btn');
  dirBtn.innerHTML = icon('arrowsUpDown', { size: 18 });
  dirBtn.addEventListener('click', () => {
    state.sortReversed = !state.sortReversed;
    dirBtn.classList.toggle('is-active', state.sortReversed);
    dirBtn.setAttribute('aria-pressed', String(state.sortReversed));
    renderProgramList();
  });
}

function cardTemplate(p) {
  const cat = CATEGORIES.find((c) => c.id === p.category) || { label: p.category, icon: p.icon || 'grid' };
  const likeCount = getLikeCount(p.id);
  const dislikeCount = getDislikeCount(p.id);
  const myVote = state.currentUser ? getUserVote(p.id, state.currentUser) : null;
  return `
  <article class="program-card" data-id="${p.id}">
    <div class="program-card__main" data-role="open-detail">
      <div class="program-card__media">
        <img src="${p.image_url || ''}" alt="${escapeHtml(p.title)}" loading="lazy" onerror="handleImgError(this)" />
        <div class="program-card__media-fallback" data-category="${p.category}">${icon('image', { size: 42 })}</div>
      </div>
      <div class="program-card__content">
        <div class="program-card__info">
          <span class="category-tag" data-category="${p.category}">${icon(cat.icon, { size: 13 })}<span>${escapeHtml(cat.label)}</span></span>
          <h3 class="program-card__title">${escapeHtml(p.title)}</h3>
          <p class="program-card__desc">${escapeHtml(p.description || '')}</p>
          <div class="program-card__meta">
            <span class="meta-item">${icon('car', { size: 14 })}${p.drive_minutes ?? '-'} perc · ${formatKm(p.distance_km ?? '-')} km</span>
            <span class="meta-item">${icon('clock', { size: 14 })}${escapeHtml(p.duration || '')}</span>
            <span class="meta-item meta-item--price">${icon('tag', { size: 14 })}${escapeHtml(p.price || '')}</span>
          </div>
        </div>
        <div class="program-card__votes">
          <button class="vote-btn vote-btn--like ${myVote === 'like' ? 'is-active' : ''}" data-action="like" data-program="${p.id}" type="button" aria-pressed="${myVote === 'like'}">${icon('thumbUp', { size: 17 })}<span>${likeCount}</span></button>
          <button class="vote-btn vote-btn--dislike ${myVote === 'dislike' ? 'is-active' : ''}" data-action="dislike" data-program="${p.id}" type="button" aria-pressed="${myVote === 'dislike'}">${icon('thumbDown', { size: 17 })}<span>${dislikeCount}</span></button>
        </div>
      </div>
    </div>
    <div class="program-card__links">
      <a class="card-link" href="${p.google_maps_url || '#'}" target="_blank" rel="noopener">${icon('mapPin', { size: 15 })}Térkép</a>
      <span class="card-link__divider">|</span>
      <a class="card-link" href="${p.official_url || '#'}" target="_blank" rel="noopener">${icon('info', { size: 15 })}Infó</a>
    </div>
  </article>`;
}

function renderProgramList() {
  const el = document.getElementById('program-list');
  const list = getSortedPrograms();
  if (!list.length) {
    el.innerHTML = `<div class="empty-state">${icon('grid', { size: 34 })}<p>Ebben a kategóriában egyelőre nincs program.</p>`;
    return;
  }
  el.innerHTML = list.map(cardTemplate).join('');
}

function voteButtonsHtml(p, likeCount, dislikeCount, myVote) {
  return `
    <button class="vote-btn vote-btn--like ${myVote === 'like' ? 'is-active' : ''}" data-action="like" data-program="${p.id}" type="button" aria-pressed="${myVote === 'like'}">${icon('thumbUp', { size: 17 })}<span>${likeCount}</span></button>
    <button class="vote-btn vote-btn--dislike ${myVote === 'dislike' ? 'is-active' : ''}" data-action="dislike" data-program="${p.id}" type="button" aria-pressed="${myVote === 'dislike'}">${icon('thumbDown', { size: 17 })}<span>${dislikeCount}</span></button>`;
}

function voterListHtml(votes, type) {
  const items = votes.filter((v) => v.vote_type === type);
  const label = type === 'like' ? 'Like' : 'Dislike';
  const emptyLabel = type === 'like' ? 'Még senki nem lájkolta.' : 'Még senki nem jelölte dislike-ra.';
  return `<div class="voters-group voters-group--${type}">
    <span class="voters-group__header">${icon(type === 'like' ? 'thumbUp' : 'thumbDown', { size: 14 })}${label} – ${items.length} fő</span>
    ${items.length ? `<ul>${items.map((v) => `<li class="${v.user_name === state.currentUser ? 'is-me' : ''}">${escapeHtml(v.user_name)}${v.user_name === state.currentUser ? ' (te)' : ''}</li>`).join('')}</ul>` : `<p class="voters-empty">${emptyLabel}</p>`}
  </div>`;
}

function renderDetailBody(programId) {
  const p = state.programs.find((x) => Number(x.id) === Number(programId));
  if (!p) return;
  const cat = CATEGORIES.find((c) => c.id === p.category) || { label: p.category, icon: p.icon || 'grid' };
  const votes = getVotesForProgram(p.id);
  const likeCount = votes.filter((v) => v.vote_type === 'like').length;
  const dislikeCount = votes.filter((v) => v.vote_type === 'dislike').length;
  const myVote = state.currentUser ? getUserVote(p.id, state.currentUser) : null;
  document.getElementById('sheet-body').innerHTML = `
    <div class="sheet-media"><img src="${p.image_url || ''}" alt="${escapeHtml(p.title)}" onerror="handleImgError(this)" /><div class="program-card__media-fallback" data-category="${p.category}">${icon('image', { size: 54 })}</div></div>
    <div class="sheet-content">
      <span class="category-tag" data-category="${p.category}">${icon(cat.icon, { size: 13 })}<span>${escapeHtml(cat.label)}</span></span>
      <h2>${escapeHtml(p.title)}</h2>
      <p class="sheet-desc">${escapeHtml(p.description || '')}</p>
      <div class="sheet-meta-grid">
        <div class="sheet-meta-item">${icon('car', { size: 18 })}<div><strong>${p.drive_minutes ?? '-'} perc</strong><span>Autóval</span></div></div>
        <div class="sheet-meta-item">${icon('mapPin', { size: 18 })}<div><strong>${formatKm(p.distance_km ?? '-')} km</strong><span>Távolság</span></div></div>
        <div class="sheet-meta-item">${icon('clock', { size: 18 })}<div><strong>${escapeHtml(p.duration || '')}</strong><span>Időtartam</span></div></div>
        <div class="sheet-meta-item">${icon('tag', { size: 18 })}<div><strong>${escapeHtml(p.price || '')}</strong><span>Ár</span></div></div>
      </div>
      <div class="sheet-actions">
        <a class="btn btn--outline" href="${p.google_maps_url || '#'}" target="_blank" rel="noopener">${icon('mapPin', { size: 16 })}Google Maps</a>
        <a class="btn btn--outline" href="${p.official_url || '#'}" target="_blank" rel="noopener">${icon('info', { size: 16 })}Hivatalos oldal</a>
      </div>
      <div class="sheet-votes-row">${voteButtonsHtml(p, likeCount, dislikeCount, myVote)}</div>
      <div class="voters-section"><h3>${icon('users', { size: 17 })}Ki hogyan szavazott?</h3>${voterListHtml(votes, 'like')}${voterListHtml(votes, 'dislike')}</div>
    </div>`;
}

function openDetail(programId) {
  state.activeDetailId = programId;
  renderDetailBody(programId);
  document.getElementById('detail-sheet').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  state.activeDetailId = null;
  document.getElementById('detail-sheet').classList.add('hidden');
  document.body.style.overflow = '';
}

function renderBottomNav() {
  document.querySelectorAll('.bottom-nav-item').forEach((btn) => {
    const iconName = { programok: 'home', kedvencek: 'heart', tervezett: 'calendar', menu: 'menu' }[btn.dataset.view];
    btn.querySelector('.bn-icon').innerHTML = icon(iconName, { size: 21 });
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
}

const PLACEHOLDER_CONTENT = {
  kedvencek: { icon: 'heart', title: 'Kedvencek', text: 'Ez a nézet még nem készült el — hamarosan itt gyűjthetjük össze a kedvenc programokat.' },
  tervezett: { icon: 'calendar', title: 'Tervezett', text: 'Ez a nézet még nem készült el — hamarosan itt láthatjuk majd az útiterv beosztását.' },
  menu: { icon: 'menu', title: 'Menü', text: 'Ez a nézet még nem készült el.' },
};

function switchView(view) {
  state.currentView = view;
  document.querySelectorAll('.bottom-nav-item').forEach((btn) => {
    const active = btn.dataset.view === view;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-current', active ? 'page' : 'false');
  });
  const programList = document.getElementById('program-list');
  const sortBar = document.querySelector('.sort-bar');
  const categoryBar = document.getElementById('category-bar');
  const placeholder = document.getElementById('placeholder-view');
  if (view === 'programok') {
    document.querySelector('.app-title').textContent = 'Noszvaj és környéke';
    programList.classList.remove('hidden'); sortBar.classList.remove('hidden'); categoryBar.classList.remove('hidden'); placeholder.classList.add('hidden');
  } else if (view === 'tervezett') {
    programList.classList.add('hidden'); sortBar.classList.add('hidden'); categoryBar.classList.add('hidden');
    document.querySelector('.app-title').textContent = 'Programtervező';
    if (typeof window.renderPlannerView === 'function') {
      window.renderPlannerView();
    } else {
      placeholder.innerHTML = `${icon('calendar', { size: 44 })}<h2>Programtervező</h2><p>A programtervező betöltése nem sikerült.</p>`;
      placeholder.classList.remove('hidden');
    }
  } else {
    document.querySelector('.app-title').textContent = 'Noszvaj és környéke';
    programList.classList.add('hidden'); sortBar.classList.add('hidden'); categoryBar.classList.add('hidden');
    const content = PLACEHOLDER_CONTENT[view];
    placeholder.innerHTML = `${icon(content.icon, { size: 44 })}<h2>${content.title}</h2><p>${content.text}</p>`;
    placeholder.classList.remove('hidden');
    if (typeof window.leavePlannerView === 'function') window.leavePlannerView();
  }
}

function bindProgramListEvents() {
  document.getElementById('program-list').addEventListener('click', (e) => {
    const voteBtn = e.target.closest('.vote-btn');
    if (voteBtn) { toggleVote(Number(voteBtn.dataset.program), voteBtn.dataset.action); return; }
    if (e.target.closest('.card-link')) return;
    const openTarget = e.target.closest('[data-role="open-detail"]');
    if (openTarget) openDetail(Number(openTarget.closest('.program-card').dataset.id));
  });
}

function bindDetailSheetEvents() {
  document.getElementById('sheet-close').innerHTML = icon('close', { size: 18 });
  document.getElementById('sheet-close').addEventListener('click', closeDetail);
  document.getElementById('sheet-backdrop').addEventListener('click', closeDetail);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('detail-sheet').classList.contains('hidden')) closeDetail();
  });
  document.getElementById('sheet-body').addEventListener('click', (e) => {
    const voteBtn = e.target.closest('.vote-btn');
    if (voteBtn) toggleVote(Number(voteBtn.dataset.program), voteBtn.dataset.action);
  });
}

/* ================== INIT ========================================= */
async function init() {
  renderLogos();
  renderNameSelect();
  renderCategoryBar();
  renderSortControls();
  renderBottomNav();
  bindProgramListEvents();
  bindDetailSheetEvents();

  try {
    state.programs = await DataStore.getPrograms();
    state.votes = await DataStore.getVotes();
  } catch (error) {
    console.error('Supabase inicializálási hiba:', error);
    document.getElementById('program-list').innerHTML = `
      <div class="empty-state">
        ${icon('grid', { size: 34 })}
        <p>Az adatok betöltése nem sikerült. Ellenőrizd a Supabase projektet és az RLS/Data API beállításokat.</p>
      </div>`;
    return;
  }

  const savedUser = SafeStorage.get(CURRENT_USER_KEY);
  if (savedUser && USERS.includes(savedUser)) {
    state.currentUser = savedUser;
    document.getElementById('name-select-overlay').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    renderProgramList();
  }
}

document.addEventListener('DOMContentLoaded', init);