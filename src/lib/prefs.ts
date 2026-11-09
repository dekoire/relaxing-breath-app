/**
 * Einstellungen der Übung und des Check-ins. Auf dem Gerät gemerkt (`atem:prefs`) und – angemeldet mit Convex –
 * im Konto gespiegelt (Store ruft `onPrefsChange`). Ein Hook für alle Seiten.
 */
import { useEffect, useState } from "react";
import type { HapticLevel } from "@/lib/haptics";
import type { Track } from "@/lib/sound";
import type { Length } from "@/lib/checkin";
import { DEFAULT_REMIND, type Remind } from "@/lib/remind";

/** Bild der Übung: Nova (Vorgabe, wie in Notara) oder die Blume */
export type Look = "nova" | "flower";
/** Übungen und Kategorien als Kacheln (Mauerwerk) oder als Liste länglicher Kacheln (Bild links) */
export type Layout = "tiles" | "list";
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
  /** Stärke, wenn Vibration an ist (an/aus merkt sich die Stärke) */
  hapticLevel: "soft" | "strong";
  /** zuletzt gewählte Musik (an/aus merkt sich das Stück) */
  track: Track;
  look: Look;
  layout: Layout;
  length: Length;
  favorites: string[];
  /** tägliche Erinnerung */
  remind: Remind;
  /** Timer: zuletzt gewählte Minuten und Gong zwischendurch (Minuten, 0 = aus) */
  timer: { minutes: number; gong: number };
  /** zuletzt gewählte Dauer je Übung */
  minutes: Record<string, number>;
};

export const DEFAULT_PREFS: Prefs = { voice: true, voiceName: "", readAloud: false, bowl: true, music: "off", volume: 0.35, haptics: "strong", hapticLevel: "strong", track: "pad", look: "nova", layout: "tiles", length: "normal", favorites: [], remind: DEFAULT_REMIND, timer: { minutes: 5, gong: 0 }, minutes: {} };
const KEY = "atem:prefs";
const EVT = "atem:prefs-change";

export function readPrefs(): Prefs {
  try { const p = { ...DEFAULT_PREFS, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Prefs>) }; if (p.look !== "flower") p.look = "nova"; if (p.layout !== "list") p.layout = "tiles"; p.remind = { ...DEFAULT_REMIND, ...p.remind }; return p; } catch { return DEFAULT_PREFS; }
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
