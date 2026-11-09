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
