/* ============================================================
   GETEILTE HILFSFUNKTIONEN — Werte-Pool für Bingokarten
   Wird sowohl von bingo.js (Druckansicht) als auch von
   karte.js (mobile Bingokarte) verwendet.
   ============================================================ */

function buildValuePool(){
  const songValues = TRACKS.map(t => ({
    type:'song',
    label: `${t.title} – ${t.artist}`
  }));
  const seenGuests = new Set();
  const guestValues = [];
  TRACKS.forEach(t => {
    if(!seenGuests.has(t.guest)){
      seenGuests.add(t.guest);
      guestValues.push({ type:'guest', label: t.guest });
    }
  });
  return songValues.concat(guestValues);
}

function shuffleArr(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
