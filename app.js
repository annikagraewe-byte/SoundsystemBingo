/* ============================================================
   SPIELLOGIK — Ratespiel
   ============================================================ */

const STORAGE_KEY = 'party-bingo-game-state-v1';

let state = null;

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function freshTrackState(){
  return TRACKS.map(t => ({
    position: t.position,
    songCorrect: false,
    guestCorrect: false
  }));
}

function computeOpenPositions(){
  // Tracks that still need at least one correct guess, in original order
  return state.tracks
    .filter(t => !t.songCorrect || !t.guestCorrect)
    .map(t => t.position);
}

function startNewRound(){
  state.round += 1;
  state.order = computeOpenPositions();
  state.orderIndex = 0;

  // Reshuffle remaining pools
  state.songPool = shuffle(state.tracks.filter(t=>!t.songCorrect).map(t=>t.position));
  state.guestPool = shuffle(state.tracks.filter(t=>!t.guestCorrect).map(t=>t.position));

  if(state.order.length === 0){
    state.finished = true;
  } else {
    setupCurrentPending();
  }
}

function setupCurrentPending(){
  const pos = state.order[state.orderIndex];
  const t = getTrack(pos);
  state.currentPending = {
    song: !t.songCorrect,
    guest: !t.guestCorrect
  };
}

function getTrack(position){
  return state.tracks.find(t => t.position === position);
}
function getTrackData(position){
  return TRACKS.find(t => t.position === position);
}

function initState(){
  const saved = loadState();
  if(saved && saved.trackCount === TRACKS.length){
    state = saved;
    return;
  }
  state = {
    trackCount: TRACKS.length,
    round: 0,
    tracks: freshTrackState(),
    order: [],
    orderIndex: 0,
    currentPending: {song:false, guest:false},
    songPool: [],
    guestPool: [],
    finished: false,
    lastEvent: null
  };
  startNewRound();
  saveState();
}

function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch(e){ console.warn('Speichern fehlgeschlagen', e); }
}
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}

function resetGame(){
  if(!confirm('Spielstand wirklich zurücksetzen? Das kann nicht rückgängig gemacht werden.')) return;
  localStorage.removeItem(STORAGE_KEY);
  initState();
  render();
}

/* ---------- Gameplay actions ---------- */

function currentTrackPosition(){
  if(state.finished) return null;
  return state.order[state.orderIndex];
}

function advanceIfDone(){
  if(!state.currentPending.song && !state.currentPending.guest){
    state.orderIndex += 1;
    if(state.orderIndex >= state.order.length){
      startNewRound();
    } else {
      setupCurrentPending();
    }
  }
}

function valuesMatch(kind, tilePosition, slotPosition){
  const tileData = getTrackData(tilePosition);
  const slotData = getTrackData(slotPosition);
  if(kind === 'song'){
    return tileData.title === slotData.title && tileData.artist === slotData.artist;
  }
  return tileData.guest === slotData.guest;
}

function handleDrop(kind, tilePosition, slotTrackPosition){
  const curPos = currentTrackPosition();
  if(curPos === null || slotTrackPosition !== curPos) return; // inactive slot
  if(kind === 'song' && !state.currentPending.song) return;
  if(kind === 'guest' && !state.currentPending.guest) return;

  const correct = valuesMatch(kind, tilePosition, slotTrackPosition);
  const track = getTrack(slotTrackPosition);

  if(correct){
    if(kind === 'song'){
      track.songCorrect = true;
      state.songPool = state.songPool.filter(p => p !== tilePosition);
    } else {
      track.guestCorrect = true;
      state.guestPool = state.guestPool.filter(p => p !== tilePosition);
    }
    state.lastEvent = {
      type:'correct',
      kind,
      text: kind === 'song'
        ? `${getTrackData(slotTrackPosition).title} – ${getTrackData(slotTrackPosition).artist}`
        : getTrackData(slotTrackPosition).guest
    };
    fireConfetti();
    playApplause();
  } else {
    state.lastEvent = {type:'wrong', kind};
  }

  state.currentPending[kind] = false;
  advanceIfDone();
  saveState();
  render(correct ? {flashCorrectTile: tilePosition, kind} : {flashWrongTile: tilePosition, kind});
}

