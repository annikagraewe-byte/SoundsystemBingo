/* ============================================================
   PLAYLIST-DATEN — HIER ANPASSEN
   ============================================================
   Ein Eintrag pro Track, in der Reihenfolge, in der die Songs
   gespielt werden. "position" muss fortlaufend und eindeutig sein.

   Tipp: Wenn du die Liste aus Excel/CSV hast, kopiere die drei
   Spalten (Titel, Interpret, Gast) einfach spaltenweise hier rein.
   ============================================================ */

const TRACKS = [
  { position: 1,  title: "Nordisch by Nature",     artist: "Fettes Brot",              guest: "Steffi & Helge" },
  { position: 2,  title: "I Hate Doing Laundry",       artist: "Psychostick",         guest: "Marco" },
  { position: 3,  title: "Sounds Like a Melody",       artist: "Alpahville",         guest: "Julia" },
  { position: 4,  title: "ミラクルショッピング〜恋に落ちて〜",       artist: "RSP",         guest: "Mila & Julian" },
  { position: 5,  title: "Where is My Mind",       artist: "Maxence Cyrin",         guest: "Annika" },
  { position: 6,  title: "Sozusagen grundlos vergnügt",       artist: "Dota Kehr",         guest: "Anabelle" }
];

/* Anzahl der Bingokarten, die für den Druck erzeugt werden */
const BINGO_CARD_COUNT = 45;

/* Kartengröße (n x n). Bei 20 Tracks stehen max. ca. 28-40 eindeutige
   Werte zur Verfügung (Songs + eindeutige Gästenamen). 5 ergibt 25 Felder. */
const BINGO_GRID_SIZE = 5;

/* Freifeld in der Kartenmitte an/aus */
const BINGO_FREE_CENTER = true;
