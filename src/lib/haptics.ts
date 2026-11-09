/**
 * Vibrationssprache für die Atemübung – ohne Kopfhörer, Handy in der Hand oder Hosentasche (wie „Atmen“ auf der
 * Apple Watch):
 *  - Einatmen:  Klopfen wird schneller und kräftiger (steigt an, wie die Lunge sich füllt)
 *  - Nachatmen: zwei schnelle kräftige Tipper
 *  - Halten:    ein einzelner weicher Doppel-Tipper am Anfang, dann Stille
 *  - Ausatmen:  Klopfen wird langsamer und leiser (fällt ab)
 *  - Ende:      Erfolgs-Muster (drei Schläge)
 *
 * `hapticPlan` ist rein und getestet. `play` spielt den Plan ab: in der App (Capacitor) über die Taptic Engine
 * (`@capacitor/haptics`), sonst über `navigator.vibrate` (Android-Browser). iPhone-Safari kann nicht vibrieren.
 */
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import type { PhaseKind } from "@/data/exercises";

export type Strength = 1 | 2 | 3;
export type Tap = { at: number; strength: Strength };
export type HapticLevel = "off" | "soft" | "strong";
export type Cue = PhaseKind | "end" | "start";

/** Tipper-Plan für eine Phase der Länge `seconds` (Zeiten in ms ab Phasenbeginn) */
export function hapticPlan(cue: Cue, seconds: number, level: HapticLevel = "strong"): Tap[] {
  if (level === "off") return [];
  const ms = Math.max(0, seconds * 1000);
  const cap = (s: number): Strength => (level === "soft" ? (Math.max(1, s - 1) as Strength) : (s as Strength));
  if (cue === "start") return [{ at: 0, strength: cap(2) }];
  if (cue === "end") return [0, 260, 520].map((at, i) => ({ at, strength: cap(i === 2 ? 3 : 2) }));
  if (cue === "hold" || cue === "rest") return [{ at: 0, strength: cap(1) }, { at: 140, strength: cap(1) }];
  if (cue === "in2") return [{ at: 0, strength: cap(3) }, { at: 120, strength: cap(3) }];
  // sehr kurze Phasen (Kapalabhati): ein Tipper, Ausatmen kräftig
  if (ms < 1200) return [{ at: 0, strength: cap(cue === "out" ? 3 : 1) }];
  // Ein: Abstände schrumpfen von 520 auf 140 ms, Stärke steigt; Aus: umgekehrt, und nur in den ersten 85 % (am Ende Ruhe)
  const taps: Tap[] = [];
  const span = cue === "in" ? ms * 0.92 : ms * 0.85;
  let t = 0;
  while (t <= span && taps.length < 40) {
    const x = t / span; // 0–1
    const prog = cue === "in" ? x : 1 - x;
    const strength = (prog < 0.34 ? 1 : prog < 0.7 ? 2 : 3) as Strength;
    taps.push({ at: Math.round(t), strength: cap(strength) });
    t += 520 - 380 * prog;
  }
  return taps;
}

/** Plan → Muster für `navigator.vibrate` ([an, aus, an, …]); Stärke = Dauer */
export function vibratePattern(taps: Tap[]): number[] {
  const len: Record<Strength, number> = { 1: 12, 2: 24, 3: 40 };
  const out: number[] = [];
  let now = 0;
  for (const t of taps) {
    if (out.length) out.push(Math.max(0, t.at - now));
    out.push(len[t.strength]);
    now = t.at + len[t.strength];
  }
  return out;
}

export const isNative = () => { try { return Capacitor.isNativePlatform(); } catch { return false; } };
/** kann dieses Gerät vibrieren? */
export function canVibrate(): boolean {
  if (isNative()) return true;
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

const STYLE: Record<Strength, ImpactStyle> = { 1: ImpactStyle.Light, 2: ImpactStyle.Medium, 3: ImpactStyle.Heavy };

/** spielt einen Hinweis ab; gibt eine Funktion zum Abbrechen zurück */
export function play(cue: Cue, seconds: number, level: HapticLevel): () => void {
  const taps = hapticPlan(cue, seconds, level);
  if (!taps.length) return () => undefined;
  if (isNative()) {
    if (cue === "end") { void Haptics.notification({ type: NotificationType.Success }).catch(() => undefined); return () => undefined; }
    const timers = taps.map((t) => window.setTimeout(() => { void Haptics.impact({ style: STYLE[t.strength] }).catch(() => undefined); }, t.at));
    return () => timers.forEach(clearTimeout);
  }
  try {
    if (navigator.vibrate) {
      navigator.vibrate(vibratePattern(taps));
      return () => { try { navigator.vibrate(0); } catch { /* egal */ } };
    }
  } catch { /* egal */ }
  return () => undefined;
}

/** kurzer Tipper für Knöpfe (Auswahl im Check-in) */
export function tick() {
  if (isNative()) { void Haptics.selectionChanged().catch(() => undefined); return; }
  try { navigator.vibrate?.(8); } catch { /* egal */ }
}
