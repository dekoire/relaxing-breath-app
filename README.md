# Atem – stoisch atmen

Jeden Tag kurz hinspüren („Wie geht's dir?“), stoisch reflektieren, dann die passende Atemübung – mit Stimme, Klangschale, Musik und Vibration. Mobile App (iOS/Android über Capacitor), Design und Aufbau wie Notara.

```bash
npm install
npm run dev          # Demo-Modus: Konto und Daten nur im Browser
npm test             # Logik: Übungen, Empfehlung, Vibration, Statistik
```

## Eigene Datenbank (Convex)

```bash
npx convex dev       # legt ein NEUES Convex-Projekt an, schreibt VITE_CONVEX_URL in .env.local
```

Danach in Convex die Variablen für den Login setzen (wie Notara): `npx @convex-dev/auth` (JWT-Schlüssel, `SITE_URL`), optional `AUTH_RESEND_KEY` für „Passwort vergessen“.

## Als App aufs Handy

```bash
npx cap add ios      # einmalig (Xcode nötig)
npx cap add android  # einmalig (Android Studio nötig)
npm run ios          # baut, kopiert, öffnet Xcode
npm run android
```

Live-Reload am Handy: `ATEM_URL=http://<deine-ip>:5173 npx cap sync`, dann `npm run dev`.

Konzept: [docs/konzept.md](docs/konzept.md)
