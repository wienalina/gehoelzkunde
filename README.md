# Gehölzbestimmung — Lernplattform

Interaktive Lernseite für die Gehölzprüfung. 551 Taxa aus den Studienblättern,
der Vorlesungsliste und dem Türkenschanzpark-Führer. Mobil bedienbar, für den
Einsatz im Park gebaut.

Stand: **Phase 3** — Datenbasis, Navigation, Artenliste, Artenseiten, Bildsystem,
Fortschritt, Prüfungsmodus (Grundform), Türkenschanzpark-Platzhalter.
Merkmale, Verwechslungsgruppen und Bestimmungsschlüssel folgen in Phase 4–6.

---

## Teil 1 — Auf GitHub stellen

Du brauchst ein GitHub-Konto. Wenn du keins hast: auf github.com auf **Sign up**.

### Schritt 1 — Repository anlegen

1. Auf github.com oben rechts auf **+** → **New repository**
2. **Repository name:** `gehoelze` (oder ein anderer Name, ist egal)
3. **Public** auswählen — für kostenlose GitHub Pages nötig
4. Kein Häkchen bei „Add a README file"
5. **Create repository**

Du landest auf einer Seite mit Einrichtungsbefehlen. Die brauchst du gleich.

### Schritt 2 — Dateien hochladen

**Variante A — über die Weboberfläche** (kein Terminal nötig, aber das ZIP muss
vorher entpackt sein):

1. Auf der leeren Repository-Seite auf **uploading an existing file**
2. Den **Inhalt** des entpackten Ordners hineinziehen — also `src`, `public`,
   `package.json` usw., **nicht** den Ordner `gehoelze` selbst
3. Unten **Commit changes**

Achtung: Der Ordner `.github` wird von manchen Browsern beim Ziehen
übersprungen, weil er mit einem Punkt beginnt. Prüfe nach dem Upload, ob
`.github/workflows/deploy.yml` da ist. Falls nicht → siehe Schritt 2c.

**Variante B — über das Terminal** (zuverlässiger):

```bash
cd gehoelze
git init
git add .
git commit -m "Erste Version"
git branch -M main
git remote add origin https://github.com/DEIN-NAME/gehoelze.git
git push -u origin main
```

`DEIN-NAME` durch deinen GitHub-Benutzernamen ersetzen.

**Schritt 2c — Workflow von Hand anlegen**, falls `.github` fehlt:

1. Im Repository auf **Add file** → **Create new file**
2. Als Dateiname exakt eintippen: `.github/workflows/deploy.yml`
   (die Schrägstriche erzeugen die Ordner automatisch)
3. Den Inhalt von `deploy.yml` aus dem ZIP hineinkopieren
4. **Commit changes**

### Schritt 3 — GitHub Pages einschalten

1. Im Repository auf **Settings** (oben rechts im Reitermenü)
2. Links in der Leiste auf **Pages**
3. Bei **Source** auf **GitHub Actions** umstellen — nicht auf „Deploy from a branch"
4. Fertig, hier gibt es nichts zu speichern

### Schritt 4 — Bauen lassen

1. Reiter **Actions** öffnen
2. Der Lauf „Website bauen und veröffentlichen" startet von selbst
   (falls nicht: Workflow links auswählen → **Run workflow**)
3. Zwei bis drei Minuten warten, bis beide Schritte ein grünes Häkchen haben

### Schritt 5 — Aufrufen

Die Adresse steht unter **Settings → Pages** ganz oben:

```
https://DEIN-NAME.github.io/gehoelze/
```

Am Handy einmal öffnen und über „Zum Home-Bildschirm hinzufügen" ablegen —
dann startet sie wie eine App, ohne Browserleiste.

Ab jetzt gilt: **jeder Push auf `main` baut die Seite automatisch neu.**

---

## Teil 2 — Eigene Bilder einpflegen

Für jede Art liegt bereits ein Ordner bereit:

```
public/images/species/acer_platanoides/
```

Die Ordner-ID ist immer `gattung_epitheton` in Kleinbuchstaben mit Unterstrich.
Der Ordnername steht auch in `gesamtkatalog.csv` in der Spalte `id`.

Hinein kommen Dateien mit genau diesen Namen:

| Datei | zeigt |
|---|---|
| `habitus.jpg` | Gesamtaufnahme — wird als Hauptbild verwendet |
| `leaf.jpg` | Blatt |
| `twig.jpg` | Zweig |
| `bud.jpg` | Knospe |
| `bark.jpg` | Rinde |
| `flower.jpg` | Blüte |
| `fruit.jpg` | Frucht |
| `cone.jpg` | Zapfen |
| `detail.jpg` | Detailaufnahme |

