import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native App (iOS und Android) über Capacitor – wie Notara, aber die Web-App liegt IN der App (`dist`), damit
 * Atemübungen auch offline laufen. Für schnelles Entwickeln am Handy: `ATEM_URL=http://<rechner-ip>:5173 npx cap sync`
 * lädt stattdessen den Vite-Server (Live-Reload). Vibration über @capacitor/haptics (Taptic Engine am iPhone).
 */
const url = process.env.ATEM_URL;

const config: CapacitorConfig = {
  appId: "de.dekoire.atem",
  appName: "Atem",
  webDir: "dist",
  backgroundColor: "#121214",
  ...(url ? { server: { url, cleartext: url.startsWith("http://") } } : {}),
  ios: { contentInset: "never", backgroundColor: "#121214" },
  android: { backgroundColor: "#121214" },
};

export default config;
