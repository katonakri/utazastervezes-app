/* Single navigation entry point.
 * Runs on window capture, before the legacy per-view document listeners.
 * It deliberately re-dispatches to the owning view module instead of
 * duplicating that module's rendering logic.
 */
(function () {
  let forwarding = false;

  function titleFor(view) {
    return ({
      programok: 'Noszvaj és környéke',
      kedvencek: 'Térkép',
      tervezett: 'Programtervező',
      info: 'Infók',
      menu: 'Mit hozzunk?',
    })[view] || 'Noszvaj és környéke';
  }

  function setHeader(view) {
    const title = document.querySelector('.app-title');
    if (title) title.textContent = titleFor(view);
  }

  function forwardToOwner(button) {
    if (forwarding) return;
    forwarding = true;
    try {
      button.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      }));
    } finally {
      forwarding = false;
    }
  }

  function route(event) {
    if (forwarding) return;
    const button = event.target.closest && event.target.closest('.bottom-nav-item[data-view]');
    if (!button) return;

    const view = button.dataset.view;
    event.preventDefault();
    event.stopImmediatePropagation();
    setHeader(view);

    if (view === 'programok') {
      if (typeof window.switchView === 'function') window.switchView('programok');
      return;
    }

    // Térkép, Programtervező, Infók and Mit hozzunk? already have their
    // own view modules. Let the owning module receive the click.
    forwardToOwner(button);
  }

  window.addEventListener('click', route, true);
})();
