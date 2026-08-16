/* Keep the selectable demo users centralized without changing the legacy mock data file. */
(function () {
  const USERS_CONFIG = ['Deli', 'Peti', 'Ármin', 'Tina', 'Kristóf'];
  function apply() {
    const list = document.getElementById('name-select-list');
    if (!list) return;
    const buttons = list.querySelectorAll('.name-btn');
    buttons.forEach((button, index) => {
      const name = USERS_CONFIG[index];
      if (!name) return;
      button.dataset.name = name;
      const label = button.querySelector('span:first-child');
      if (label) label.textContent = name;
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }
})();
