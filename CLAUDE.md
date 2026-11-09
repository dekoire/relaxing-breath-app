# Hinweise für Claude

## Projekt

- **Atem** (Arbeitsname, nur in `src/components/Art.tsx` → `APP_NAME`): täglicher Check-in wie ein Stoiker + große Bibliothek an Atemübungen mit Stimme, Klang und Vibration. Konzept: `docs/konzept.md`.
- Stack wie Notara (`dekoire/notes-assistance`): Vite + React 19 + TypeScript, Tailwind v4, React Router 7, **Convex** + Convex Auth (Passwort). Ohne `VITE_CONVEX_URL` Demo-Modus im Browser (`LocalStoreProvider`).
- Mobil: Capacitor (`capacitor.config.ts`, Web-App in `dist`), Vibration über `@capacitor/haptics` (`src/lib/haptics.ts`).
- UI-Sprache Deutsch, „du“. Mobil zuerst.

## Design

- **1:1 Notara**: `src/styles/tokens.css`, `theme.css`, `app.css` unverändert kopiert – nicht direkt ändern. Eigene Farben und Zusätze nur in `src/styles/brand.css`.
- Farben: Lila (`brand-500` #6d4aff) nur für Hauptknöpfe, aktive Navigation, Logo, Atem-Animationen, gewählte Kacheln. Sonst Grau, Schwarz, Weiß. Stimmung als Grau → Lila (`MOOD_FLAT`), keine Ampelfarben.
- Hell und Dunkel (Standard: wie das Gerät, `atem:theme`). Die Atemübung selbst ist immer dunkel-lila.
- Große Knöpfe (h-12/h-14), große Flächen (rounded-3xl / 22–28 px), große Titel (34 px, `PageTitle`). Bausteine aus `src/components/primitives.tsx`, keine Einzel-Varianten.
- Übungsbilder: `ExerciseCard` (Pinterest-Mauerwerk, `.masonry`), Verlauf + Motiv bis es Fotos gibt (`image`).

## Regeln

- Reine Logik ohne React in `src/data/` und `src/lib/*.ts`, mit Tests (`npm test`). Neue Übung = Eintrag in `EXERCISES`, nur Schlagwörter aus `TAGS`.
- Keine Heilversprechen; Vorsicht-Hinweise bei aktivierenden Übungen; bei sehr schlechter Stimmung TelefonSeelsorge zeigen.
- Vor dem Push: `npx tsc --noEmit`, `npm test`, `npm run build`.

## Stand Nov. 2026

- **Dunkel ist Standard** (`atem:theme` leer = dunkel; Wahl Dunkel · Hell · Wie Gerät; `index.html` gleiche Regel).
- **Kacheln | Liste** (`Prefs.layout`, Schalter oben rechts in Entdecken und im Profil): Liste = `LongTile`/`ExerciseLong` in `Art.tsx` (Bild links, läuft per Maske nach rechts in die Karte aus). Kategorien haben Fotos (`categoryImage`), dazu „Gut erforscht“ (`?gut=1`).
- **Heute**: unter dem Check-in „Ich brauche jetzt Hilfe“ (direkt `/atmen/seufzer`, ohne Fragen), „Gut zu wissen“ = Artikel (`src/data/articles.ts`, Seite `/artikel/:id`).
- **Wischbare Reihen** immer mit `.hscroll` (`brand.css`): bis an den Rand, aber Anfang, Ende und Einrasten bündig mit dem Seiteninhalt (nie ganz links). Keine eigenen `-mx`/`px`-Kombinationen.
- Übung zeigt, wie gut sie erforscht ist (`EVIDENCE_LABEL`, Studie). Keine Gedankenstriche in sichtbaren Texten.
- **Texte für alle, ohne Fachwörter**: keine Wörter wie stoisch, Reflexion, Niveau, neutral, Ø oder Zahlen wie „3/5“ in der Oberfläche (Philosophie nur in Artikeln). Stimmung heißt Sehr gut · Gut · Geht so · Eher schlecht · Sehr schlecht. Sätze kurz, eine Aussage, eine klare Anweisung („Tipp alles an, was passt.“). Gleiche Sache, gleiches Wort: Übung, Check-in („Wie geht's dir?“), Atemübung.
- **Rundungen**: Knöpfe, Felder und Auswahl-Kacheln mit kurzem Text (eine bis zwei kurze Zeilen) ganz rund (`rounded-full`, Symbol links im Kreis); Karten mit viel Text oder Bild normal gerundet (22–28 px).
- **Kontrast im Dunklen**: nie Lila-Schrift auf dunkler Lila-Fläche. Kleine Akzent-Kacheln (Nummern, Symbol im Kreis) mit `.accent-chip` (`brand.css`): Fläche immer grau: dunkel helles Glas + fast weiße Schrift, hell Grau + kräftiges Lila. `--color-lavender` ist im Dunklen neutrales Glas.
- **Dranbleiben** (`src/lib/progress.ts`, `insights.ts`, `remind.ts`, getestet): Punkte (Check-in 10, je Minute 2, fertig 5, je Serien-Tag 5), Stufen (`LEVELS`), Abzeichen (`badges`, neue = Eintrag + Test), Meldung bei neuem Abzeichen (`BadgeWatcher`, beim ersten Start still gemerkt). Rückblick: „Dein Weg“ (`ProgressCard`), „So hast du dich entwickelt“ (Zeitraum gegen den davor), Stimmung 7/30 Tage, „Was mir auffällt“ (nur mit genug Daten), Abzeichen. Keine Strafe fürs Auslassen.
- **Timer** (`/timer`, `Timer.tsx`): Minuten, Gong zwischendurch, ruhiger Kreis 4 ein · 6 aus, zählt als Übung `exerciseId: "timer"`.
- **Erinnerung** (`Reminders.tsx`, Profil → Erinnerung, einmal auf Heute angeboten): morgens/abends; Handy-App über `@capacitor/local-notifications` (auch bei geschlossener App), Browser nur solange offen; nicht, wenn zu der Tageszeit schon geatmet wurde.
- **Ruhig wie Pinterest**: Seitenrand 24 px (ab md 32 px, `.hscroll` passt sich an). Vorne nur das Wichtige (Bild, Name, ein Satz, Starten); Nebensachen hinter „⋯“ (`MoreButton` in `primitives.tsx`, Blatt von unten: Starten, Favorit, Ähnliche, Teilen über `useExerciseMenu`) oder zum Aufklappen („Mehr über diese Übung“). Nie Knöpfe, Herz oder Text auf Fotos der Übungs- und Artikelseite: Bild als eigene Kachel, Zurück und „⋯“ darüber auf normalem Grund, Dauer unter dem Namen. Was man zum Atmen braucht, nie verstecken.
- **Gleiche Karten in einer Gruppe**: Listen wie „So geht's“ oder „Was mir auffällt“ über `EqualList` (`primitives.tsx`): alle so hoch wie die höchste, gleiche Rundung für alle (bis 2 Zeilen ganz rund, ab 3 Zeilen 22 px).
- **Atemübung vor dem Start** bleibt schlicht (Nutzerwunsch): Nova bzw. Blume groß im Ring, „Bereit?“, eine Zeile Rhythmus · Dauer, unten Dauer, Leiste und „Los geht's“. Keine Text-Zusammenfassung dort.
- **Demo zum Durchklicken**: `npm run build:demo` (HashRouter, Demo-Konto im Browser, Fotos als Dateien `./photos/<id>.jpg` über `VITE_LOCAL_PHOTOS`). Veröffentlicht als Artefakt https://claude.ai/artifact/DxVGDSG7MHgcvtevqPYNeo (Seite `dist-demo/atem.html` + Dateien aus `dist-demo`; Fotos vorher von Unsplash nach `dist-demo/photos` laden).
