(() => {
  const DEFAULT_SORT = 'assignee';
  const SORT_KEY = 'bring_list_sort';
  const ORDER_KEY = 'bring_list_sort_order';

  function sortItems(items) {
    const sort = localStorage.getItem(SORT_KEY) || DEFAULT_SORT;
    const direction = localStorage.getItem(ORDER_KEY) === 'desc' ? -1 : 1;
    const groupOrder = { Deli: 1, Tina: 2, Ármin: 3 };
    const labelFor = item => {
      const a = item.assignees || [];
      if (!a.length) return { rank: 99, label: 'Nincs gazda' };
      if (a.includes('Deli') || a.includes('Peti')) return { rank: 1, label: 'Deli és Peti' };
      if (a.includes('Tina') || a.includes('Kristóf')) return { rank: 2, label: 'Tina és Kristóf' };
      if (a.includes('Ármin')) return { rank: 3, label: 'Ármin' };
      if (a.includes('Ott vesszük')) return { rank: 4, label: 'Ott vesszük' };
      return { rank: 98, label: a.join(', ') };
    };
    return [...items].sort((a,b) => {
      if (sort === 'name') return direction * String(a.name || '').localeCompare(String(b.name || ''), 'hu');
      if (sort === 'created') return direction * (new Date(a.created_at || 0) - new Date(b.created_at || 0));
      const aa = labelFor(a), bb = labelFor(b);
      return direction * (aa.rank - bb.rank || aa.label.localeCompare(bb.label, 'hu') || String(a.name).localeCompare(String(b.name), 'hu'));
    });
  }

  window.BringListSort = { sortItems };

  const originalRenderList = window.renderBringList;
  // The feature is integrated by wrapping the existing list renderer when available.
  function integrate() {
    if (typeof originalRenderList !== 'function') return;
    if (window.__bringSortIntegrated) return;
    window.__bringSortIntegrated = true;
    window.renderBringList = function(items) { return originalRenderList(sortItems(items)); };
  }
  integrate();
})();
