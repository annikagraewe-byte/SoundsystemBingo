/* ============================================================
   MOBILE BINGOKARTE — Logik
   Eine Karte pro Handy-Browser, ohne Server, ohne Sync.
   ============================================================ */

const KARTE_STORAGE_KEY = 'party-bingo-mobile-card-v1';

let karteState = null; // { trackCount, size, cells:[{type,label}], marked:[bool,...] }

function buildKarteState(){
  const size = BINGO_GRID_SIZE;
  const cellsNeeded = size * size; // Handy-Karte hat KEIN Frei-Feld

  const pool = buildValuePool();
  if(pool.length < cellsNeeded){
    showWarning(
      `Der Werte-Pool hat nur ${pool.length} eindeutige Werte, benötigt werden ${cellsNeeded}. ` +
      `Bitte mehr Tracks/Gäste in data.js ergänzen oder BINGO_GRID_SIZE verkleinern.`
    );
    return null;
  }

  const cells = shuffleArr(pool).slice(0, cellsNeeded);
  return {
    trackCount: TRACKS.length,
    size,
    cells,
    marked: new Array(cellsNeeded).fill(false)
  };
}

function loadOrCreateKarte(){
  try{
    const raw = localStorage.getItem(KARTE_STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(parsed.trackCount === TRACKS.length && parsed.size === BINGO_GRID_SIZE){
        return parsed;
      }
    }
  }catch(e){}
  const fresh = buildKarteState();
  if(fresh) saveKarte(fresh);
  return fresh;
}

function saveKarte(k){
  try{ localStorage.setItem(KARTE_STORAGE_KEY, JSON.stringify(k)); }
  catch(e){ console.warn('Speichern fehlgeschlagen', e); }
}

function showWarning(msg){
  const el = document.getElementById('warning');
  el.textContent = msg;
  el.classList.add('show');
}

/* ---------- Gewinn-Prüfung ---------- */

function winningLines(size){
  const lines = [];
  for(let r = 0; r < size; r++){
    lines.push(Array.from({length:size}, (_, c) => r * size + c)); // Reihe
  }
  for(let c = 0; c < size; c++){
    lines.push(Array.from({length:size}, (_, r) => r * size + c)); // Spalte
  }
  lines.push(Array.from({length:size}, (_, i) => i * size + i));               // Diagonale ↘
  lines.push(Array.from({length:size}, (_, i) => i * size + (size - 1 - i)));  // Diagonale ↙
  return lines;
}

function checkWin(k){
  const lines = winningLines(k.size);
  for(const line of lines){
    if(line.every(idx => k.marked[idx])) return line;
  }
  return null;
}

/* ---------- Rendering ---------- */

function render(){
  const grid = document.getElementById('grid');
  if(!karteState){ grid.innerHTML = ''; return; }

  grid.style.gridTemplateColumns = `repeat(${karteState.size}, 1fr)`;

  const winLine = checkWin(karteState);
  const winSet = new Set(winLine || []);

  grid.innerHTML = karteState.cells.map((val, idx) => {
    const marked = karteState.marked[idx] ? 'marked' : '';
    const winCls = winSet.has(idx) ? 'win-line' : '';
    return `<div class="karte-cell ${val.type} ${marked} ${winCls}" data-idx="${idx}">${escapeHtmlKarte(val.label)}</div>`;
  }).join('');

  grid.querySelectorAll('.karte-cell').forEach(cell => {
    cell.addEventListener('click', () => toggleCell(Number(cell.dataset.idx)));
  });

  if(winLine){
    showBingoOverlay();
  }
}

function escapeHtmlKarte(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ---------- Interaktion ---------- */

function toggleCell(idx){
  if(!karteState) return;
  const wasWinning = !!checkWin(karteState);
  karteState.marked[idx] = !karteState.marked[idx];
  saveKarte(karteState);

  const nowWinning = !!checkWin(karteState);
  render();

  if(nowWinning && !wasWinning){
    fireConfettiKarte();
    if(typeof playApplause === 'function') playApplause();
  }
}

function showBingoOverlay(){
  document.getElementById('bingo-overlay').classList.add('show');
}
function hideBingoOverlay(){
  document.getElementById('bingo-overlay').classList.remove('show');
}

let confettiInstance = null;
let confettiCanvasEl = null;

function sizeConfettiCanvas(){
  if(!confettiCanvasEl) return;
  confettiCanvasEl.width = window.innerWidth;
  confettiCanvasEl.height = window.innerHeight;
}

function getConfetti(){
  if(confettiInstance) return confettiInstance;
  if(typeof confetti === 'function' && typeof confetti.create === 'function'){
    const canvasEl = document.getElementById('confetti-canvas');
    if(canvasEl){
      confettiCanvasEl = canvasEl;
      sizeConfettiCanvas();
      window.addEventListener('resize', sizeConfettiCanvas);
      confettiInstance = confetti.create(canvasEl, { resize: false, useWorker: true });
      return confettiInstance;
    }
  }
  return (typeof confetti === 'function') ? confetti : null;
}

function fireConfettiKarte(){
  const fire = getConfetti();
  if(!fire) return;
  const end = Date.now() + 1800;
  const colors = ['#C9A24B', '#EFC968', '#2E5A3A', '#93AD8A'];
  (function frame(){
    fire({ particleCount: 12, spread: 100, origin:{ y: 0.4 }, colors });
    if(Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* ---------- Init ---------- */

document.addEventListener('DOMContentLoaded', () => {
  karteState = loadOrCreateKarte();
  render();
  document.getElementById('bingo-overlay').addEventListener('click', hideBingoOverlay);
});
