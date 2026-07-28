/* ============================================================
   APPLAUS-SOUND
   Spielt die mitgelieferte Audiodatei "applause.mp3" ab.
   ============================================================ */

const APPLAUSE_SRC = 'applause.mp3';

function playApplause(){
  try{
    const audio = new Audio(APPLAUSE_SRC);
    audio.volume = 0.9;
    audio.play().catch(() => {
      /* Browser hat Autoplay ohne Nutzer-Geste blockiert - unkritisch,
         der nächste Drag&Drop-Vorgang zählt bereits als Geste. */
    });
  }catch(e){
    console.warn('Applaus-Sound konnte nicht abgespielt werden', e);
  }
}

/* Dauerhafter Applaus für die Abschluss-Feier (Spiel komplett gelöst) */
let loopAudio = null;

function playApplauseLoop(){
  try{
    if(!loopAudio){
      loopAudio = new Audio(APPLAUSE_SRC);
      loopAudio.loop = true;
      loopAudio.volume = 0.85;
    }
    loopAudio.currentTime = 0;
    loopAudio.play().catch(() => {});
  }catch(e){
    console.warn('Dauer-Applaus konnte nicht gestartet werden', e);
  }
}

function stopApplauseLoop(){
  if(loopAudio){
    loopAudio.pause();
    loopAudio.currentTime = 0;
  }
}
