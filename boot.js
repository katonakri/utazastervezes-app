/* Prevent the saved-user name selector from flashing during page load. */
(function () {
  try {
    const savedUser = localStorage.getItem('noszvaj_current_user');
    const validUsers = ['Deli', 'Peti', 'Ármin', 'Tina', 'Kristóf'];
    if (savedUser && validUsers.includes(savedUser)) {
      const overlay = document.getElementById('name-select-overlay');
      const app = document.getElementById('app');
      const list = document.getElementById('program-list');
      if (overlay) overlay.classList.add('hidden');
      if (app) app.classList.remove('hidden');
      if (list) list.innerHTML = '<div class="empty-state"><p>Betöltés…</p></div>';
    }
  } catch (e) {
    // Fall back to the normal app initialization.
  }
})();
