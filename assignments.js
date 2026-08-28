(() => {
  const DATA = window.PROGRAMACION_DATA;
  if (!DATA?.evaluations?.length) return;

  const assignmentsBtn = document.getElementById('assignmentsBtn');
  const assignmentsPage = document.getElementById('assignmentsPage');
  const evaluationWorkspace = document.getElementById('evaluationWorkspace');
  const assignmentGroups = document.getElementById('assignmentGroups');
  const assignmentSort = document.getElementById('assignmentSort');
  const assignmentDirection = document.getElementById('assignmentDirection');
  const questionNav = document.getElementById('questionNav');
  const courseNav = document.getElementById('courseNav');
  const evaluationSelect = document.getElementById('evaluationSelect');
  const saveBtn = document.getElementById('saveBtn');
  const dashboardCount = document.getElementById('dashboardCount');

  if (!assignmentsBtn || !assignmentsPage || !evaluationWorkspace || !assignmentGroups) return;

  let assignmentsOpen = false;
  let ascending = true;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    }[ch]));
  }

  function getType(ev) {
    if (ev.type) return ev.type;
    if (/compil/i.test(ev.name)) return 'Compilados';
    if (/^I\s*\d+/i.test(ev.name)) return 'Interrogaciones';
    if (/control/i.test(ev.name)) return 'Controles';
    if (/examen/i.test(ev.name)) return 'Exámenes';
    if (/tarea/i.test(ev.name)) return 'Tareas';
    return 'Otros';
  }

  function completedCount(ev) {
    return ev.questions.filter(q => localStorage.getItem(`programacion:done:${ev.id}:${q.id}`) === '1').length;
  }

  function isComplete(ev) {
    return ev.questions.length > 0 && completedCount(ev) === ev.questions.length;
  }

  function getProgress(ev) {
    return ev.questions.length ? completedCount(ev) / ev.questions.length : 0;
  }

  function evaluationMeta(ev) {
    const bits = [];
    if (ev.statusText) bits.push(ev.statusText);
    else bits.push('Disponible para práctica');
    if (ev.semester) bits.push(ev.semester);
    if (ev.section) bits.push(ev.section);
    return bits.join(' | ');
  }

  function sortedEvaluations() {
    const sort = assignmentSort?.value || 'name';
    return DATA.evaluations
      .map((ev, index) => ({ ev, index }))
      .sort((a, b) => {
        let av, bv;
        if (sort === 'type') {
          av = getType(a.ev).toLowerCase();
          bv = getType(b.ev).toLowerCase();
        } else if (sort === 'progress') {
          av = getProgress(a.ev);
          bv = getProgress(b.ev);
        } else {
          av = a.ev.name.toLowerCase();
          bv = b.ev.name.toLowerCase();
        }
        if (av < bv) return ascending ? -1 : 1;
        if (av > bv) return ascending ? 1 : -1;
        return 0;
      });
  }

  function renderAssignments() {
    const groupOrder = ['Interrogaciones','Compilados','Controles','Exámenes','Tareas','Otros'];
    const grouped = new Map(groupOrder.map(name => [name, []]));

    for (const item of sortedEvaluations()) {
      const type = getType(item.ev);
      if (!grouped.has(type)) grouped.set(type, []);
      grouped.get(type).push(item);
    }

    dashboardCount.textContent = String(DATA.evaluations.length);

    const html = [];
    for (const groupName of groupOrder) {
      const items = grouped.get(groupName) || [];
      if (!items.length) continue;

      html.push(`
        <section class="assignment-group">
          <div class="assignment-group-head">
            <span class="assignment-group-title">${escapeHtml(groupName)}</span>
            <span class="assignment-group-count">${items.length}</span>
            <button class="assignment-group-eye" tabindex="-1">◉̸</button>
          </div>
          <div class="assignment-group-rows">
            ${items.map(({ev,index}) => {
              const done = completedCount(ev);
              const total = ev.questions.length;
              const complete = isComplete(ev);
              return `
                <div class="assignment-row" data-assignment-index="${index}" role="button" tabindex="0">
                  <div class="assignment-main">
                    <div class="assignment-name">${escapeHtml(ev.name)}</div>
                    <div class="assignment-meta">🔒 ${escapeHtml(evaluationMeta(ev))}</div>
                  </div>
                  <div class="assignment-status ${complete ? 'complete' : ''}">
                    <span class="assignment-status-dot">${complete ? '✓' : '!'}</span>
                    <span>${complete ? 'Completada' : `${done}/${total} resueltas`}</span>
                  </div>
                  <div class="assignment-eye">◉̸</div>
                </div>`;
            }).join('')}
          </div>
        </section>`);
    }

    assignmentGroups.innerHTML = html.length
      ? html.join('')
      : '<div class="assignment-empty">Todavía no hay evaluaciones cargadas.</div>';

    assignmentGroups.querySelectorAll('[data-assignment-index]').forEach(row => {
      const open = () => openEvaluation(Number(row.dataset.assignmentIndex));
      row.addEventListener('click', open);
      row.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });
  }

  function openAssignments() {
    try { saveBtn?.click(); } catch (_) {}
    assignmentsOpen = true;
    document.body.classList.add('assignments-mode');
    evaluationWorkspace.style.display = 'none';
    assignmentsPage.classList.remove('hidden');
    questionNav.classList.add('hidden');
    courseNav.classList.remove('hidden');
    renderAssignments();
    document.title = 'Assignments · Programación';
  }

  function closeAssignments() {
    if (!assignmentsOpen) return;
    assignmentsOpen = false;
    document.body.classList.remove('assignments-mode');
    assignmentsPage.classList.add('hidden');
    evaluationWorkspace.style.display = '';
    courseNav.classList.add('hidden');
    questionNav.classList.remove('hidden');
    assignmentsBtn.classList.remove('active');
    document.title = 'Programación · Práctica';
    window.dispatchEvent(new Event('resize'));
  }

  function openEvaluation(index) {
    closeAssignments();
    evaluationSelect.value = String(index);
    evaluationSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  assignmentsBtn.addEventListener('click', openAssignments);
  assignmentSort?.addEventListener('change', renderAssignments);
  assignmentDirection?.addEventListener('click', () => {
    ascending = !ascending;
    assignmentDirection.textContent = ascending ? '⇅' : '⇵';
    renderAssignments();
  });

  questionNav?.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (btn && btn !== assignmentsBtn) closeAssignments();
  }, true);

  evaluationSelect?.addEventListener('change', closeAssignments, true);

  const brand = document.querySelector('.brand-row');
  if (brand) {
    brand.style.cursor = 'pointer';
    brand.title = 'Ver Assignments';
    brand.addEventListener('click', openAssignments);
  }

  const dashboardCourseBtn = document.getElementById('dashboardCourseBtn');
  dashboardCourseBtn?.addEventListener('click', openAssignments);

  renderAssignments();
})();