Kein Bild muss vorhanden sein. Fehlt eines, zeigt die Seite einen Platzhalter —
sie geht nie kaputt, und es wird nie ein fremdes Bild eingesetzt.

**Über die Weboberfläche hochladen:** im Repository zu
`public/images/species/<id>/` navigieren → **Add file** → **Upload files** →
Foto hineinziehen → **Commit changes**. Nach zwei Minuten ist es online.

**Tipp:** Fotos vorher auf etwa 1600 px verkleinern. Sonst wird das Repository
schnell sehr groß und der Seitenaufbau im Park langsam.

---

## Teil 3 — Lokal weiterarbeiten

Node.js 20 oder neuer wird gebraucht.

```bash
npm install      # einmalig
npm run dev      # Entwicklungsserver, meist http://localhost:5173
npm run build    # Produktionsversion nach dist/
```

Nach Änderungen:

```bash
git add .
git commit -m "kurz beschreiben, was geändert wurde"
git push
```

---

## Aufbau des Projekts

```
src/
  data/species.json      551 Taxa — die Datenbasis
  data/index.ts          Zugriff und Kennzahlen
  types/species.ts       Datenmodell inkl. Merkmalsfeldern mit Quellenangabe
  lib/filter.ts          Filterlogik (Umfang, Familie, Gattung, Park …)
  lib/progress.ts        Lernfortschritt und Wiederholung, nur im Browser
  lib/images.ts          Bildpfade und Vorhandenseinsprüfung
  components/            Navigation, Artenzeile, Filter, Bildraster
  components/park/       Türkenschanzpark-Karte, bewusst abgetrennt
  pages/                 Start, Arten, Artenseite, Schlüssel, Prüfung,
                         Fortschritt, Park
public/images/species/   ein Ordner je Art
```

Der Türkenschanzpark liegt in einem eigenen Zweig unter `components/park/`.
`InteractiveParkMap.tsx` ist heute ein Platzhalter und lässt sich später
austauschen, ohne dass der übrige Code davon berührt wird.

### Das Datenmodell

Jedes Merkmal trägt in `types/species.ts` eine Quellenangabe mit Seitenzahl:

```ts
type Feld = {
  text: string
  quelle: 'skript' | 'zusammenfassung' | 'vorlesungsliste' | 'parkfuehrer'
  seite?: number
}
```

Damit ist der Grundsatz „nichts erfinden" nicht nur ein Vorsatz, sondern in der
Struktur verankert: Ohne Quelle gibt es kein Merkmal, und die Oberfläche zeigt
an der Stelle den Hinweis, dass nichts gefunden wurde.

### Kennzeichnungen in der Oberfläche

| Zeichen | Bedeutung |
|---|---|
| ★ | heimisch laut Vorlesungsliste |
| ⚠ | Name stammt allein aus der Texterkennung, noch nicht gegengeprüft |
| grüner Punkt | in allen drei Quellen belegt |
| gelber Punkt | in zwei Quellen |
| oranger Punkt | nur in einer Quelle |
| roter Punkt | in keiner Quelle — standardmäßig ausgeblendet |
| Farbschiene links | blaugrau = Nadelgehölz, moosgrün = Laubgehölz |

---

## Was als Nächstes kommt

- **Phase 4** — Merkmale seitengenau aus den Studienblättern übernehmen
  (Vork. / Habitus / Stamm / Blatt bzw. Nadeln / Blüte / Frucht / Ansp. / Verw. / Sonst.)
- **Phase 5** — Verwechslungsgruppen, aufgebaut auf den Stellen, an denen die
  Quellen eine Verwechslung ausdrücklich benennen
- **Phase 6** — Bestimmungsschlüssel nach dem Wenn-Dann-Prinzip
- **Phase 10** — Türkenschanzpark: Standorte Blatt für Blatt übertragen, danach
  die Karte

## Quellen

- Studienblätter zur VX Gehölzkunde (164 Seiten)
- Alle notwendigen Gehölze 2021S, Zusammenfassung mit Bildern
- Gehölzkundeführer Türkenschanzpark und Umgebung 2022S, BOKU Wien
- Prüfungs-Artenliste (204 Einträge)

Die Zeichnungen aus den Studienblättern sind urheberrechtlich geschützt und
deshalb nicht Teil dieses Projekts.
