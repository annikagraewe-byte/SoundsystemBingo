/* ============================================================
   PLAYLIST-DATEN — HIER ANPASSEN
   ============================================================
   Ein Eintrag pro Track, in der Reihenfolge, in der die Songs
   gespielt werden. "position" muss fortlaufend und eindeutig sein.

   Tipp: Wenn du die Liste aus Excel/CSV hast, kopiere die drei
   Spalten (Titel, Interpret, Gast) einfach spaltenweise hier rein.
   ============================================================ */

const TRACKS = [
  { position: 1,  title: "Nordisch by Nature, Pt. 1",   artist: "Fettes Brot, Gaze Matratze, Der Tobi & Das Bo", guest: "Steffi & Helge" },
  { position: 2,  title: "ミラクルショッピング〜恋に落ちて〜", artist: "RSP",                                          guest: "Mila & Julian" },
  { position: 3,  title: "I Hate Doing Laundry",         artist: "Psychostick",                                   guest: "Marco" },
  { position: 4,  title: "Sounds Like a Melody",         artist: "Alphaville",                                    guest: "Julia" },
  { position: 5,  title: "Where Is My Mind (Live)",      artist: "Maxence Cyrin",                                 guest: "Annika" },
  { position: 6,  title: "Attack of the Killer Tomatoes Theme", artist: "Mr Dooves",                              guest: "Björn & Annett" },
  { position: 7,  title: "Sozusagen grundlos vergnügt",  artist: "Dota Kehr",                                     guest: "Annabelle" },
  { position: 8,  title: "Part of the Machine",          artist: "Die Krupps",                                    guest: "Alex & Maw" },
  { position: 9,  title: "Blank Space",                  artist: "Taylor Swift",                                  guest: "Geno" },
  { position: 10, title: "Nabucco / Act III: Va, pensiero", artist: "Giuseppe Verdi",                             guest: "Simona" },
  { position: 11, title: "Experience",                   artist: "Ludovico Einaudi",                              guest: "LJ" },
  { position: 12, title: "You're Welcome",                artist: "Dwayne Johnson, Disney",                       guest: "Sabrina & Marvin" },
  { position: 13, title: "Pump It",                       artist: "Electric Callboy",                             guest: "Erika" },
  { position: 14, title: "Bonanza (Main Theme)",          artist: "David Rose",                                   guest: "Matthes" },
  { position: 15, title: "Ich war noch niemals in New York", artist: "Udo Jürgens",                               guest: "Manuela" },
  { position: 16, title: "We Didn't Start the Fire",      artist: "Hildegard von Blingin'",                       guest: "Jan" },
  { position: 17, title: "Christmas Truce",               artist: "Sabaton",                                      guest: "Alec" },
  { position: 18, title: "Wenn Inge tanzt",               artist: "SYSTEMFEHLER",                                 guest: "Anne" },
  { position: 19, title: "GoT Theme",                     artist: "Ramin Djawadi",                                guest: "Ben" },
  { position: 20, title: "Far Over the Misty Mountains Cold", artist: "Clamavi De Profundis",                     guest: "Erik" },
  { position: 21, title: "Wat mutt, dat mutt",            artist: "Godewind",                                     guest: "Manfred" }
];

/* Anzahl der Bingokarten, die für den Druck erzeugt werden */
const BINGO_CARD_COUNT = 45;

/* Kartengröße (n x n). Bei 21 Tracks stehen max. ca. 29-42 eindeutige
   Werte zur Verfügung (Songs + eindeutige Gästenamen). 5 ergibt 25 Felder. */
const BINGO_GRID_SIZE = 5;

/* Freifeld in der Kartenmitte an/aus */
const BINGO_FREE_CENTER = true;
