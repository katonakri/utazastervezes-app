/* Central navigation router.
 * View modules still own their rendering, but this single capture-phase
 * router prevents their independent navigation listeners from fighting each
 * other. The map tab is deliberately allowed through to map-view.js.
 */
(function () {
  const TITLES = {
    programok: 'Noszvaj és környéke',
    kedvencek: 'Térkép',
    tervezett: 'Programtervező',
    info: 'Infók',
    menu: 'Mit hozzunk?',
  };

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

  function route(view, event) {
    setTitle(view);

    // Térkép is implemented by map-view.js and must receive the original click.
    if (view === 'kedvencek') return false;

    event.preventDefault();
    event.stopImmediatePropagation();
    hideMap();

    if (view === 'tervezett' && typeof window.renderPlannerView === 'function') {
      window.renderPlannerView();
      return true;
    }
    if (view === 'info' && window.InfoView && typeof window.InfoView.show === 'function') {
      window.InfoView.show();
      state.currentView = 'info';
      return true;
    }
    if (view === 'menu' && window.BringList && typeof window.BringList.show === 'function') {
      window.BringList.show();
      state.currentView = 'menu';
      return true;
    }
    if (view === 'programok' && typeof window.switchView === 'function') {
      window.switchView('programok');
      return true;
    }
    return false;
  }

  function init() {
    window.addEventListener('click', (event) => {
      const button = event.target.closest && event.target.closest('.bottom-nav-item[data-view]');
      if (!button) return;
      route(button.dataset.view, event);
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
