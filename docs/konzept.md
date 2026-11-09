# Atem – Konzept

**Vision:** Jeden Tag ein paar Minuten, die dich wie ein Stoiker durch den Tag führen: kurz hinspüren, ehrlich reflektieren, dann richtig atmen. Mobil zuerst, ruhig, minimal wie Apple, bildstark wie Pinterest. Die Atemanweisung spürst du auf Wunsch nur als Vibration in der Hand oder Hosentasche – wie „Atmen“ auf der Apple Watch.

## Zwei Schritte

1. **Check-in „Wie geht's dir?“** – hinspüren und reflektieren, achtsamer werden.
2. **Atmen** – die passende Übung aus einer großen Bibliothek (Gefühl, Körper, Ziel, Situation).

## Was andere Apps besonders machen (und was wir übernehmen)

| App | Besonderheit | Absicht | Bei uns |
|---|---|---|---|
| Apple Health „Gemütszustand“ | Regler unangenehm ↔ angenehm, dann Wörter, dann „Was beeinflusst dich?“ | in 30 s erfassbar, Muster über Wochen | Schritt 1 (Stimmung) und 5 (Einflüsse) |
| How We Feel / Mood Meter (Yale) | Energie × Angenehm = 4 Felder, dann ein **präzises Gefühlswort** | „Affect Labeling“: Gefühle benennen senkt ihre Wucht (Lieberman 2007) | Schritt 2 (Energie) und 3 (Wort aus dem Feld) |
| Daylio | Antippen statt Schreiben, Aktivitäten | Hürde fast null, trotzdem Daten | große Kacheln, Schreiben nur optional |
| Stoic. | Morgen vorbereiten, Abend prüfen, wechselnde Fragen | Haltung trainieren, nicht nur Gefühle notieren | Schritt 6 + 7: „Liegt das in deiner Hand?“ (Epiktet) und Fragen je Tageszeit (aus Notara `stoic.ts`) |
| Headspace / Calm | Nach dem Check-in eine passende Übung | vom Gefühl direkt zur Handlung | Empfehlung mit Begründung |
| Breathwrk / Othership | Übungen nach Ziel (ruhig, Schlaf, Energie, Fokus), Programme | schnell das Richtige finden | Kategorien, Programme mit Blöcken |
| Apple Watch „Atmen“ | Haptik führt den Atem | ohne Hinsehen und ohne Ton | Vibrationssprache (`src/lib/haptics.ts`) |
| Finch / Bearable | Vorher-nachher, Muster | Fortschritt sichtbar machen | „Wie fühlst du dich jetzt?“ + Rückblick |

## Check-in: Ablauf statt Chat

**Entscheidung: kein Chat, sondern ein Ablauf (eine Frage pro Bildschirm).** Ein Chat verlangt Tippen und Formulieren – genau das, was gestressten Menschen schwerfällt. Kacheln sind schneller, ruhiger und liefern saubere Daten für die Empfehlung. Sprechen ist trotzdem möglich: Fragen vorlesen lassen (Lautsprecher oben) und freie Antworten diktieren (Mikrofon). Ein KI-Gespräch kann später als Option dazukommen (wie Nova in Notara), ohne den Ablauf zu ersetzen.

1. Wie geht's dir gerade? (5 Stufen, Gesichter)
2. Wie viel Energie hast du? → Feld: angespannt · schwer · lebendig · ruhig
3. Welches Wort passt am besten? (bis 3, aus dem Feld)
4. Was spürst du im Körper? (Herzrasen, Enge, Nacken … → Symptome)
5. Was beeinflusst dich gerade? (Arbeit, Beziehung, Schlaf …)
6. Liegt das in deiner Hand? (ja · teilweise · nein, mit stoischem Satz)
7. 1–3 Reflexionsfragen je Tageszeit (Länge einstellbar), greifen Vorsatz vom Morgen bzw. Lehre von gestern auf
8. Empfehlung: die beste Übung groß, zwei Alternativen, mit Begründung („Gegen Herzrasen: …“)
9. Nach der Übung: Wie fühlst du dich jetzt? → vorher/nachher im Rückblick

Sehr schlechte Stimmung → Hinweis TelefonSeelsorge, keine anstrengenden Übungen.

## Bibliothek

`src/data/exercises.ts`: über 45 Übungen, jede mit Rhythmus (Blöcke aus Phasen), Kategorie, Niveau, Schlagwörtern, Warum, So geht's, Vorsicht, gesprochener Einleitung und Bild (Verlauf + Motiv, später echte Fotos über `image`). Suche über Namen und Synonyme („Herzklopfen“ → Herzrasen, „Klausur“ → Prüfung). Neue Übung = ein Eintrag in der Liste; Tests prüfen Schlagwörter und Zeiten.

## Vibration und Mobile

- **Capacitor** (wie Notara) macht aus der Web-App iOS- und Android-Apps. Die Web-App liegt in der App (offline), für Live-Reload `ATEM_URL=http://<ip>:5173`.
- **@capacitor/haptics** spricht die Taptic Engine an (iPhone) – im Browser geht nur Android (`navigator.vibrate`), Safari kann nicht vibrieren.
- **Vibrationssprache:** Einatmen = Klopfen wird schneller und kräftiger · Halten = weicher Doppel-Tipper · Ausatmen = wird langsamer und leiser · Nachatmen = zwei kräftige Tipper · Ende = drei Schläge. In Einstellungen → Vibration zum Ausprobieren.
- **Nur Vibration:** schaltet Stimme, Klangschale, Musik ab.
- Später: Apple-Watch-Begleiter, Widgets, Erinnerungen (Local Notifications), Core Haptics mit eigenen Mustern (AHAP) für noch feinere Kurven.

## Navigation

Heute · Entdecken · **Check-in** (Mitte) · Rückblick · Profil. Heute zeigt Check-in, was du heute geschafft hast (Minuten, Übungen, Serie), Empfehlungen, Favoriten und die Woche.

## Design

1:1 Notara/Finastry (`tokens.css`, `app.css`, `theme.css` unverändert), eigene Farben in `brand.css`: Lila `#6d4aff`, sonst Grau, Schwarz, Weiß. Hell und Dunkel (Standard: wie das Gerät). Große Knöpfe (48–56 px), große Flächen (Radius 22–28), große Titel (34 px).
