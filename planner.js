/* Programtervező — isolated view module. Other views remain untouched. */
(function () {
  const PLANNER_DATES = [
    { key: '2026-08-20', label: '20. aug.', day: 'szerda' },
    { key: '2026-08-21', label: '21. aug.', day: 'csütörtök' },
    { key: '2026-08-22', label: '22. aug.', day: 'péntek' },
    { key: '2026-08-23', label: '23. aug.', day: 'szombat' },
  ];
  const PERIODS = [
    { key: 'morning', label: 'Délelőtt', time: '09:00–13:00' },
    { key: 'afternoon', label: 'Délután', time: '14:00–20:00' },
  ];

  let planItems = [];
  let plannerOpen = false;
  let pointerDrag = null;

  function esc(value) {
    return escapeHtml(value == null ? '' : value);
  }

  function programById(id) {
    return state.programs.find((p) => Number(p.id) === Number(id));
  }

  function topPrograms() {
    return [...state.programs]
      .sort((a, b) => {
        const diff = getLikeCount(b.id) - getLikeCount(a.id);
        return diff || String(a.title).localeCompare(String(b.title), 'hu');
      })
      .slice(0, 8);
  }

  function slotItems(date, period) {
    return planItems
      .filter((item) => item.plan_date === date && item.period === period)
      .sort((a, b) => Number(a.position) - Number(b.position));
  }

  function isUnavailable(date, period) {
    return date === '2026-08-20' && period === 'morning';
  }

  function plannerItemHtml(item) {
    const p = programById(item.program_id);
    if (!p) return '';
    return `
      <div class="planner-scheduled" draggable="true" data-plan-id="${item.id}" data-program-id="${p.id}" title="Húzd át másik időpontra">
        <span class="planner-scheduled__title">${esc(p.title)}</span>
        <span class="planner-scheduled__votes">${getLikeCount(p.id)} szav.</span>
      </div>`;
  }

  function topProgramHtml(p) {
    const count = getLikeCount(p.id);
    const scheduled = planItems.some((item) => Number(item.program_id) === Number(p.id));
    return `
      <div class="planner-top-item ${scheduled ? 'is-scheduled' : ''}" draggable="true" data-program-id="${p.id}" title="Húzd a tervbe">
        <span class="planner-top-item__title">${esc(p.title)}</span>
        <span class="planner-top-item__count">${count}</span>
      </div>`;
  }

  function renderPlanner() {
    const placeholder = document.getElementById('placeholder-view');
    if (!placeholder) return;
    placeholder.className = 'planner-view';
    placeholder.innerHTML = `
      <section class="planner-top-section">
        <div class="planner-section-head">
          <div>
            <h2>Top megszavazott programok</h2>
            <p>Húzd át a programokat a tervbe</p>
          </div>
          <span class="planner-section-count">${topPrograms().length}</span>
        </div>
        <div class="planner-top-scroll">
          <div class="planner-top-list">${topPrograms().map(topProgramHtml).join('')}</div>
        </div>
      </section>
      <section class="planner-plan-section">
        <div class="planner-section-head planner-section-head--plan">
          <div>
            <h2>Utazási terv</h2>
            <p>Délelőtt és délután bontásban</p>
          </div>
          <span class="planner-drag-hint">${icon('arrowsUpDown', { size: 18 })}</span>
        </div>
        <div class="planner-grid-scroll">
          <div class="planner-grid">
            <div class="planner-grid__period-spacer"></div>
            ${PLANNER_DATES.map((d) => `<div class="planner-grid__date"><strong>${d.label}</strong><span>${d.day}</span></div>`).join('')}
            ${PERIODS.map((period) => `
              <div class="planner-period-label">
                <span>${period.label}</span>
                <small>${period.time}</small>
              </div>
              ${PLANNER_DATES.map((date) => {
                const unavailable = isUnavailable(date.key, period.key);
                const items = slotItems(date.key, period.key);
                return `
                  <div class="planner-grid-cell ${unavailable ? 'is-unavailable' : ''}" data-date="${date.key}" data-period="${period.key}">
                    ${unavailable
                      ? '<span class="planner-grid-disabled">—</span>'
                      : items.length
                        ? items.map(plannerItemHtml).join('')
                        : '<div class="planner-grid-drop"><span>+</span><small>Húzd ide</small></div>'}
                  </div>`;
              }).join('')}
            `).join('')}
          </div>
        </div>
      </section>`;

    bindPlannerDnD();
  }

  async function loadPlan() {
    const result = await supabase
      .from('program_plan_items')
      .select('id, program_id, plan_date, period, position, created_by, created_at, updated_at')
      .order('plan_date', { ascending: true })
      .order('period', { ascending: true })
      .order('position', { ascending: true });
    if (result.error) throw result.error;
    planItems = result.data || [];
  }

  async function moveProgram(programId, date, period) {
    if (isUnavailable(date, period)) return;
    const current = planItems.find((item) => Number(item.program_id) === Number(programId));
    const sameSlot = current && current.plan_date === date && current.period === period;
    if (sameSlot) return;

    const { error: deleteError } = await supabase
      .from('program_plan_items')
      .delete()
      .eq('program_id', programId);
    if (deleteError) throw deleteError;

    const nextPosition = slotItems(date, period).length;
    const { error: insertError } = await supabase
      .from('program_plan_items')
      .insert({
        program_id: Number(programId),
        plan_date: date,
        period,
        position: nextPosition,
        created_by: state.currentUser || null,
      });
    if (insertError) throw insertError;

    await loadPlan();
    renderPlanner();
  }

  function handleDrop(programId, date, period) {
    moveProgram(programId, date, period).catch((error) => {
      console.error('Programtervező mentési hiba:', error);
      alert('A program áthelyezése nem sikerült.');
    });
  }

  function bindPlannerDnD() {
    const root = document.querySelector('.planner-view');
    if (!root) return;

    root.querySelectorAll('[draggable="true"]').forEach((el) => {
      el.addEventListener('dragstart', (event) => {
        const programId = el.dataset.programId;
        if (!programId) return;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', programId);
        el.classList.add('is-dragging');
      });
      el.addEventListener('dragend', () => el.classList.remove('is-dragging'));
    });

    root.querySelectorAll('.planner-grid-cell:not(.is-unavailable)').forEach((cell) => {
      cell.addEventListener('dragover', (event) => {
        event.preventDefault();
        cell.classList.add('is-drag-over');
      });
      cell.addEventListener('dragleave', () => cell.classList.remove('is-drag-over'));
      cell.addEventListener('drop', (event) => {
        event.preventDefault();
        cell.classList.remove('is-drag-over');
        const programId = event.dataTransfer.getData('text/plain');
        if (programId) handleDrop(programId, cell.dataset.date, cell.dataset.period);
      });
    });

    // Pointer Events fallback for touch devices. Uses pointer capture so the
    // drag remains attached to the finger while crossing the horizontal grid.
    root.querySelectorAll('[draggable="true"]').forEach((el) => {
      el.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'touch') return;
        const programId = el.dataset.programId;
        if (!programId) return;
        pointerDrag = {
          el,
          programId,
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          active: false,
          isTopItem: el.classList.contains('planner-top-item'),
          ghost: null,
        };
        el.setPointerCapture(event.pointerId);
      });

      el.addEventListener('pointermove', (event) => {
        if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
        const dx = event.clientX - pointerDrag.startX;
        const dy = event.clientY - pointerDrag.startY;
        if (!pointerDrag.active && Math.hypot(dx, dy) < 8) return;
        if (!pointerDrag.active && pointerDrag.isTopItem && Math.abs(dx) > Math.abs(dy) + 4) {
          try { el.releasePointerCapture(event.pointerId); } catch (e) {}
          pointerDrag = null;
          return;
        }
        if (!pointerDrag.active) {
          pointerDrag.active = true;
          event.preventDefault();
          pointerDrag.ghost = el.cloneNode(true);
          pointerDrag.ghost.classList.add('planner-drag-ghost');
          pointerDrag.ghost.style.width = `${Math.max(120, el.getBoundingClientRect().width)}px`;
          document.body.appendChild(pointerDrag.ghost);
        }
        event.preventDefault();
        pointerDrag.ghost.style.transform = `translate(${event.clientX + 10}px, ${event.clientY + 10}px)`;
        root.querySelectorAll('.planner-grid-cell.is-drag-over').forEach((cell) => cell.classList.remove('is-drag-over'));
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.planner-grid-cell:not(.is-unavailable)');
        if (target && root.contains(target)) target.classList.add('is-drag-over');
      });

      el.addEventListener('pointerup', (event) => finishPointerDrag(event));
      el.addEventListener('pointercancel', (event) => finishPointerDrag(event));
    });

    function finishPointerDrag(event) {
      if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
      const drag = pointerDrag;
      pointerDrag = null;
      if (drag.ghost) drag.ghost.remove();
      root.querySelectorAll('.planner-grid-cell.is-drag-over').forEach((cell) => cell.classList.remove('is-drag-over'));
      if (!drag.active) return;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.planner-grid-cell:not(.is-unavailable)');
      if (target && root.contains(target)) handleDrop(drag.programId, target.dataset.date, target.dataset.period);
    }
  }

  function activatePlanner() {
    plannerOpen = true;
    document.querySelector('.program-list')?.classList.add('hidden');
    document.getElementById('category-bar')?.classList.add('hidden');
    document.querySelector('.sort-bar')?.classList.add('hidden');
    document.querySelector('.app-title').textContent = 'Programtervező';
    document.querySelectorAll('.bottom-nav-item').forEach((item) => {
      item.classList.toggle('is-active', item.dataset.view === 'tervezett');
    });
    const placeholder = document.getElementById('placeholder-view');
    placeholder?.classList.remove('hidden');
    loadPlan()
      .then(renderPlanner)
      .catch((error) => {
        console.error('Programtervező betöltési hiba:', error);
        if (placeholder) placeholder.innerHTML = '<div class="planner-error">A programterv betöltése nem sikerült.</div>';
      });
  }

  function leavePlanner() {
    if (!plannerOpen) return;
    plannerOpen = false;
    document.querySelector('.app-title').textContent = 'Noszvaj és környéke';
    document.querySelector('.program-list')?.classList.remove('hidden');
    document.getElementById('category-bar')?.classList.remove('hidden');
    document.querySelector('.sort-bar')?.classList.remove('hidden');
  }

  document.addEventListener('click', (event) => {
    const nav = event.target.closest('.bottom-nav-item');
    if (!nav) return;
    if (nav.dataset.view === 'tervezett') {
      event.preventDefault();
      event.stopImmediatePropagation();
      state.currentView = 'tervezett';
      activatePlanner();
      return;
    }
    leavePlanner();
  }, true);

  window.renderPlannerView = activatePlanner;
})();
