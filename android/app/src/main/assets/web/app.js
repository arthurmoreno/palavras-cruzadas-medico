(() => {
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const engine = new CrosswordEngine({ rows: 13, cols: 13, cell: 36 });

  const disciplineEl = document.getElementById('disciplineSelect');
  const difficultyEl = document.getElementById('difficultySelect');
  const modeEl = document.getElementById('modeSelect');
  const newGameBtn = document.getElementById('newGameBtn');
  const themeToggle = document.getElementById('themeToggle');
  const scoreEl = document.getElementById('score');
  const timerEl = document.getElementById('timer');
  const accuracyEl = document.getElementById('accuracy');
  const cluesAcrossEl = document.getElementById('cluesAcross');
  const cluesDownEl = document.getElementById('cluesDown');
  const reviewEl = document.getElementById('review');
  const reviewListEl = document.getElementById('reviewList');
  const checkBtn = document.getElementById('checkBtn');
  const revealLetterBtn = document.getElementById('revealLetterBtn');
  const revealWordBtn = document.getElementById('revealWordBtn');

  const editor = {
    panel: document.getElementById('editor'),
    input: document.getElementById('editorInput'),
    loadBtn: document.getElementById('loadEditorData'),
  };

  const tabs = Array.from(document.querySelectorAll('.tab'));
  const tabPanels = {
    jogo: document.getElementById('tab-jogo'),
    estatisticas: document.getElementById('tab-estatisticas'),
    perfil: document.getElementById('tab-perfil'),
    editor: document.getElementById('tab-editor'),
  };

  const state = {
    fill: {},
    active: null,
    focusDir: 'A',
    focusPositions: [],
    correct: 0,
    total: 0,
    score: 0,
    mistakes: 0,
    startTime: null,
    timerId: null,
    mode: 'classico',
    entries: [],
  };

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function startTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.startTime = Date.now();
    if (state.mode === 'cronometrado') {
      let remaining = 180;
      timerEl.textContent = formatTime(remaining);
      state.timerId = setInterval(() => {
        remaining -= 0.25;
        if (remaining <= 0) {
          timerEl.textContent = '00:00';
          stopTimer();
          showReview();
        } else {
          timerEl.textContent = formatTime(remaining);
        }
      }, 250);
    } else {
      timerEl.textContent = '00:00';
      state.timerId = setInterval(() => {
        const elapsed = (Date.now() - state.startTime) / 1000;
        timerEl.textContent = formatTime(elapsed);
      }, 250);
    }
  }

  function stopTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
  }

  function seededRngFromString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    let x = (h || 123456789) >>> 0;
    return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x >>>= 0; x ^= x << 5; x >>>= 0; return (x >>> 0) / 0xffffffff; };
  }

  function pickEntries() {
    const disc = disciplineEl.value;
    const diff = difficultyEl.value;
    const all = TERM_BANK[disc]?.[diff] || [];
    let shuffled;
    if (state.mode === 'diario') {
      const today = new Date().toISOString().slice(0, 10);
      const rng = seededRngFromString(`${today}-${disc}-${diff}`);
      shuffled = [...all].map(v => ({ v, r: rng() })).sort((a, b) => a.r - b.r).map(x => x.v);
    } else {
      shuffled = [...all].sort(() => Math.random() - 0.5);
    }
    return shuffled.slice(0, Math.min(10, shuffled.length));
  }

  function buildClueLists() {
    cluesAcrossEl.innerHTML = '';
    cluesDownEl.innerHTML = '';
    const across = engine.words.filter(w => w.dir === 'A');
    const down = engine.words.filter(w => w.dir === 'D');
    const add = (parent, list) => {
      list.sort((a, b) => a.number - b.number).forEach(w => {
        const li = document.createElement('li');
        li.textContent = `${w.number}. ${w.clue}`;
        li.tabIndex = 0;
        li.addEventListener('click', () => focusWord(w));
        li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') focusWord(w); });
        parent.appendChild(li);
      });
    };
    add(cluesAcrossEl, across);
    add(cluesDownEl, down);
  }

  function focusWord(word) {
    state.active = word.positions[0];
    state.focusDir = word.dir;
    state.focusPositions = word.positions;
    render();
  }

  function render() {
    engine.render(ctx, { fill: state.fill, active: state.active, focus: state.focusPositions });
    scoreEl.textContent = String(state.score);
    const accuracy = state.total > 0 ? Math.round(100 * (state.total - state.mistakes) / state.total) : 100;
    accuracyEl.textContent = `${accuracy}%`;
  }

  function newGame() {
    reviewEl.hidden = true;
    state.mode = modeEl.value;
    state.fill = {}; state.active = null; state.focusPositions = [];
    state.correct = 0; state.total = 0; state.score = 0; state.mistakes = 0;
    const entries = pickEntries();
    if (entries.length === 0) { alert('Banco insuficiente. Tente outra disciplina/dificuldade.'); return; }
    engine.reset(13, 13);
    engine.generate(entries);
    state.entries = entries;
    state.total = engine.words.reduce((sum, w) => sum + w.answer.length, 0);
    buildClueLists();
    render();
    startTimer();
  }

  function nextCellInFocus(indexDelta) {
    if (!state.focusPositions.length) return null;
    const idx = state.focusPositions.findIndex(p => p.r === state.active?.r && p.c === state.active?.c);
    const next = state.focusPositions[(idx + indexDelta + state.focusPositions.length) % state.focusPositions.length];
    return next;
  }

  function handleCharInput(ch) {
    if (!state.active) return;
    const key = `${state.active.r},${state.active.c}`;
    const expected = engine.grid[state.active.r][state.active.c].ch;
    state.fill[key] = ch;
    state.score += ch === expected ? 5 : -1;
    state.mistakes += ch === expected ? 0 : 1;
    state.correct += ch === expected ? 1 : 0;
    render();
    const nxt = nextCellInFocus(1);
    if (nxt) { state.active = nxt; render(); }
    checkCompletion();
  }

  function checkCompletion() {
    for (const w of engine.words) {
      for (const pos of w.positions) {
        const key = `${pos.r},${pos.c}`;
        const expected = engine.grid[pos.r][pos.c].ch;
        if (state.fill[key] !== expected) return false;
      }
    }
    stopTimer();
    showReview();
    const stats = JSON.parse(localStorage.getItem('pcm_stats') || '{}');
    stats.games = (stats.games || 0) + 1;
    if (state.mode === 'diario') {
      const today = new Date().toISOString().slice(0,10);
      const last = stats.lastDaily || '';
      stats.streak = today === last ? (stats.streak || 0) : (stats.streak || 0) + 1;
      stats.lastDaily = today;
    }
    localStorage.setItem('pcm_stats', JSON.stringify(stats));
    document.getElementById('stat-games').textContent = stats.games || 0;
    document.getElementById('stat-streak').textContent = stats.streak || 0;
    return true;
  }

  function showReview() {
    reviewEl.hidden = false;
    reviewListEl.innerHTML = '';
    engine.words.sort((a, b) => a.number - b.number).forEach(w => {
      const li = document.createElement('li');
      const answer = w.answer.replace(/_/g, ' ');
      const link = w.source ? ` — referência: ${w.source}` : '';
      li.textContent = `${w.number}. ${answer}: ${w.clue}${link}`;
      reviewListEl.appendChild(li);
    });
    if (state.mode === 'cronometrado' && state.startTime) {
      const elapsed = (Date.now() - state.startTime) / 1000;
      const stats = JSON.parse(localStorage.getItem('pcm_stats') || '{}');
      const best = stats.bestTime;
      if (!best || elapsed < best) { stats.bestTime = elapsed; }
      localStorage.setItem('pcm_stats', JSON.stringify(stats));
      document.getElementById('stat-best-time').textContent = stats.bestTime ? formatTime(stats.bestTime) : '—';
    }
  }

  canvas.addEventListener('click', (e) => {
    const cell = engine.cellAt(e.clientX, e.clientY, canvas);
    if (!cell) return;
    if (state.active && state.active.r === cell.r && state.active.c === cell.c) {
      state.focusDir = state.focusDir === 'A' ? 'D' : 'A';
    }
    state.active = cell;
    state.focusPositions = engine.wordAtCell(cell.r, cell.c, state.focusDir);
    render();
  });

  window.addEventListener('keydown', (e) => {
    if (!state.active) return;
    if (e.key === 'Tab') { e.preventDefault(); state.focusDir = state.focusDir === 'A' ? 'D' : 'A'; state.focusPositions = engine.wordAtCell(state.active.r, state.active.c, state.focusDir); render(); return; }
    if (e.key === 'Backspace') { e.preventDefault(); const k = `${state.active.r},${state.active.c}`; delete state.fill[k]; render(); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); const n = nextCellInFocus(1); if (n) { state.active = n; render(); } return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); const n = nextCellInFocus(-1); if (n) { state.active = n; render(); } return; }
    if (/^[a-zA-Z0-9]$/.test(e.key)) { handleCharInput(e.key.toUpperCase()); }
  });

  newGameBtn.addEventListener('click', newGame);
  themeToggle.addEventListener('click', () => {
    const light = document.body.classList.toggle('light');
    themeToggle.setAttribute('aria-pressed', String(light));
    themeToggle.textContent = light ? '🌞' : '🌙';
  });
  checkBtn.addEventListener('click', () => checkCompletion());
  revealLetterBtn.addEventListener('click', () => {
    if (!state.active) return;
    const k = `${state.active.r},${state.active.c}`;
    state.fill[k] = engine.grid[state.active.r][state.active.c].ch;
    state.score = Math.max(0, state.score - 10);
    render();
  });
  revealWordBtn.addEventListener('click', () => {
    if (!state.focusPositions.length) return;
    for (const p of state.focusPositions) {
      const k = `${p.r},${p.c}`;
      state.fill[k] = engine.grid[p.r][p.c].ch;
    }
    state.score = Math.max(0, state.score - 30);
    render();
    checkCompletion();
  });

  const tabs = Array.from(document.querySelectorAll('.tab'));
  const tabPanels = {
    jogo: document.getElementById('tab-jogo'),
    estatisticas: document.getElementById('tab-estatisticas'),
    perfil: document.getElementById('tab-perfil'),
    editor: document.getElementById('tab-editor'),
  };
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Object.values(tabPanels).forEach(p => p.hidden = true);
      tabPanels[btn.dataset.tab].hidden = false;
      const editorPanel = document.getElementById('editor');
      if (btn.dataset.tab === 'editor') { editorPanel.hidden = false; } else { editorPanel.hidden = true; }
    });
  });

  const editorPanel = {
    panel: document.getElementById('editor'),
    input: document.getElementById('editorInput'),
    loadBtn: document.getElementById('loadEditorData'),
  };
  editorPanel.loadBtn.addEventListener('click', () => {
    const lines = editorPanel.input.value.split(/\n+/).map(l => l.trim()).filter(Boolean);
    const custom = lines.map(l => {
      const [a, b] = l.split(';');
      return { answer: (a || '').toUpperCase(), clue: b || 'Sem definição.' };
    }).filter(x => x.answer.length >= 3);
    if (custom.length < 2) { alert('Adicione pelo menos 2 termos válidos.'); return; }
    engine.reset(13, 13);
    engine.generate(custom);
    state.entries = custom;
    state.fill = {}; state.active = null; state.focusPositions = [];
    state.total = engine.words.reduce((sum, w) => sum + w.answer.length, 0);
    buildClueLists();
    render();
    startTimer();
  });

  (function initStats() {
    const stats = JSON.parse(localStorage.getItem('pcm_stats') || '{}');
    document.getElementById('stat-games').textContent = stats.games || 0;
    document.getElementById('stat-streak').textContent = stats.streak || 0;
    document.getElementById('stat-best-time').textContent = stats.bestTime ? formatTime(stats.bestTime) : '—';
  })();

  newGame();
})();

