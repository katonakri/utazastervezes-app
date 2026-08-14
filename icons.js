/**
 * icons.js
 * ------------------------------------------------------------------
 * Egyszerű, egységes stílusú vonalas ikonkészlet.
 * Minden ikon 24x24-es viewBox-on, currentColor-t használ, így a
 * CSS-ből színezhető, nem kell külön fájl/kép minden állapothoz.
 *
 * Használat:  icon('tree', { size: 16, className: 'meta-icon' })
 * ------------------------------------------------------------------
 */

const ICON_PATHS = {
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',

  tree: '<circle cx="12" cy="10" r="6.2"/><line x1="12" y1="15.8" x2="12" y2="21"/>',

  droplet: '<path d="M12 3c4.2 5.1 6.3 8.7 6.3 11.6a6.3 6.3 0 1 1-12.6 0C5.7 11.7 7.8 8.1 12 3z"/>',

  smile: '<circle cx="12" cy="12" r="8.3"/><circle cx="9" cy="10.2" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10.2" r="1" fill="currentColor" stroke="none"/><path d="M8.3 14c1 1.6 2.3 2.4 3.7 2.4s2.7-.8 3.7-2.4"/>',

  crown: '<path d="M4.2 17.8h15.6l1-8.4-4.7 3.2L12 6.2 8 12.6l-4.8-3.2 1 8.4z" stroke-linejoin="round"/><line x1="4.6" y1="20.3" x2="19.4" y2="20.3"/>',

  train: '<rect x="4" y="8.2" width="13" height="8" rx="2"/><rect x="6.8" y="4.6" width="4.3" height="4" rx="0.6"/><circle cx="7.6" cy="18.8" r="1.5" fill="currentColor" stroke="none"/><circle cx="13.4" cy="18.8" r="1.5" fill="currentColor" stroke="none"/><line x1="17" y1="11.6" x2="20.4" y2="11.6"/>',

  car: '<path d="M4.7 16.3l1.2-4.5A2.1 2.1 0 0 1 7.9 10.3h8.2a2.1 2.1 0 0 1 2 1.5l1.2 4.5"/><rect x="3.2" y="16.1" width="17.6" height="3.6" rx="1.3"/><circle cx="7.6" cy="19.9" r="1.4" fill="currentColor" stroke="none"/><circle cx="16.4" cy="19.9" r="1.4" fill="currentColor" stroke="none"/>',

  mapPin: '<path d="M12 21s7-7.4 7-12.1a7 7 0 1 0-14 0C5 13.6 12 21 12 21z"/><circle cx="12" cy="8.9" r="2.4"/>',

  clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7v5.3l3.4 2"/>',

  tag: '<path d="M11.7 3.2H5.6a2.1 2.1 0 0 0-2.1 2.1v6.1c0 .56.22 1.1.62 1.49l8.6 8.6a2.1 2.1 0 0 0 2.97 0l6.1-6.1a2.1 2.1 0 0 0 0-2.97l-8.6-8.6a2.1 2.1 0 0 0-1.48-.62z" stroke-linejoin="round"/><circle cx="8.3" cy="8.3" r="1.35" fill="currentColor" stroke="none"/>',

  thumbUp: '<path d="M7.3 20.4V10.6H4.4v9.8h2.9zm2-9.8-.6.5v9.3h7.8a1.8 1.8 0 0 0 1.76-1.44l1.2-6a1.8 1.8 0 0 0-1.76-2.16h-3.9V6.9a2 2 0 0 0-2-2L9.3 10.6z" stroke-linejoin="round"/>',

  thumbDown: '<path d="M16.7 3.6v9.8h2.9V3.6h-2.9zm-2 9.8.6-.5V3.6H7.5a1.8 1.8 0 0 0-1.76 1.44l-1.2 6a1.8 1.8 0 0 0 1.76 2.16h3.9v3.7a2 2 0 0 0 2 2l3.1-6.4z" stroke-linejoin="round"/>',

  close: '<line x1="5.5" y1="5.5" x2="18.5" y2="18.5"/><line x1="18.5" y1="5.5" x2="5.5" y2="18.5"/>',

  chevronDown: '<polyline points="5.5,8.5 12,15 18.5,8.5" stroke-linejoin="round"/>',

  chevronLeft: '<polyline points="15,5 8,12 15,19" stroke-linejoin="round"/>',

  arrowsUpDown: '<line x1="8" y1="4.5" x2="8" y2="19.5"/><polyline points="5,7.3 8,4.3 11,7.3" stroke-linejoin="round"/><line x1="16" y1="19.5" x2="16" y2="4.5"/><polyline points="13,16.7 16,19.7 19,16.7" stroke-linejoin="round"/>',

  info: '<circle cx="12" cy="12" r="8.6"/><line x1="12" y1="11" x2="12" y2="16.3"/><circle cx="12" cy="7.8" r="1.05" fill="currentColor" stroke="none"/>',

  home: '<path d="M4 11.3 12 4.3l8 7"/><path d="M6 10v9.3a1 1 0 0 0 1 1h3.4V14h3.2v6.3H17a1 1 0 0 0 1-1V10"/>',

  heart: '<path d="M12 20.3S3.8 15 3.8 9.2a4.5 4.5 0 0 1 8.2-2.5 4.5 4.5 0 0 1 8.2 2.5c0 5.8-8.2 11.1-8.2 11.1z" stroke-linejoin="round"/>',

  calendar: '<rect x="3.5" y="5.2" width="17" height="15.6" rx="2.2"/><line x1="3.5" y1="10" x2="20.5" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',

  menu: '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>',

  users: '<circle cx="9" cy="8.3" r="3.1"/><path d="M3.2 20.2c0-3.4 2.6-6 5.8-6s5.8 2.6 5.8 6"/><circle cx="17.3" cy="9.2" r="2.4"/><path d="M15.9 14.3a5 5 0 0 1 5.1 5.5"/>',

  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.2"/><circle cx="9" cy="10" r="1.6" fill="currentColor" stroke="none"/><path d="M4.5 17.3 9.5 12l3.4 3.4 2.3-2.3 4.3 4.3" stroke-linejoin="round"/>',
};

/**
 * Visszaad egy inline SVG stringet a kért ikonhoz.
 * @param {string} name - ICON_PATHS kulcs
 * @param {{size?: number, className?: string, strokeWidth?: number}} opts
 */
function icon(name, opts = {}) {
  const size = opts.size || 20;
  const cls = opts.className ? ` icon ${opts.className}` : ' icon';
  const sw = opts.strokeWidth || 1.8;
  const path = ICON_PATHS[name] || '';
  return `<svg class="${cls.trim()}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" aria-hidden="true" focusable="false">${path}</svg>`;
}
