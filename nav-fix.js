/* Centralized bottom-navigation guard.
 * Runs on window capture so view-specific modules cannot intercept navigation.
 */
(function () {
  function init() {
    window.addEventListener('click', function (event) {
      const navButton = event.target.closest && event.target.closest('.bottom-nav-item[data-view]');
      if (!navButton) return;

      const view = navButton.dataset.view;
      if (!view || typeof window.switchView !== 'function') return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.switchView(view);
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
