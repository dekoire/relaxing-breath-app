/**
 * Sprechen und Zuhören ohne Server: Vorlesen über die Stimme des Geräts (Web Speech, am iPhone die Siri-Stimmen),
 * Diktieren über die Spracherkennung des Browsers (Chrome, Safari). Später: eigene Stimme über einen KI-Dienst
 * (wie Notara über Vercel) – die Schnittstelle `say` bleibt gleich.
 */
import { useEffect, useRef, useState } from "react";

export function germanVoices(): SpeechSynthesisVoice[] {
  try { return (window.speechSynthesis?.getVoices() ?? []).filter((v) => v.lang.toLowerCase().startsWith("de")); } catch { return []; }
}
/** Stimmen laden asynchron – Hook, der sie nachreicht */
export function useVoices() {
  const [v, setV] = useState(germanVoices);
  useEffect(() => {
    const s = window.speechSynthesis;
    if (!s) return;
    const on = () => setV(germanVoices());
    s.addEventListener?.("voiceschanged", on);
    on();
    return () => s.removeEventListener?.("voiceschanged", on);
  }, []);
  return v;
}

/** ruhige Stimmen zuerst (Namen, die oft weich klingen) */
const CALM = /anna|helena|petra|marlene|vicki|katja|siri|premium|enhanced|natural/i;
function pickVoice(name: string) {
  const all = germanVoices();
  return all.find((v) => v.name === name) ?? all.find((v) => CALM.test(v.name)) ?? all[0];
}

/** spricht einen Satz; erfüllt sich am Ende (oder sofort, wenn es nichts zu sprechen gibt) */
export function say(text: string, o: { voiceName?: string; rate?: number } = {}): Promise<void> {
  return new Promise((end) => {
    const s = window.speechSynthesis;
    if (!s || !text.trim()) return end();
    try {
      s.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/…/g, ""));
      u.lang = "de-DE";
      u.rate = o.rate ?? 0.82;
      u.pitch = 0.95;
      const v = pickVoice(o.voiceName ?? "");
      if (v) u.voice = v;
      const t = window.setTimeout(end, 4000 + text.length * 120);
      u.onend = u.onerror = () => { clearTimeout(t); end(); };
      s.speak(u);
    } catch { end(); }
  });
}
export const hush = () => { try { window.speechSynthesis?.cancel(); } catch { /* egal */ } };

/* ---------- Diktieren ---------- */

type Rec = { lang: string; continuous: boolean; interimResults: boolean; start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
const RecCtor = (): (new () => Rec) | undefined => {
  const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};
export const canDictate = () => typeof window !== "undefined" && !!RecCtor();

/** Diktieren: `start()` hört zu und liefert den Text laufend an `onText` */
export function useDictation(onText: (t: string) => void) {
  const [on, setOn] = useState(false);
  const rec = useRef<Rec | null>(null);
  const cb = useRef(onText);
  cb.current = onText;
  const stop = () => { rec.current?.stop(); setOn(false); };
  const start = () => {
    const C = RecCtor();
    if (!C) return;
    hush();
    const r = new C();
    r.lang = "de-DE";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => cb.current(Array.from(e.results).map((x) => x[0].transcript).join(" ").replace(/\s+/g, " ").trim());
    r.onend = r.onerror = () => setOn(false);
    rec.current = r;
    try { r.start(); setOn(true); } catch { setOn(false); }
  };
  useEffect(() => () => rec.current?.stop(), []);
  return { on, start, stop, supported: canDictate() };
}
