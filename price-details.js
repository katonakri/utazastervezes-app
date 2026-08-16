/* ================================================================
 * Program ár részletek — felnőtt + 2 éves gyermek
 * ================================================================ */

function hasDetailedPrice(p) {
  return Boolean(p && (p.price_adult || p.price_child_2));
}

function priceSummaryHtml(p) {
  if (!hasDetailedPrice(p)) {
    return `${icon('tag', { size: 14 })}${escapeHtml(p.price || '')}`;
  }

  return `${icon('tag', { size: 14 })}<span class="price-summary-text"><span>Felnőtt: ${escapeHtml(p.price_adult || '-')}</span><span>2 éves: ${escapeHtml(p.price_child_2 || '-')}</span></span>`;
}

function priceDetailHtml(p) {
  if (!hasDetailedPrice(p)) {
    return `
      <div class="sheet-meta-item">
        ${icon('tag', { size: 18 })}
        <div><strong>${escapeHtml(p.price || '')}</strong><span>Ár</span></div>
      </div>`;
  }

  return `
    <div class="price-detail-box">
      <div class="price-detail-box__header">${icon('tag', { size: 17 })}<span>Belépőárak</span></div>
      <div class="price-detail-box__rows">
        <div class="price-detail-row">
          <span>Felnőtt</span>
          <strong>${escapeHtml(p.price_adult || '-')}</strong>
        </div>
        <div class="price-detail-row">
          <span>${escapeHtml(p.price_child_2_label || '2 éves gyermek')}</span>
          <strong>${escapeHtml(p.price_child_2 || '-')}</strong>
        </div>
      </div>
      <p class="price-detail-box__note">A feltüntetett árak tájékoztató jellegűek, indulás előtt érdemes ellenőrizni az aktuális árlistát.</p>
    </div>`;
}

/* Override the original card renderer while keeping the existing data flow. */
const originalCardTemplate = cardTemplate;
cardTemplate = function (p) {
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
            <span class="meta-item meta-item--price">${priceSummaryHtml(p)}</span>
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
};

/* Override detail rendering so the structured prices appear prominently. */
renderDetailBody = function (programId) {
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
        ${hasDetailedPrice(p) ? `<div class="sheet-meta-item"><span class="sheet-price-badge">${icon('tag', { size: 18 })}<strong>Belépős</strong></span></div>` : priceDetailHtml(p)}
      </div>
      ${hasDetailedPrice(p) ? priceDetailHtml(p) : ''}
      <div class="sheet-actions">
        <a class="btn btn--outline" href="${p.google_maps_url || '#'}" target="_blank" rel="noopener">${icon('mapPin', { size: 16 })}Google Maps</a>
        <a class="btn btn--outline" href="${p.official_url || '#'}" target="_blank" rel="noopener">${icon('info', { size: 16 })}Hivatalos oldal</a>
      </div>
      <div class="sheet-votes-row">${voteButtonsHtml(p, likeCount, dislikeCount, myVote)}</div>
      <div class="voters-section"><h3>${icon('users', { size: 17 })}Ki hogyan szavazott?</h3>${voterListHtml(votes, 'like')}${voterListHtml(votes, 'dislike')}</div>
    </div>`;
};
