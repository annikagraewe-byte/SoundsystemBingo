# Pauls Soundsystem-Bingo

## Dateien
- **index.html** — das Ratespiel (läuft auf Pauls Laptop/Beamer)
- **bingo.html** — Druckansicht für 45 Bingokarten (falls du zusätzlich Papierkarten willst)
- **karte.html** — **digitale Bingokarte fürs Handy**, wird per QR-Code geteilt
- **qr-generator.html** — erzeugt aus der fertigen GitHub-Pages-URL einen QR-Code zum Ausdrucken
- **data.js** — **die einzige Datei, die du für eine neue Playlist bearbeiten musst**
- **applause.mp3** — Applaus-Sound bei richtigem Tipp
- **style.css / karte.css / app.js / karte.js / bingo.js / pool.js / audio.js** — Technik, muss nicht angefasst werden

## Digitale Bingokarte übers Handy (GitHub Pages)
Jeder Gast scannt **denselben** QR-Code und bekommt automatisch eine eigene, zufällige Karte (im Browser generiert und lokal auf dem Handy gespeichert — kein Server, kein Login).

**Deployment über GitHub Pages:**
1. Kostenlosen GitHub-Account anlegen (falls noch nicht vorhanden) → neues Repository erstellen (z. B. `party-bingo`), diesen ganzen Ordner hochladen (per Web-Upload oder `git push`).
2. Im Repo: **Settings → Pages → Source: Deploy from a branch → main / (root)** auswählen, speichern.
3. Nach ein bis zwei Minuten ist die Seite live unter `https://DEINNAME.github.io/party-bingo/`.
4. Die Karten-URL für Gäste lautet dann `https://DEINNAME.github.io/party-bingo/karte.html`.
5. Diese URL in `qr-generator.html` eintragen (lokal öffnen oder ebenfalls über GitHub Pages aufrufen) → QR-Code erzeugen, ausdrucken/anzeigen.

**Wichtig:** Bereits vorher getestet und verifiziert — OneDrive-Links rendern `.html`-Dateien in der Regel **nicht** als echte Webseite (zeigen stattdessen Rohtext oder erzwingen einen Download). GitHub Pages ist ein echter Static-Webserver und funktioniert zuverlässig.

**Verhalten der digitalen Karte:**
- Karte ist an das jeweilige Handy/den Browser gebunden (nicht an die Person) — bei geteiltem Gerät oder gelöschtem Browser-Cache geht der Bezug verloren.
- Felder werden von den Gästen **selbst** angetippt (kein automatischer Sync mit Pauls Spiel) — genau wie beim Kreuzen auf Papier.
- Bei voller Reihe/Spalte/Diagonale erscheint automatisch groß „BINGO" mit Konfetti und Applaus-Sound.
- „Meine Karte neu mischen" auf der Karte selbst setzt nur diese eine Karte zurück (mit Sicherheitsabfrage).

## Playlist anpassen
Öffne `data.js` in einem Texteditor. Trage pro Track eine Zeile ein:
```js
{ position: 1, title: "Songtitel", artist: "Interpret", guest: "Gastname" },
```
`position` muss fortlaufend (1, 2, 3, …) und eindeutig sein — das ist die Abspielreihenfolge.

Ganz unten in `data.js` kannst du außerdem einstellen:
- `BINGO_CARD_COUNT` — Anzahl gedruckter Karten (Standard: 45)
- `BINGO_GRID_SIZE` — Kartengröße, z. B. 5 für 5×5
- `BINGO_FREE_CENTER` — Freifeld in der Mitte an/aus

## Vor der Party
1. `data.js` mit der echten Playlist befüllen.
2. `bingo.html` im Browser öffnen → Karten werden automatisch erzeugt (jede Karte einzigartig).
3. Über den Button **„Drucken / Als PDF speichern“** alle 45 Karten ausdrucken (Format A5, jede Karte eine eigene Seite).
   „Neu mischen“ erzeugt einen komplett neuen Kartensatz — danach musst du erneut drucken.

## Während der Party
1. `index.html` auf Pauls Laptop öffnen (Beamer/Bildschirm für alle sichtbar).
2. Jemand spielt die Songs manuell über Spotify ab, in der Reihenfolge aus `data.js`.
3. Paul zieht Song- und Gast-Kacheln per Maus in die Felder des aktuell hervorgehobenen Tracks.
   - Richtig → Kachel wird gold-grün, Konfetti für 2 Sekunden, bleibt liegen.
   - Falsch → Kachel blinkt kurz rot und springt zurück in den Pool.
   - Sobald zu einem Track je ein Versuch für Song **und** Gast gemacht wurde, springt die Hervorhebung zum nächsten Track.
4. **„Überspringen“** springt sofort zum nächsten Track, ohne dass ein Tipp gezählt wird.
5. Nach einem vollen Durchlauf beginnt automatisch die nächste Runde — nur mit den noch nicht komplett richtig geratenen Tracks, neu gemischt.
6. Gäste kreuzen auf ihrer eigenen Bingokarte an, sobald ein Song/Interpret oder Gastname korrekt erraten wurde (unten links im Spiel steht immer „Zuletzt richtig: …“).
7. Ein Browser-Refresh ist unproblematisch — der Spielstand wird automatisch gespeichert (lokal im Browser dieses Geräts).
8. „Spiel zurücksetzen“ löscht den gespeicherten Fortschritt komplett (mit Sicherheitsabfrage).

## Hinweis zu Spotify
Die Songs werden **nicht** von der Web-App gesteuert — jemand spielt sie manuell in einer separaten Spotify-App/-Gerät ab, passend zur Reihenfolge in `data.js`.

## Technische Hinweise
- Kein Server nötig, funktioniert offline direkt aus dem Ordner (Doppelklick auf `index.html` bzw. `bingo.html`).
- Speicherung erfolgt im `localStorage` des Browsers — auf demselben Gerät/Browser bleibt der Stand erhalten, nicht geräteübergreifend synchronisiert.
- Getestet für Maus-Bedienung am Laptop (kein Touch-Support für Drag & Drop erforderlich lt. Vorgabe).
