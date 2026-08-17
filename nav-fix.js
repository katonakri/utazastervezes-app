/* Navigation compatibility layer.
 * IMPORTANT: do not intercept navigation. Each view owns its own handler.
 * This file only keeps the header title synchronized with the clicked tab.
 */
(function () {
  const TITLES = {
    programok: 'Noszvaj és környéke',
    kedvencek: 'Térkép',
    tervezett: 'Programtervező',
    info: 'Infók',
    menu: 'Mit hozzunk?',
  };

  function init() {
    window.addEventListener('click', function (event) {
      const navButton = event.target.closest && event.target.closest('.bottom-nav-item[data-view]');
      if (!navButton) return;
      const title = TITLES[navButton.dataset.view];
      if (title) {
        const el = document.querySelector('.app-title');
        if (el) el.textContent = title;
      }
      // Never preventDefault/stopPropagation here. The individual view modules
      // must receive the same click event and perform their own navigation.
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
