/* Card enhancements: Google rating + duration color coding. */
(function () {
  const programMeta = new Map();
  let loaded = false;

  function durationInfo(hours) {
    const value = Number(hours);
    if (!Number.isFinite(value)) return { key: 'short', label: 'Rövid' };
    if (value <= 2) return { key: 'short', label: 'Rövid' };
    if (value <= 4) return { key: 'medium', label: 'Közepes' };
    return { key: 'long', label: 'Hosszú' };
  }

  function stars(rating) {
    const rounded = Math.round(Number(rating) * 2) / 2;
    const full = Math.floor(rounded);
    const half = rounded % 1 === 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '★' : '') + '☆'.repeat(empty);
  }

  function decorate() {
    document.querySelectorAll('.program-card').forEach((card) => {
      const id = Number(card.dataset.id);
      const meta = programMeta.get(id);
      if (!meta || card.querySelector('.card-enhancement-row')) return;

      const info = durationInfo(meta.duration_hours_min);
      const ratingHtml = meta.google_rating != null
        ? `<div class="card-rating"><span class="card-rating__value">⭐ ${Number(meta.google_rating).toLocaleString('hu-HU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span><span class="card-rating__stars">${stars(meta.google_rating)}</span><span class="card-rating__count">(${Number(meta.google_review_count || 0).toLocaleString('hu-HU')})</span></div>`
        : '';

      const links = card.querySelector('.program-card__links');
      if (!links) return;

      const row = document.createElement('div');
      row.className = `card-enhancement-row duration-${info.key}`;
      row.innerHTML = `<div class="duration-badge"><span class="duration-badge__dot"></span><span class="duration-badge__text"><strong>${info.label}</strong><span>~ ${escapeDuration(meta.duration)}</span></span></div>${ratingHtml}`;
      card.insertBefore(row, links);
    });
  }

  function escapeDuration(value) {
    return String(value || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  async function load() {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('id, duration, duration_hours_min, google_rating, google_review_count')
        .eq('is_active', true);
      if (error) throw error;
      (data || []).forEach((row) => programMeta.set(Number(row.id), row));
      loaded = true;
      decorate();
    } catch (error) {
      console.error('Kártya metaadatok betöltése nem sikerült:', error);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    load();
    const list = document.getElementById('program-list');
    if (list) {
      const observer = new MutationObserver(() => { if (loaded) decorate(); });
      observer.observe(list, { childList: true });
    }
  });
})();
