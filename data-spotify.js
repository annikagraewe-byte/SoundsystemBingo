/* ============================================================
   PLAYLIST-DATEN (Spotify-Version) — HIER ANPASSEN
   ============================================================
   Wie data.js, aber mit zusätzlichem Feld "spotifyUri" pro Track,
   damit das Spiel den Song direkt per Spotify-API starten kann.

   Die URI findest du im Spotify-Client per Rechtsklick auf den
   Song → "Teilen" → "Spotify-URI kopieren" (Format: spotify:track:...)
   ============================================================ */

const TRACKS = [
  { position: 1,  title: "Nordisch by Nature, Pt. 1",   artist: "Fettes Brot, Gaze Matratze, Der Tobi & Das Bo", guest: "Steffi & Helge",     spotifyUri: "spotify:track:5OnLMCTsS4ODMrS9zbT46N" },
  { position: 2,  title: "ミラクルショッピング〜恋に落ちて〜", artist: "RSP",                                          guest: "Mila & Julian",      spotifyUri: "spotify:track:5tjXynH15QVldIvi0tQTrV" },
  { position: 3,  title: "I Hate Doing Laundry",         artist: "Psychostick",                                   guest: "Marco",              spotifyUri: "spotify:track:5ez88cJkhsh5aFzpKDmmmh" },
  { position: 4,  title: "Sounds Like a Melody",         artist: "Alphaville",                                    guest: "Julia",              spotifyUri: "spotify:track:2untDmHP8Wib6U5yzj4r65" },
  { position: 5,  title: "Where Is My Mind (Live)",      artist: "Maxence Cyrin",                                 guest: "Annika",             spotifyUri: "spotify:track:6LZJ8JtrrbfU1QOM6HMt6K" },
  { position: 6,  title: "Attack of the Killer Tomatoes Theme", artist: "Mr Dooves",                              guest: "Björn & Annett",     spotifyUri: "spotify:track:58cxXzh2Sjot6r35heLqw7" },
  { position: 7,  title: "Sozusagen grundlos vergnügt",  artist: "Dota Kehr",                                     guest: "Anabelle",           spotifyUri: "spotify:track:0339RlKhfnSB99avGZ41BM" },
  { position: 8,  title: "Part of the Machine",          artist: "Die Krupps",                                    guest: "Alex & Maw",         spotifyUri: "spotify:track:2VdkfCckwG3tNSPIUVHvjK" },
  { position: 9,  title: "Blank Space",                  artist: "Taylor Swift",                                  guest: "Geno",               spotifyUri: "spotify:track:1u8c2t2Cy7UBoG4ArRcF5g" },
  { position: 10, title: "Nabucco / Act III: Va, pensiero", artist: "Giuseppe Verdi",                             guest: "Simona",             spotifyUri: "spotify:track:25bJp5TJJJsJ9GXf5F2VXL" },
  { position: 11, title: "Experience",                   artist: "Ludovico Einaudi",                              guest: "LJ",                 spotifyUri: "spotify:track:1BncfTJAWxrsxyT9culBrj" },
  { position: 12, title: "You're Welcome",                artist: "Dwayne Johnson, Disney",                       guest: "Sabrina & Marvin",   spotifyUri: "spotify:track:4WtRm2GLSYdqfQlsoQtzjC" },
  { position: 13, title: "Pump It",                       artist: "Electric Callboy",                             guest: "Erika",              spotifyUri: "spotify:track:6emZMVNvIxW57fhxPlyxLp" },
  { position: 14, title: "Bonanza (Main Theme)",          artist: "David Rose",                                   guest: "Matthes",            spotifyUri: "spotify:track:03QtGx8rUO29QCHjuyVPbh" },
  { position: 15, title: "Ich war noch niemals in New York", artist: "Udo Jürgens",                               guest: "Manuela",            spotifyUri: "spotify:track:2StGDUBd9Cvr4gcuygSiEO" },
  { position: 16, title: "We Didn't Start the Fire",      artist: "Hildegard von Blingin'",                       guest: "Jan",                spotifyUri: "spotify:track:7oAgvVwMu668VMo088zLkp" },
  { position: 17, title: "Christmas Truce",               artist: "Sabaton",                                      guest: "Alec",               spotifyUri: "spotify:track:7m2ZeXTKhW8e4MYEIYh2pT" },
  { position: 18, title: "Wenn Inge tanzt",               artist: "SYSTEMFEHLER",                                 guest: "Anne",               spotifyUri: "spotify:track:3lnIxfJI3hzy9FOziOUKH6" },
  { position: 19, title: "GoT Theme",                     artist: "Ramin Djawadi",                                guest: "Ben",                spotifyUri: "spotify:track:2q6fxAvSpqXR4jx9Ne7RGz" },
  { position: 20, title: "Far Over the Misty Mountains Cold", artist: "Clamavi De Profundis",                     guest: "Erik",               spotifyUri: "spotify:track:7oYTWS0BEJcddgKZBkiSJq" },
  { position: 21, title: "Wat mutt, dat mutt",            artist: "Godewind",                                     guest: "Manfred",            spotifyUri: "spotify:track:4pl809EvB29eO2iUGOfqNd" }
];

/* Anzahl der Bingokarten, die für den Druck erzeugt werden */
const BINGO_CARD_COUNT = 45;

/* Kartengröße (n x n). */
const BINGO_GRID_SIZE = 5;

/* Freifeld in der Kartenmitte an/aus */
const BINGO_FREE_CENTER = true;
