/**
 * Einstellungen der Übung und des Check-ins. Auf dem Gerät gemerkt (`atem:prefs`) und – angemeldet mit Convex –
 * im Konto gespiegelt (Store ruft `onPrefsChange`). Ein Hook für alle Seiten.
 */
import { useEffect, useState } from "react";
import type { HapticLevel } from "@/lib/haptics";
import type { Track } from "@/lib/sound";
import type { Length } from "@/lib/checkin";

export type Look = "flower" | "orb";
export type Prefs = {
  /** Stimme spricht mit */
  voice: boolean;
  /** Name der Browser-/System-Stimme, leer = erste deutsche */
  voiceName: string;
  /** Fragen im Check-in vorlesen */
  readAloud: boolean;
  bowl: boolean;
  music: Track | "off";
  volume: number;
  haptics: HapticLevel;
  /** „Nur Vibration“: Stimme, Klangschale und Musik aus – fürs Büro, Handy in der Hand oder Hosentasche */
  silent: boolean;
  look: Look;
  length: Length;
  favorites: string[];
  /** zuletzt gewählte Dauer je Übung */
  minutes: Record<string, number>;
};

export const DEFAULT_PREFS: Prefs = { voice: true, voiceName: "", readAloud: false, bowl: true, music: "off", volume: 0.35, haptics: "strong", silent: false, look: "flower", length: "normal", favorites: [], minutes: {} };
const KEY = "atem:prefs";
const EVT = "atem:prefs-change";

export function readPrefs(): Prefs {
  try { return { ...DEFAULT_PREFS, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Prefs>) }; } catch { return DEFAULT_PREFS; }
}
let syncer: ((json: string) => void) | undefined;
/** Store meldet sich hier an, um Änderungen ins Konto zu schreiben */
export function onPrefsChange(f: ((json: string) => void) | undefined) { syncer = f; }
/** vom Konto übernehmen (ohne zurückzuschreiben) */
export function adoptPrefs(json: string) {
  try {
    const p = JSON.parse(json) as Partial<Prefs>;
    if (!p || typeof p !== "object" || !Object.keys(p).length) return;
    localStorage.setItem(KEY, JSON.stringify({ ...readPrefs(), ...p }));
    window.dispatchEvent(new Event(EVT));
  } catch { /* egal */ }
}
export function setPrefs(patch: Partial<Prefs>) {
  const next = { ...readPrefs(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* egal */ }
  window.dispatchEvent(new Event(EVT));
  syncer?.(JSON.stringify(next));
}
export function usePrefs(): [Prefs, (p: Partial<Prefs>) => void] {
  const [p, setP] = useState(readPrefs);
  useEffect(() => { const on = () => setP(readPrefs()); window.addEventListener(EVT, on); return () => window.removeEventListener(EVT, on); }, []);
  return [p, setPrefs];
}
export function toggleFavorite(id: string) {
  const f = readPrefs().favorites;
  setPrefs({ favorites: f.includes(id) ? f.filter((x) => x !== id) : [id, ...f] });
}
