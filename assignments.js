(() => {
  const DATA = window.PROGRAMACION_DATA;
  if (!DATA?.evaluations?.length) return;

  const assignmentsBtn = document.getElementById('assignmentsBtn');
  const assignmentsPage = document.getElementById('assignmentsPage');
  const evaluationWorkspace = document.getElementById('evaluationWorkspace');
  const assignmentsGrid = document.getElementById('assignmentsGrid');
  const assignmentSearch = document.getElementById('assignmentSearch');
  const questionNav = document.getElementById('questionNav');
  const evaluationSelect = document.getElementById('evaluationSelect');
  const saveBtn = document.getElementById('saveBtn');

  if (!assignmentsBtn || !assignmentsPage || !evaluationWorkspace || !assignmentsGrid) return;

  let assignmentsOpen = false;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    }[ch]));
  }

  function getType(ev) {
    if (ev.type) return ev.type;
    if (/compil/i.test(ev.name)) return 'Compilado';
    if (/^I\s*\d+/i.test(ev.name)) return 'Interrogación';
    if (/control/i.test(ev.name)) return 'Control';
    if (/examen/i.test(ev.name)) return 'Examen';
    return 'Evaluación';
  }

  function completedCount(ev) {
    return ev.questions.filter(q => localStorage.getItem(`programacion:done:${ev.id}:${q.id}`) === '1').length;
  }

  function renderAssignments(filter = '') {
    const term = filter.trim().toLowerCase();
    const matches = DATA.evaluations
      .map((ev, index) => ({ ev, index }))
      .filter(({ev}) => {
        const haystack = `${ev.name} ${ev.semester || ''} ${ev.section || ''} ${getType(ev)}`.toLowerCase();
        return !term || haystack.includes(term);
      });

    if (!matches.length) {
      assignmentsGrid.innerHTML = '<div class="assignment-empty">No hay evaluaciones que coincidan con la búsqueda.</div>';
      return;
    }

    assignmentsGrid.innerHTML = matches.map(({ev, index}) => {
      const done = completedCount(ev);
      const total = ev.questions.length;
      const pct = total ? Math.round(done / total * 100) : 0;
      const complete = total > 0 && done === total;
      return `
        <article class="assignment-card" data-assignment-index="${index}" tabindex="0">
          <div class="assignment-card-top">
            <span class="assignment-type">▣ ${escapeHtml(getType(ev))}</span>
            <span class="assignment-state ${complete ? 'complete' : ''}">${complete ? 'Completada' : 'Disponible'}</span>
          </div>
          <div class="assignment-body">
            <h2 class="assignment-name">${escapeHtml(ev.name)}</h2>
            <div class="assignment-meta">${escapeHtml([ev.semester, ev.section].filter(Boolean).join(' · '))}</div>
            <div class="assignment-progress-row">
              <span>Progreso</span>
              <span>${done}/${total} preguntas</span>
            </div>
            <div class="assignment-progress"><span style="width:${pct}%"></span></div>
          </div>
          <div class="assignment-footer">
            <span>${total} ${total === 1 ? 'pregunta' : 'preguntas'}</span>
            <button class="assignment-open" data-open-assignment="${index}">Abrir</button>
          </div>
        </article>`;
    }).join('');

    assignmentsGrid.querySelectorAll('[data-assignment-index]').forEach(card => {
      card.addEventListener('dblclick', () => openEvaluation(Number(card.dataset.assignmentIndex)));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter') openEvaluation(Number(card.dataset.assignmentIndex));
      });
    });

    assignmentsGrid.querySelectorAll('[data-open-assignment]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openEvaluation(Number(btn.dataset.openAssignment));
      });
    });
  }

  function setAssignmentsActive(active) {
    assignmentsBtn.classList.toggle('active', active);
    if (active) {
      document.querySelectorAll('#questionNav .side-item').forEach(item => {
        if (item !== assignmentsBtn) item.classList.remove('active');
      });
    }
  }

  function openAssignments() {
    try { saveBtn?.click(); } catch (_) {}
    assignmentsOpen = true;
    evaluationWorkspace.style.display = 'none';
    assignmentsPage.classList.remove('hidden');
    setAssignmentsActive(true);
    renderAssignments(assignmentSearch?.value || '');
    document.title = 'Assignments · Programación';
  }

  function closeAssignments() {
    if (!assignmentsOpen) return;
    assignmentsOpen = false;
    assignmentsPage.classList.add('hidden');
    evaluationWorkspace.style.display = '';
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
  assignmentSearch?.addEventListener('input', e => renderAssignments(e.target.value));

  // Al navegar a Instrucciones/Preguntas/Revisar se vuelve al workspace.
  questionNav?.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (btn && btn !== assignmentsBtn) closeAssignments();
  }, true);

  evaluationSelect?.addEventListener('change', closeAssignments, true);

  // Acceso desde el logotipo: vuelve al listado de evaluaciones, como un hub del curso.
  const brand = document.querySelector('.brand-row');
  if (brand) {
    brand.style.cursor = 'pointer';
    brand.title = 'Ver Assignments';
    brand.addEventListener('click', openAssignments);
  }

  renderAssignments();
})();
