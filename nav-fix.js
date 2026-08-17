/* Final navigation coordinator.
 * The app has legacy view-specific listeners. This window-capture coordinator
 * owns the navigation decision and delegates to the existing view modules.
 */
(function () {
  const TITLES = {
    programok: 'Noszvaj és környéke',
    kedvencek: 'Térkép',
    tervezett: 'Programtervező',
    info: 'Infók',
    menu: 'Mit hozzunk?',
  };
  let forwardingMap = false;

  function setTitle(view) {
    const title = document.querySelector('.app-title');
    if (title && TITLES[view]) title.textContent = TITLES[view];
  }

  function hideMap() {
    const map = document.getElementById('map-view');
    if (map) map.classList.add('hidden');
    const result = document.getElementById('map-result-sheet');
    if (result) result.classList.remove('is-visible');
  }

  function cleanupBefore(view) {
    if (view !== 'tervezett' && typeof window.leavePlannerView === 'function') window.leavePlannerView();
    if (view !== 'menu' && window.BringList && typeof window.BringList.leave === 'function') window.BringList.leave();
    if (view !== 'kedvencek') hideMap();
  }

  function dispatchToMap(button) {
    if (forwardingMap) return;
    forwardingMap = true;
    try {
      // app.js has a click listener directly on the original button. Clone it
      // so the map module's document-capture listener receives the event,
      // while the old generic placeholder handler cannot overwrite the map.
      const clone = button.cloneNode(true);
      button.replaceWith(clone);
      clone.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    } finally {
      forwardingMap = false;
    }
  }

  function route(event) {
    if (forwardingMap) return;
    const button = event.target.closest && event.target.closest('.bottom-nav-item[data-view]');
    if (!button) return;

    const view = button.dataset.view;
    event.preventDefault();
    event.stopImmediatePropagation();
    setTitle(view);
    cleanupBefore(view);

    if (view === 'kedvencek') {
      dispatchToMap(button);
      return;
    }

    if (view === 'tervezett' && typeof window.renderPlannerView === 'function') {
      window.renderPlannerView();
      return;
    }
    if (view === 'info' && window.InfoView && typeof window.InfoView.show === 'function') {
      window.InfoView.show();
      state.currentView = 'info';
      return;
    }
    if (view === 'menu' && window.BringList && typeof window.BringList.show === 'function') {
      window.BringList.show();
      state.currentView = 'menu';
      return;
    }
    if (view === 'programok' && typeof window.switchView === 'function') {
      window.switchView('programok');
      return;
    }
  }

  function init() {
    window.addEventListener('click', route, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
