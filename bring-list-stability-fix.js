/* Mit hozzunk? — navigation and add-item stability fixes.
 * Kept isolated from the existing bring-list implementation so the
 * already working list, filters, editing and Supabase persistence are
 * not rewritten.
 */
(() => {
  // The add screen must not render a live card preview.
  const style = document.createElement('style');
  style.textContent = '.bring-preview-label, .bring-preview { display:none !important; }';
  document.head.appendChild(style);

  function getBringButton(target) {
    return target?.closest?.('.bottom-nav-item[data-view="menu"]');
  }

  function removeAddPreview(host) {
    if (!host) return;
    host.querySelectorAll('.bring-preview-label, .bring-preview').forEach((el) => el.remove());
  }

  function keepAddScreenClean() {
    const host = document.getElementById('bring-modal-host');
    if (host) removeAddPreview(host);
  }

  function openBringView(event) {
    const button = getBringButton(event.target);
    if (!button || !window.BringList?.show) return;

    // The original app.js treats this navigation item as a generic
    // placeholder. Handle it before that listener so Mit hozzunk?
    // always opens its real view.
    event.preventDefault();
    event.stopImmediatePropagation();
    window.BringList.show();
  }

  document.addEventListener('click', openBringView, true);

  const observer = new MutationObserver(() => keepAddScreenClean());

  document.addEventListener('DOMContentLoaded', () => {
    const existingModal = document.getElementById('bring-modal-host');
    if (existingModal) removeAddPreview(existingModal);
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
