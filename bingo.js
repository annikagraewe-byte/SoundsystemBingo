/* ============================================================
   BINGOKARTEN-GENERATOR (Druckansicht)
   buildValuePool() und shuffleArr() kommen aus pool.js
   ============================================================ */

const BINGO_STORAGE_KEY = 'party-bingo-cards-v1';

function generateCards(){
  const pool = buildValuePool();
  const cellsNeeded = BINGO_GRID_SIZE * BINGO_GRID_SIZE - (BINGO_FREE_CENTER ? 1 : 0);

  if(pool.length < cellsNeeded){
    document.getElementById('warning').textContent =
      `Warnung: Der Werte-Pool hat nur ${pool.length} eindeutige Werte, benötigt werden ${cellsNeeded}. `+
      `Bitte BINGO_GRID_SIZE in data.js verkleinern oder mehr Tracks/Gäste ergänzen.`;
    return [];
  }

  const cards = [];
  const seenArrangements = new Set();

  for(let c = 0; c < BINGO_CARD_COUNT; c++){
    let attempt = 0, key, chosen;
    do{
      chosen = shuffleArr(pool).slice(0, cellsNeeded);
      key = chosen.map(v=>v.label).join('|');
      attempt++;
    } while(seenArrangements.has(key) && attempt < 30);
    seenArrangements.add(key);
    cards.push(chosen);
  }
  return cards;
}

function loadOrCreateCards(){
  try{
    const raw = localStorage.getItem(BINGO_STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(parsed.trackCount === TRACKS.length && parsed.cardCount === BINGO_CARD_COUNT){
        return parsed.cards;
      }
    }
  }catch(e){}
  const cards = generateCards();
  saveCards(cards);
  return cards;
}

function saveCards(cards){
  try{
    localStorage.setItem(BINGO_STORAGE_KEY, JSON.stringify({
      trackCount: TRACKS.length,
      cardCount: BINGO_CARD_COUNT,
      cards
    }));
  }catch(e){}
}

function reshuffleCards(){
  if(!confirm('Alle Bingokarten neu mischen? Bereits gedruckte Karten passen danach nicht mehr zum neuen Satz.')) return;
  localStorage.removeItem(BINGO_STORAGE_KEY);
  renderAll();
}

function renderAll(){
  const cards = loadOrCreateCards();
  const container = document.getElementById('cards');
  container.innerHTML = cards.map((cells, idx) => renderCard(cells, idx+1)).join('');
}

function renderCard(cells, cardNumber){
  const size = BINGO_GRID_SIZE;
  let cellIdx = 0;
  const centerIndex = Math.floor(size*size/2);
  let html = `<div class="card">
    <div class="card-head">
      <span>🎈 Playlist-Bingo</span>
      <span class="card-no">Karte #${cardNumber}</span>
    </div>
    <div class="grid" style="grid-template-columns: repeat(${size}, 1fr);">`;

  for(let i=0;i<size*size;i++){
    if(BINGO_FREE_CENTER && i === centerIndex){
      html += `<div class="cell free">FREI</div>`;
    } else {
      const val = cells[cellIdx++];
      html += `<div class="cell ${val.type}">${escapeHtmlBingo(val.label)}</div>`;
    }
  }
  html += `</div></div>`;
  return html;
}

function escapeHtmlBingo(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  document.getElementById('print-btn').addEventListener('click', () => window.print());
  document.getElementById('reshuffle-btn').addEventListener('click', reshuffleCards);
});
