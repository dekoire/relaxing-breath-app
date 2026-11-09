/**
 * Klang der Atemübung (1:1 aus Notara `src/plugins/breathe/sound.ts`), ganz im Browser erzeugt (Web Audio, keine Dateien, keine Lizenzen):
 *  - `bell()`: Klangschale – Grundton mit den typischen unharmonischen Obertönen, die langsam ausklingen und leicht schweben
 *  - `startMusic`: Hintergrundmusik (Klangteppich, Regen, Meer, tiefer Ton), schwillt mit dem Atem leicht an und ab
 * Der Audio-Kontext entsteht erst im Tipp auf „Start“ (Safari verlangt das).
 */
let ctx: AudioContext | undefined;
function ac(): AudioContext | undefined {
  try {
    // N368: geschlossen → neu; alles außer „running“ (Safari kennt auch „interrupted“, z. B. nach Tab-Wechsel am Mac) → fortsetzen
    if (!ctx || ctx.state === "closed") { const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext; if (!C) return undefined; ctx = new C({ latencyHint: "playback" }); }
    if (ctx.state !== "running") void ctx.resume().catch(() => undefined);
    return ctx;
  } catch { return undefined; }
}

/**
 * im Tipp aufrufen, damit später Töne kommen dürfen. N368 (Nutzer: am MacBook kein Ton): Safari/Chrome geben den
 * Audio-Kontext erst frei, wenn im Tipp wirklich etwas abgespielt wird; darum ein unhörbar kurzer Puffer.
 */
export const unlockBreathAudio = () => {
  const c = ac();
  if (!c) return;
  try {
    const src = c.createBufferSource();
    src.buffer = c.createBuffer(1, 1, c.sampleRate);
    src.connect(c.destination);
    src.start(0);
  } catch { /* egal */ }
};

export function bell(volume = 0.32) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + 0.03;
  const out = c.createGain();
  out.gain.value = volume;
  out.connect(c.destination);
  // Klangschale: Grundton ~220 Hz, Obertöne nicht ganzzahlig, höhere klingen schneller aus
  const parts: [number, number, number][] = [[1, 1, 7], [2.76, 0.45, 5], [5.4, 0.22, 3.2], [8.93, 0.1, 2]];
  for (const [ratio, amp, decay] of parts) {
    for (const detune of [-1.2, 1.2]) {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = 220 * ratio + detune * ratio;
      const g = c.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(amp / 2, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + decay + 0.1);
    }
  }
}

export type Pad = { swell: (open: number) => void; setVolume: (v: number) => void; stop: () => void };

/** N362: Hintergrundmusik zum Auswählen, alles im Browser erzeugt (keine Dateien, keine Lizenzen) */
export type Track = "pad" | "rain" | "sea" | "drone";
export const TRACKS: { id: Track; label: string; sub: string }[] = [
  { id: "pad", label: "Klangteppich", sub: "Warm und ruhig, geht mit dem Atem" },
  { id: "rain", label: "Regen", sub: "Leiser Regen am Fenster" },
  { id: "sea", label: "Meer", sub: "Wellen kommen und gehen" },
  { id: "drone", label: "Tiefer Ton", sub: "Ein ruhiger, schwebender Grundton" },
];
/** Lautstärke 0–1 (Regler) → Verstärkung; Vorgabe 0,35 ist leiser als früher (0,06) */
export const MUSIC_MAX = 0.12;
export const MUSIC_DEFAULT = 0.35;

function noise(c: AudioContext, brown: boolean): AudioBufferSourceNode {
  const len = c.sampleRate * 4;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
  }
  const s = c.createBufferSource();
  s.buffer = buf;
  s.loop = true;
  return s;
}

/** Hintergrundmusik starten; `volume` 0–1 wie der Regler */
export function startMusic(track: Track, volume = MUSIC_DEFAULT): Pad | undefined {
  const c = ac();
  if (!c) return undefined;
  let vol = volume * MUSIC_MAX;
  const master = c.createGain();
  master.gain.setValueAtTime(0, c.currentTime);
  master.gain.linearRampToValueAtTime(vol, c.currentTime + 3);
  master.connect(c.destination);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.connect(master);
  const nodes: AudioScheduledSourceNode[] = [];
  const start = (n: AudioScheduledSourceNode) => { n.start(); nodes.push(n); };
  // langsames Schwingen der Lautstärke (Wellen, Schweben)
  const lfo = (rate: number, depth: number, target: AudioParam) => {
    const o = c.createOscillator();
    o.frequency.value = rate;
    const g = c.createGain();
    g.gain.value = depth;
    o.connect(g).connect(target);
    start(o);
  };
  let swellBase = 500, swellSpan = 900;
  if (track === "pad") {
    lp.frequency.value = 600;
    lp.Q.value = 0.6;
    // ruhiger Akkord (D-Dur ohne Terz unten, mit None oben): klingt offen, nicht traurig
    [146.83, 220, 293.66, 329.63].forEach((f, i) => [-2, 2].forEach((dt) => {
      const o = c.createOscillator();
      o.type = i === 0 ? "sine" : "triangle";
      o.frequency.value = f;
      o.detune.value = dt * 3;
      const g = c.createGain();
      g.gain.value = i === 0 ? 0.5 : 0.18;
      o.connect(g).connect(lp);
      start(o);
    }));
  } else if (track === "rain") {
    lp.frequency.value = 2600;
    swellBase = 2400; swellSpan = 600;
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 400;
    const g = c.createGain();
    g.gain.value = 0.55;
    const n = noise(c, false);
    n.connect(hp).connect(g).connect(lp);
    start(n);
    lfo(0.13, 0.08, g.gain);
  } else if (track === "sea") {
    lp.frequency.value = 700;
    swellBase = 600; swellSpan = 500;
    const g = c.createGain();
    g.gain.value = 0.9;
    const n = noise(c, true);
    n.connect(g).connect(lp);
    start(n);
    // Welle etwa alle 9 s
    lfo(0.11, 0.65, g.gain);
    lfo(0.11, 350, lp.frequency);
  } else {
    lp.frequency.value = 420;
    swellBase = 380; swellSpan = 300;
    [[110, 0.55], [110.6, 0.45], [165, 0.2], [220, 0.08]].forEach(([f, a]) => {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = c.createGain();
      g.gain.value = a;
      o.connect(g).connect(lp);
      start(o);
    });
  }
  return {
    swell: (open) => {
      const now = c.currentTime;
      lp.frequency.setTargetAtTime(swellBase + open * swellSpan, now, 0.4);
      master.gain.setTargetAtTime(vol * (0.75 + open * 0.4), now, 0.4);
    },
    setVolume: (v) => { vol = v * MUSIC_MAX; master.gain.setTargetAtTime(vol, c.currentTime, 0.15); },
    stop: () => {
      const now = c.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 1.6);
      for (const n of nodes) n.stop(now + 1.7);
    },
  };
}
