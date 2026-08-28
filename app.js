(() => {
  const DATA = window.PROGRAMACION_DATA;
  if (!DATA || !DATA.evaluations?.length) {
    document.body.innerHTML = '<pre style="color:white">No se pudo cargar el banco de preguntas.</pre>';
    return;
  }

  let currentEvaluationIndex = 0;
  let currentQuestionIndex = 0;
  let currentView = 'question';
  let editor = null;
  let pyodide = null;
  let saveTimer = null;

  const els = {
    questionItems: document.getElementById('questionItems'),
    instructionsBtn: document.getElementById('instructionsBtn'),
    reviewBtn: document.getElementById('reviewBtn'),
    collapseBtn: document.getElementById('collapseBtn'),
    evaluationSelect: document.getElementById('evaluationSelect'),
    courseCrumb: document.getElementById('courseCrumb'),
    semesterCrumb: document.getElementById('semesterCrumb'),
    sectionCrumb: document.getElementById('sectionCrumb'),
    instructionsView: document.getElementById('instructionsView'),
    questionView: document.getElementById('questionView'),
    reviewView: document.getElementById('reviewView'),
    statementScroll: document.getElementById('statementScroll'),
    runBtn: document.getElementById('runBtn'),
    saveBtn: document.getElementById('saveBtn'),
    resetBtn: document.getElementById('resetBtn'),
    resultsBody: document.getElementById('resultsBody'),
    clearResultsBtn: document.getElementById('clearResultsBtn'),
    pythonStatus: document.getElementById('pythonStatus'),
    draftStatus: document.getElementById('draftStatus'),
    themeBtn: document.getElementById('themeBtn')
  };

  const evaluation = () => DATA.evaluations[currentEvaluationIndex];
  const question = () => evaluation().questions[currentQuestionIndex];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[ch]));
  }

  function storageKey(q = question()) {
    return `programacion:draft:${evaluation().id}:${q.id}`;
  }

  function doneKey(q = question()) {
    return `programacion:done:${evaluation().id}:${q.id}`;
  }

  function isDone(q) {
    return localStorage.getItem(doneKey(q)) === '1';
  }

  function getDraft(q = question()) {
    const saved = localStorage.getItem(storageKey(q));
    return saved !== null ? saved : (q.starter || '');
  }

  function normalizeLeadingIndentation(code) {
    const unicodeSpaces = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g;
    return String(code ?? '')
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map(line => {
        const match = line.match(/^[\t \u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/);
        if (!match) return line;
        const cleaned = match[0].replace(unicodeSpaces, ' ').replace(/\t/g, '    ');
        return cleaned + line.slice(match[0].length);
      })
      .join('\n');
  }

  function saveDraft() {
    if (!editor || currentView !== 'question') return;
    const code = normalizeLeadingIndentation(editor.getValue());
    localStorage.setItem(storageKey(), code);
    els.draftStatus.textContent = 'Guardado';
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    els.draftStatus.textContent = 'Guardando…';
    saveTimer = setTimeout(saveDraft, 450);
  }

  function setEditorValue(value) {
    if (!editor) return;
    editor.setValue(normalizeLeadingIndentation(value || ''));
    editor.setPosition({ lineNumber: 1, column: 1 });
    editor.revealLine(1);
  }

  function renderEvaluationSelect() {
    els.evaluationSelect.innerHTML = DATA.evaluations.map((ev, i) =>
      `<option value="${i}" ${i === currentEvaluationIndex ? 'selected' : ''}>${escapeHtml(ev.name)}</option>`
    ).join('');
  }

  function renderBreadcrumbs() {
    const ev = evaluation();
    els.courseCrumb.textContent = DATA.course;
    els.semesterCrumb.textContent = ev.semester || '';
    els.sectionCrumb.textContent = ev.section || '';
  }

  function renderSidebar() {
    const ev = evaluation();
    els.questionItems.innerHTML = ev.questions.map((q, i) => {
      const active = currentView === 'question' && i === currentQuestionIndex;
      const done = isDone(q);
      return `<button class="side-item ${active ? 'active' : ''} ${done ? 'done' : ''}" data-q="${i}">
        <span class="side-icon">${done ? '✓' : '&lt;/&gt;'}</span>
        <span>Pregunta ${i + 1}</span>
      </button>`;
    }).join('');

    els.questionItems.querySelectorAll('[data-q]').forEach(btn => {
      btn.addEventListener('click', () => openQuestion(Number(btn.dataset.q)));
    });

    els.instructionsBtn.classList.toggle('active', currentView === 'instructions');
    els.reviewBtn.classList.toggle('active', currentView === 'review');
  }

  function exampleHtml(test, index) {
    const leftLabel = test.input !== undefined ? 'Input' : 'Código de prueba';
    const leftValue = test.input !== undefined ? test.input.trimEnd() : `${test.call}\nprint(${test.call})`;
    return `<section class="example-block">
      <h3 class="example-heading">Ejemplo ${index + 1}</h3>
      <div class="io-grid">
        <div class="io-card">
          <div class="io-label">${leftLabel}</div>
          <pre class="io-code">${escapeHtml(leftValue)}</pre>
        </div>
        <div class="io-card">
          <div class="io-label">Output</div>
          <pre class="io-code">${escapeHtml(test.expected)}</pre>
        </div>
      </div>
      ${test.explanation ? `<p class="explanation"><strong>Explicación:</strong> ${escapeHtml(test.explanation)}</p>` : ''}
    </section>`;
  }

  function renderQuestion() {
    const q = question();
    const requirements = [...(q.requirements || []), ...(q.moduleItems || [])];
    els.questionView.innerHTML = `
      <h1 class="question-title">Pregunta ${currentQuestionIndex + 1}: ${escapeHtml(q.title)}</h1>
      <div class="title-rule"></div>
      <h2 class="section-title">Objetivo</h2>
      ${(q.objective || []).map(p => `<p class="statement-p">${escapeHtml(p)}</p>`).join('')}
      ${q.moduleTitle ? `<p class="module-title">${escapeHtml(q.moduleTitle)}</p>` : ''}
      ${requirements.length ? `<ul class="module-list">${requirements.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
      <h2 class="examples-title">Ejemplos</h2>
      ${q.tests.map(exampleHtml).join('')}
    `;
  }

  function renderInstructions() {
    const ev = evaluation();
    els.instructionsView.innerHTML = `
      <h1 class="question-title">${escapeHtml(ev.name)} · Instrucciones</h1>
      <div class="title-rule"></div>
      <h2 class="section-title">Práctica personal</h2>
      <p class="statement-p">${escapeHtml(ev.instructions || '')}</p>
      <p class="statement-p">El código se ejecuta localmente en tu navegador mediante Python. El corrector de esta versión utiliza solamente los casos de prueba visibles que se han incorporado al banco de estudio.</p>
      <p class="statement-p">Tus soluciones se guardan automáticamente por evaluación y por pregunta. A medida que agreguemos nuevas interrogaciones, aparecerán como evaluaciones independientes en la barra superior sin cambiar la estructura del sitio.</p>
    `;
  }

  function renderReview() {
    const ev = evaluation();
    const completed = ev.questions.filter(isDone).length;
    els.reviewView.innerHTML = `
      <h1 class="question-title">Revisar ${escapeHtml(ev.name)}</h1>
      <div class="title-rule"></div>
      <h2 class="section-title">Progreso: ${completed}/${ev.questions.length}</h2>
      <div class="review-grid">
        ${ev.questions.map((q, i) => `<div class="review-row">
          <div><strong>Pregunta ${i + 1}</strong><br><span>${escapeHtml(q.title)}</span></div>
          <div>
            <span class="review-status ${isDone(q) ? 'done' : ''}">${isDone(q) ? 'Correcta' : 'Pendiente'}</span>
            <button class="review-open" data-review-q="${i}">Abrir</button>
          </div>
        </div>`).join('')}
      </div>
    `;
    els.reviewView.querySelectorAll('[data-review-q]').forEach(btn => {
      btn.addEventListener('click', () => openQuestion(Number(btn.dataset.reviewQ)));
    });
  }

  function switchView(view) {
    saveDraft();
    currentView = view;
    els.instructionsView.classList.toggle('hidden', view !== 'instructions');
    els.questionView.classList.toggle('hidden', view !== 'question');
    els.reviewView.classList.toggle('hidden', view !== 'review');
    if (view === 'instructions') renderInstructions();
    if (view === 'review') renderReview();
    renderSidebar();
    els.statementScroll.scrollTop = 0;
  }

  function openQuestion(index) {
    saveDraft();
    currentQuestionIndex = index;
    currentView = 'question';
    els.instructionsView.classList.add('hidden');
    els.reviewView.classList.add('hidden');
    els.questionView.classList.remove('hidden');
    renderQuestion();
    renderSidebar();
    setEditorValue(getDraft());
    clearResults();
    els.statementScroll.scrollTop = 0;
    setTimeout(() => editor?.focus(), 50);
  }

  function clearResults() {
    els.resultsBody.innerHTML = '<div class="empty-results">Ejecuta tu código para ver los resultados.</div>';
  }

  function normalizeOutput(value) {
    return String(value ?? '').replace(/\r/g, '').trim();
  }

  const PYTHON_RUNNER = `
import json, sys, io, builtins, types, traceback
p = json.loads(_programacion_payload)
student_code = p["code"]
input_lines = iter(p.get("input", "").splitlines())
old_input = builtins.input
old_stdout = sys.stdout
buf = io.StringIO()

def fake_input(prompt=""):
    return next(input_lines)

builtins.input = fake_input
sys.stdout = buf
namespace = {"__name__": "__main__"}

try:
    kind = p.get("kind")

    if kind == "dcc_a":
        m = types.ModuleType("dccdatos")
        courses = {"Carlos Sepulveda": ["IIC1101", "MAT1203", "FIL2001", "FIS1503"]}
        notes = {
            ("IIC1101", "Carlos Sepulveda"): 6.1,
            ("MAT1203", "Carlos Sepulveda"): 5.6,
            ("FIL2001", "Carlos Sepulveda"): 6.1,
            ("FIS1503", "Carlos Sepulveda"): 4.8,
        }
        m.obtener_cantidad_inscritos = lambda nombre: len(courses[nombre])
        m.obtener_curso_inscrito = lambda nombre, i: courses[nombre][i]
        m.obtener_nota = lambda curso, nombre: notes[(curso, nombre)]
        sys.modules["dccdatos"] = m

    elif kind == "dcc_b":
        m = types.ModuleType("dccdatos")
        courses = {"Renata Alvarez": ["AST101", "DPT5000", "IIC1001"]}
        credits = {
            "MAT1107": 10, "AST101": 5, "QIM100E": 10,
            "DPT5000": 5, "IIC2143": 10, "IIC1001": 10,
        }
        m.obtener_cantidad_inscritos = lambda nombre: len(courses[nombre])
        m.obtener_curso_inscrito = lambda nombre, i: courses[nombre][i]
        m.obtener_creditos = lambda curso: credits[curso]
        sys.modules["dccdatos"] = m

    elif kind == "func_ondulado":
        m = types.ModuleType("mates")
        m.obtener_largo = lambda numero: len(str(numero))
        m.obtener_digito = lambda numero, pos: int(str(numero)[pos])
        sys.modules["mates"] = m

    compiled = compile(student_code, "<tu_codigo.py>", "exec")
    exec(compiled, namespace, namespace)

    if p.get("call"):
        result_value = eval(p["call"], namespace, namespace)
        print(result_value)

    result = {"ran": True, "stdout": buf.getvalue(), "error": ""}
except Exception:
    result = {"ran": False, "stdout": buf.getvalue(), "error": traceback.format_exc()}
finally:
    builtins.input = old_input
    sys.stdout = old_stdout

json.dumps(result)
`;

  async function runTest(q, test, code) {
    const payload = {
      code: normalizeLeadingIndentation(code),
      input: test.input || '',
      call: test.call || '',
      kind: q.kind
    };
    pyodide.globals.set('_programacion_payload', JSON.stringify(payload));
    const raw = await pyodide.runPythonAsync(PYTHON_RUNNER);
    return JSON.parse(raw);
  }

  async function runAllTests() {
    if (!editor || currentView !== 'question') return;
    if (!pyodide) {
      els.resultsBody.innerHTML = '<div class="test-result fail"><div class="test-result-head">Python todavía se está cargando</div><pre class="test-output">Espera unos segundos y vuelve a ejecutar.</pre></div>';
      return;
    }

    saveDraft();
    const q = question();
    const code = normalizeLeadingIndentation(editor.getValue());
    els.runBtn.disabled = true;
    els.runBtn.textContent = 'Ejecutando…';
    els.resultsBody.innerHTML = '';
    let allPass = true;

    for (let i = 0; i < q.tests.length; i++) {
      const test = q.tests[i];
      const result = await runTest(q, test, code);
      const pass = result.ran && normalizeOutput(result.stdout) === normalizeOutput(test.expected);
      allPass = allPass && pass;

      const output = result.ran
        ? (normalizeOutput(result.stdout) || '(sin salida)')
        : `${normalizeOutput(result.stdout)}${result.stdout ? '\n' : ''}${result.error}`;

      els.resultsBody.insertAdjacentHTML('beforeend', `
        <div class="test-result ${pass ? 'pass' : 'fail'}">
          <div class="test-result-head">${pass ? '✓' : '✕'} Caso ${i + 1} ${pass ? 'correcto' : 'incorrecto'}</div>
          <pre class="test-output">${escapeHtml(output)}</pre>
        </div>
      `);
    }

    localStorage.setItem(doneKey(), allPass ? '1' : '0');
    renderSidebar();
    els.runBtn.disabled = false;
    els.runBtn.textContent = '▶ Ejecutar';
    els.draftStatus.textContent = allPass ? 'Todos los casos visibles pasan ✓' : 'Revisa los resultados';
  }

  function changeEvaluation(index) {
    saveDraft();
    currentEvaluationIndex = index;
    currentQuestionIndex = 0;
    currentView = 'question';
    renderBreadcrumbs();
    renderEvaluationSelect();
    renderQuestion();
    renderSidebar();
    setEditorValue(getDraft());
    clearResults();
    els.statementScroll.scrollTop = 0;
  }

  function resetCurrentCode() {
    if (currentView !== 'question') return;
    if (!confirm('¿Quieres borrar tu código guardado de esta pregunta y comenzar de nuevo?')) return;
    localStorage.removeItem(storageKey());
    localStorage.removeItem(doneKey());
    setEditorValue(question().starter || '');
    clearResults();
    renderSidebar();
    els.draftStatus.textContent = 'Código reiniciado';
  }

  function bindEvents() {
    els.instructionsBtn.addEventListener('click', () => switchView('instructions'));
    els.reviewBtn.addEventListener('click', () => switchView('review'));
    els.collapseBtn.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
      setTimeout(() => editor?.layout(), 220);
    });
    els.evaluationSelect.addEventListener('change', e => changeEvaluation(Number(e.target.value)));
    els.runBtn.addEventListener('click', runAllTests);
    els.saveBtn.addEventListener('click', saveDraft);
    els.resetBtn.addEventListener('click', resetCurrentCode);
    els.clearResultsBtn.addEventListener('click', clearResults);
    els.themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light');
      if (editor) monaco.editor.setTheme(document.body.classList.contains('light') ? 'vs' : 'vs-dark');
    });
    window.addEventListener('resize', () => editor?.layout());
    window.addEventListener('beforeunload', saveDraft);
  }

  async function initPython() {
    try {
      els.pythonStatus.textContent = 'Python…';
      pyodide = await loadPyodide();
      els.pythonStatus.textContent = 'Python listo';
      els.pythonStatus.classList.add('ready');
    } catch (error) {
      console.error(error);
      els.pythonStatus.textContent = 'Error Python';
      els.pythonStatus.classList.add('error');
    }
  }

  function initMonaco() {
    window.require.config({
      paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs' }
    });

    window.require(['vs/editor/editor.main'], () => {
      editor = monaco.editor.create(document.getElementById('editor'), {
        value: getDraft(),
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Consolas, "Courier New", monospace',
        lineNumbers: 'on',
        glyphMargin: false,
        folding: true,
        scrollBeyondLastLine: false,
        wordWrap: 'off',
        insertSpaces: true,
        tabSize: 4,
        detectIndentation: false,
        autoIndent: 'full',
        formatOnType: true,
        renderWhitespace: 'selection',
        roundedSelection: false,
        padding: { top: 12 },
        suggest: { showWords: false },
        quickSuggestions: false
      });

      editor.getModel().updateOptions({ insertSpaces: true, tabSize: 4, detectIndentation: false });
      editor.onDidChangeModelContent(scheduleSave);
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runAllTests);
      els.draftStatus.textContent = 'Guardado automático';
      setTimeout(() => editor.focus(), 100);
    });
  }

  function init() {
    renderEvaluationSelect();
    renderBreadcrumbs();
    renderQuestion();
    renderSidebar();
    renderInstructions();
    bindEvents();
    initMonaco();
    initPython();
  }

  init();
})();
