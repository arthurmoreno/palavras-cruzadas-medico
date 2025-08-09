/*
  Crossword engine (grid + placement + rendering)
  - Simple greedy placement to generate a compact grid from a small word set
  - Renders on HTML Canvas and exposes input hit-testing utilities
*/

class CrosswordEngine {
  constructor({ rows = 15, cols = 15, cell = 32 } = {}) {
    this.rows = rows;
    this.cols = cols;
    this.cell = cell; // px
    this.grid = this.createGrid(rows, cols);
    this.words = []; // { answer, clue, positions: [{r,c}], dir: 'A'|'D', number }
    this.numbers = []; // cell numbering map
  }

  createGrid(r, c) {
    return Array.from({ length: r }, () => Array.from({ length: c }, () => ({ ch: null, block: false })));
  }

  reset(rows = this.rows, cols = this.cols) {
    this.rows = rows; this.cols = cols;
    this.grid = this.createGrid(rows, cols);
    this.words = [];
    this.numbers = [];
  }

  // Attempt to place words with simple crossing priority
  generate(wordEntries) {
    // Sort by length desc to seed with longer words
    const entries = wordEntries.map(w => ({ ...w, answer: normalizeAnswer(w.answer) }))
      .sort((a, b) => b.answer.length - a.answer.length);

    const centerR = Math.floor(this.rows / 2);
    const centerC = Math.floor(this.cols / 2);

    const canPlace = (answer, r, c, dir) => {
      if (dir === 'A') {
        if (c + answer.length > this.cols) return false;
        for (let i = 0; i < answer.length; i++) {
          const cell = this.grid[r][c + i];
          if (cell.block) return false;
          if (cell.ch && cell.ch !== answer[i]) return false;
        }
        return true;
      } else {
        if (r + answer.length > this.rows) return false;
        for (let i = 0; i < answer.length; i++) {
          const cell = this.grid[r + i][c];
          if (cell.block) return false;
          if (cell.ch && cell.ch !== answer[i]) return false;
        }
        return true;
      }
    };

    const place = (entry, r, c, dir) => {
      const positions = [];
      const answer = entry.answer;
      if (dir === 'A') {
        for (let i = 0; i < answer.length; i++) {
          const cell = this.grid[r][c + i];
          cell.ch = answer[i];
          positions.push({ r, c: c + i });
        }
      } else {
        for (let i = 0; i < answer.length; i++) {
          const cell = this.grid[r + i][c];
          cell.ch = answer[i];
          positions.push({ r: r + i, c });
        }
      }
      this.words.push({ ...entry, positions, dir, number: 0 });
    };

    const placeSeed = entries.shift();
    // Place seed horizontally centered
    const startC = Math.max(0, centerC - Math.floor(placeSeed.answer.length / 2));
    place(placeSeed, centerR, startC, 'A');

    for (const entry of entries) {
      const answer = entry.answer;
      let placed = false;
      // Try to cross with existing letters
      for (let w of this.words) {
        for (let i = 0; i < w.positions.length; i++) {
          const { r, c } = w.positions[i];
          const letter = w.answer[i];
          for (let j = 0; j < answer.length; j++) {
            if (answer[j] !== letter) continue;
            // propose intersection
            if (w.dir === 'A') {
              const pr = r - j; const pc = c;
              if (canPlace(answer, pr, pc, 'D')) { place(entry, pr, pc, 'D'); placed = true; break; }
            } else {
              const pr = r; const pc = c - j;
              if (canPlace(answer, pr, pc, 'A')) { place(entry, pr, pc, 'A'); placed = true; break; }
            }
          }
          if (placed) break;
        }
        if (placed) break;
      }
      // Fallback: brute force scan
      if (!placed) {
        for (let r = 0; r < this.rows && !placed; r++) {
          for (let c = 0; c < this.cols && !placed; c++) {
            if (canPlace(answer, r, c, 'A')) { place(entry, r, c, 'A'); placed = true; break; }
            if (canPlace(answer, r, c, 'D')) { place(entry, r, c, 'D'); placed = true; break; }
          }
        }
      }
    }

    this.numberWords();
  }

  numberWords() {
    let num = 1;
    const numbers = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    for (const w of this.words) {
      const start = w.positions[0];
      if (numbers[start.r][start.c] === 0) {
        numbers[start.r][start.c] = num++;
      }
      w.number = numbers[start.r][start.c];
    }
    this.numbers = numbers;
  }

  // Rendering
  render(ctx, state = {}) {
    const { cell } = this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.scale(Math.min(ctx.canvas.width / (this.cols * cell), ctx.canvas.height / (this.rows * cell)),
              Math.min(ctx.canvas.width / (this.cols * cell), ctx.canvas.height / (this.rows * cell)));

    // background
    ctx.fillStyle = '#0c1017';
    ctx.fillRect(0, 0, this.cols * cell, this.rows * cell);

    // draw cells
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = c * cell; const y = r * cell;
        // highlight selection
        const isActive = state.active && state.active.r === r && state.active.c === c;
        const inFocusWord = state.focus && state.focus.some(p => p.r === r && p.c === c);
        ctx.fillStyle = isActive ? '#1e293b' : inFocusWord ? '#162032' : '#0c1017';
        ctx.fillRect(x, y, cell, cell);

        ctx.strokeStyle = '#1f2837';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);

        const ch = this.grid[r][c].ch;
        if (ch) {
          // letter
          const userCh = state.fill?.[`${r},${c}`];
          ctx.fillStyle = userCh ? '#e6e8eb' : '#9aa4af';
          ctx.font = `${Math.floor(cell * 0.55)}px Inter, sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(userCh || '', x + cell / 2, y + cell / 2 + 1);

          // number
          const n = this.numbers[r][c];
          if (n) {
            ctx.fillStyle = '#9aa4af';
            ctx.font = `${Math.floor(cell * 0.28)}px Inter, sans-serif`;
            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText(String(n), x + 3, y + 3);
          }
        } else {
          // block cell
          // leave as background for now
        }
      }
    }
    ctx.restore();
  }

  // Hit test: returns {r,c}
  cellAt(x, y, canvas) {
    const rect = canvas.getBoundingClientRect();
    const sx = (x - rect.left) * (canvas.width / rect.width);
    const sy = (y - rect.top) * (canvas.height / rect.height);
    const scale = Math.min(canvas.width / (this.cols * this.cell), canvas.height / (this.rows * this.cell));
    const gx = sx / scale; const gy = sy / scale;
    const c = Math.floor(gx / this.cell);
    const r = Math.floor(gy / this.cell);
    if (r < 0 || c < 0 || r >= this.rows || c >= this.cols) return null;
    if (!this.grid[r][c].ch) return null; // only allow selecting valid cells
    return { r, c };
  }

  wordAtCell(r, c, dir) {
    // collect contiguous positions along dir passing through (r,c)
    const positions = [];
    if (dir === 'A') {
      let cc = c; while (cc >= 0 && this.grid[r][cc].ch) cc--; cc++;
      while (cc < this.cols && this.grid[r][cc].ch) { positions.push({ r, c: cc }); cc++; }
    } else {
      let rr = r; while (rr >= 0 && this.grid[rr][c].ch) rr--; rr++;
      while (rr < this.rows && this.grid[rr][c].ch) { positions.push({ r: rr, c }); rr++; }
    }
    return positions;
  }
}

window.CrosswordEngine = CrosswordEngine;

