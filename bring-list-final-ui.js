/* Mit hozzunk? — final small UI refinements */
(() => {
  function cleanMineFilter() {
    document.querySelectorAll('.bring-filter[data-bring-filter="mine"] .icon').forEach(el => el.remove());
  }

  function moveSaveToTop() {
    const form = document.querySelector('#bring-modal-host .bring-form');
    const save = document.querySelector('#bring-modal-host #bring-save');
    if (!form || !save || save.dataset.movedTop === '1') return;

    save.dataset.movedTop = '1';
    // A mentés mindig az űrlap tetején legyen, közvetlenül a modal fejléc alatt.
    form.insertBefore(save, form.firstElementChild);

    // A korábbi CSS order szabályait semlegesítjük az új helyen.
    save.style.order = '0';
    save.classList.add('bring-save--top');
  }

  function apply() {
    cleanMineFilter();
    moveSaveToTop();
  }

  const observer = new MutationObserver(apply);
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