function handleSkip(){
  const curPos = currentTrackPosition();
  if(curPos === null) return;
  state.currentPending.song = false;
  state.currentPending.guest = false;
  advanceIfDone();
  saveState();
  render();
}

/* ---------- Confetti ---------- */

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

function fireConfetti(){
  const fire = getConfetti();
  if(!fire) return;
  const end = Date.now() + 2000;
  const colors = ['#C9A24B', '#EFC968', '#2E5A3A', '#93AD8A'];
  (function frame(){
    fire({ particleCount: 8, angle: 60, spread: 65, origin:{x:0}, colors });
    fire({ particleCount: 8, angle: 120, spread: 65, origin:{x:1}, colors });
    if(Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* ---------- Rendering ---------- */

function render(flash){
  renderStatus();
  renderTracks(flash);
  renderPools(flash);
  renderLog();
  updateFinishCelebration();
}

function renderStatus(){
  const doneCount = state.tracks.filter(t=>t.songCorrect && t.guestCorrect).length;
  document.getElementById('round-label').textContent = state.finished ? '–' : state.round;
  document.getElementById('progress-label').textContent = `${doneCount}/${TRACKS.length}`;
}

function slotContent(kind, track, trackData, isActive){
  if(kind === 'song' ? track.songCorrect : track.guestCorrect){
    const label = kind === 'song' ? `${trackData.title} – ${trackData.artist}` : trackData.guest;
    return `<div class="tile ${kind} correct placed">${escapeHtml(label)}</div>`;
  }
  return '';
}

function renderTracks(flash){
  const el = document.getElementById('tracks');
  const curPos = currentTrackPosition();
  el.innerHTML = TRACKS.map(td => {
    const track = getTrack(td.position);
    const isCurrent = td.position === curPos;
    const isDone = track.songCorrect && track.guestCorrect;
    const songActive = isCurrent && state.currentPending.song;
    const guestActive = isCurrent && state.currentPending.guest;

    const songSlotInner = track.songCorrect
      ? slotContent('song', track, td)
      : '';
    const guestSlotInner = track.guestCorrect
      ? slotContent('guest', track, td)
      : '';

    return `
      <div class="track ${isCurrent ? 'current':''} ${isDone ? 'done':''}">
        <div class="num">Track ${td.position}</div>
        <div class="track-slots">
          <div class="slot ${songActive ? 'droptarget-active':''}"
               data-kind="song" data-track="${td.position}"
               ${songActive ? '' : 'data-inactive="1"'}>
            ${songSlotInner || (songActive ? 'Song hier ablegen' : (track.songCorrect ? '' : '·'))}
          </div>
          <div class="slot ${guestActive ? 'droptarget-active':''}"
               data-kind="guest" data-track="${td.position}"
               ${guestActive ? '' : 'data-inactive="1"'}>
            ${guestSlotInner || (guestActive ? 'Gast hier ablegen' : (track.guestCorrect ? '' : '·'))}
          </div>
        </div>
      </div>`;
  }).join('');

  attachSlotHandlers();
  scrollCurrentIntoView();
}

function scrollCurrentIntoView(){
  const el = document.querySelector('.track.current');
  if(el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function renderPools(flash){
  renderPool('song-pool', state.songPool, 'song', flash);
  renderPool('guest-pool', state.guestPool, 'guest', flash);
}

function renderPool(elId, positions, kind, flash){
  const el = document.getElementById(elId);
  el.innerHTML = positions.map(pos => {
    const td = getTrackData(pos);
    const label = kind === 'song' ? `${td.title} – ${td.artist}` : td.guest;
    let extraClass = '';
    if(flash && flash.kind === kind){
      if(flash.flashWrongTile === pos) extraClass = 'wrong-flash';
    }
    return `<div class="tile ${kind} ${extraClass}" draggable="true" data-kind="${kind}" data-position="${pos}">${escapeHtml(label)}</div>`;
  }).join('');
  attachTileHandlers(el);

  if(flash && flash.kind === kind && flash.flashWrongTile){
    const tileEl = el.querySelector(`.tile[data-position="${flash.flashWrongTile}"]`);
    if(tileEl){
      setTimeout(()=> tileEl.classList.remove('wrong-flash'), 550);
    }
  }
}

function renderLog(){
  const el = document.getElementById('log');
  if(!state.lastEvent){ el.innerHTML = ''; return; }
  if(state.lastEvent.type === 'correct'){
    el.innerHTML = `Zuletzt richtig: <b>${escapeHtml(state.lastEvent.text)}</b>`;
  } else {
    el.innerHTML = `Letzter Versuch war leider falsch.`;
  }
}

let finishCelebrationActive = false;
let finishConfettiTimer = null;

function updateFinishCelebration(){
  if(state.finished){
    startFinishCelebration();
  } else {
    stopFinishCelebration();
  }
}

function startFinishCelebration(){
  const overlay = document.getElementById('finish-overlay');
  if(overlay) overlay.classList.add('show');
  if(finishCelebrationActive) return;
  finishCelebrationActive = true;

  if(typeof playApplauseLoop === 'function') playApplauseLoop();

  const fire = getConfetti();
  if(fire){
    const colors = ['#C9A24B', '#EFC968', '#2E5A3A', '#93AD8A'];
    finishConfettiTimer = setInterval(() => {
      fire({
        particleCount: 8,
        angle: 90,
        spread: 45,
        startVelocity: 45,
        gravity: 0.9,
        ticks: 220,
        origin: { x: 0.14, y: 0.62 },
        colors
      });
      fire({
        particleCount: 8,
        angle: 90,
        spread: 45,
        startVelocity: 45,
        gravity: 0.9,
        ticks: 220,
        origin: { x: 0.86, y: 0.62 },
        colors
      });
    }, 160);
  }
}

function stopFinishCelebration(){
  finishCelebrationActive = false;
  const overlay = document.getElementById('finish-overlay');
  if(overlay) overlay.classList.remove('show');
  if(typeof stopApplauseLoop === 'function') stopApplauseLoop();
  if(finishConfettiTimer){
    clearInterval(finishConfettiTimer);
    finishConfettiTimer = null;
  }
}

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ---------- Drag & Drop wiring ---------- */

function attachTileHandlers(container){
  container.querySelectorAll('.tile[draggable="true"]').forEach(tile => {
    tile.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        kind: tile.dataset.kind,
        position: Number(tile.dataset.position)
      }));
      tile.classList.add('dragging');
    });
    tile.addEventListener('dragend', () => tile.classList.remove('dragging'));
  });
}

function attachSlotHandlers(){
  document.querySelectorAll('.slot').forEach(slot => {
    if(slot.dataset.inactive === '1') return;
    slot.addEventListener('dragover', e => {
      e.preventDefault();
      slot.classList.add('dragover');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('dragover'));
    slot.addEventListener('drop', e => {
      e.preventDefault();
      slot.classList.remove('dragover');
      let data;
      try{ data = JSON.parse(e.dataTransfer.getData('text/plain')); }
      catch(err){ return; }
      if(data.kind !== slot.dataset.kind) return;
      handleDrop(data.kind, data.position, Number(slot.dataset.track));
    });
  });
}

/* ---------- Init ---------- */

document.addEventListener('DOMContentLoaded', () => {
  initState();
  render();
  document.getElementById('skip-btn').addEventListener('click', handleSkip);
  document.getElementById('reset-btn').addEventListener('click', resetGame);
  document.getElementById('finish-reset-btn').addEventListener('click', resetGame);
});
