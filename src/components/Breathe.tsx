import { useEffect, useMemo, useRef, useState } from "react";
import { AudioLines, Bell, BellOff, Check, ChevronLeft, Circle, Flower2, Music, Smartphone, TriangleAlert, Vibrate, Volume1, Volume2, VolumeX, X } from "lucide-react";
import { type Exercise, type PhaseKind, durationLabel, flexible, rhythmLabel, steps as stepsOf, totalSec } from "@/data/exercises";
import { bell, startMusic, unlockBreathAudio, TRACKS, type Pad, type Track } from "@/lib/sound";
import { play, canVibrate, isNative, type HapticLevel } from "@/lib/haptics";
import { hush, say as speak } from "@/lib/speech";
import { usePrefs } from "@/lib/prefs";
import { MoodFace } from "@/components/MoodFace";

/**
 * Die Atemübung im Vollbild (aufgebaut wie „Atmen mit Nova“ in Notara, `src/components/Breathe.tsx`): Blume (oder
 * Kugel) öffnet sich beim Einatmen und schließt sich beim Ausatmen, darunter das Wort, Nase bzw. Mund als Bild,
 * oben die Restzeit als Ring. Dazu – einzeln schaltbar – Stimme, Klangschale, Musik und die Vibrationssprache
 * (`src/lib/haptics.ts`). „Nur Vibration“ schaltet alles Hörbare ab: Übung im Büro, Handy in der Hosentasche.
 *
 * Ablauf: Bereit (Dauer, Bedienung, Vorsicht) → Einleitung (gesprochen, Runden starten erst danach) → Schritte aus
 * `steps()` → „Wie fühlst du dich jetzt?“ → `onDone`.
 */
const TOP = "#121214";
const BG = `radial-gradient(110% 70% at 50% 42%, rgba(109,74,255,.30) 0%, transparent 62%), linear-gradient(${TOP} 0%, ${TOP} 7%, #1d1830 34%, #141124 70%, #0b0a12 100%)`;
type Music = Track | "off";

export function BreatheView({ exercise: e, minutes: m0, onClose, onDone, askMood = true }: {
  exercise: Exercise;
  minutes?: number;
  onClose: () => void;
  /** Übung beendet (zu Ende oder vorzeitig), mit geatmeten Sekunden und der Stimmung danach */
  onDone: (r: { seconds: number; completed: boolean; moodAfter?: number; minutes: number }) => void;
  askMood?: boolean;
}) {
  const [prefs, setPrefs] = usePrefs();
  const [minutes, setMinutes] = useState(m0 ?? prefs.minutes[e.id] ?? e.minutes);
  const [stage, setStage] = useState<"pick" | "run" | "done">("pick");
  const [idx, setIdx] = useState(-1);
  const [left, setLeft] = useState(0);
  const [picking, setPicking] = useState<"music" | null>(null);
  const [result, setResult] = useState<{ seconds: number; completed: boolean }>();
  const silent = prefs.silent;
  const voice = prefs.voice && !silent, bowl = prefs.bowl && !silent, music: Music = silent ? "off" : prefs.music;
  const live = useRef({ voice, bowl, haptics: prefs.haptics as HapticLevel, voiceName: prefs.voiceName });
  live.current = { voice, bowl, haptics: prefs.haptics, voiceName: prefs.voiceName };
  const padRef = useRef<Pad | undefined>(undefined);
  const startedAt = useRef(0);

  const list = useMemo(() => stepsOf(e, minutes), [e, minutes]);
  const total = totalSec(e, minutes);
  const step = idx >= 0 ? list[idx] : undefined;
  const kind: PhaseKind | undefined = step?.kind;

  // Ablauf
  useEffect(() => {
    if (stage !== "run") return;
    let stop = false;
    const timers: number[] = [];
    const cancels: (() => void)[] = [];
    const at = (ms: number, f: () => void) => timers.push(window.setTimeout(() => { if (!stop) f(); }, ms));
    if (live.current.bowl) bell(0.3);
    cancels.push(play("start", 0, live.current.haptics));
    setIdx(-1);
    setLeft(total * 1000);
    let tick = 0;
    const t0 = Date.now();
    const intro = live.current.voice ? Promise.race([speak(e.intro, { voiceName: live.current.voiceName }), new Promise<void>((r) => window.setTimeout(r, 15000))]) : new Promise<void>((r) => window.setTimeout(r, 2500));
    void intro.then(() => {
      if (stop) return;
      const wait = Math.max(0, 1500 - (Date.now() - t0)) + (live.current.voice ? 600 : 0);
      at(wait, run);
    });
    let lastThought: string | undefined;
    const run = () => {
      startedAt.current = Date.now();
      let spoken = 0;
      list.forEach((st, i) => {
        at(st.at * 1000, () => {
          setIdx(i);
          cancels.push(play(st.kind, st.s, live.current.haptics));
          const breathe = st.kind !== "hold" && st.kind !== "rest";
          if (live.current.bowl && breathe && st.s >= 2) bell(st.kind === "out" ? 0.11 : 0.2);
          if (st.kind === "in" || st.kind === "in2") padRef.current?.swell(1);
          if (st.kind === "out") padRef.current?.swell(0);
          if (!live.current.voice || st.s < 2.5) return;
          // Gedanke der Runde zuerst, dann das Wort: am Anfang und bei eigenen Wörtern immer, sonst ab und zu
          if (st.thought && st.thought !== lastThought && st.kind === "in") { lastThought = st.thought; void speak(st.thought, { voiceName: live.current.voiceName }); return; }
          const custom = !["Einatmen", "Ausatmen", "Halten", "Nachatmen"].includes(st.word);
          if (spoken < 8 || custom || e.count) { spoken++; void speak(st.word, { voiceName: live.current.voiceName }); }
        });
      });
      at(total * 1000, () => finish(true));
      const start = Date.now();
      tick = window.setInterval(() => setLeft(Math.max(0, total * 1000 - (Date.now() - start))), 250);
    };
    const finish = (completed: boolean) => {
      setResult({ seconds: Math.round(completed ? total : (Date.now() - (startedAt.current || Date.now())) / 1000), completed });
      setStage("done");
      cancels.push(play("end", 0, live.current.haptics));
      if (live.current.bowl) bell(0.3);
      if (live.current.voice) void speak("Schön. Bleib noch einen Moment so, und nimm diese Ruhe mit.", { voiceName: live.current.voiceName });
    };
    return () => { stop = true; timers.forEach(clearTimeout); cancels.forEach((c) => c()); clearInterval(tick); hush(); };
  }, [stage, minutes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Musik läuft während der Übung und als Hörprobe in der Auswahl
  const musicLive = stage === "run" || picking === "music";
  useEffect(() => {
    if (!musicLive || music === "off") return;
    const p = startMusic(music, prefs.volume);
    padRef.current = p;
    return () => { p?.stop(); if (padRef.current === p) padRef.current = undefined; };
  }, [musicLive, music]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { padRef.current?.setVolume(prefs.volume); }, [prefs.volume]);

  // Bildschirm bleibt an, Statusleiste in der Farbe der Seite, Escape schließt
  useEffect(() => {
    let lock: { release: () => Promise<void> } | undefined;
    if (stage === "run") (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request("screen").then((l) => { lock = l; }).catch(() => undefined);
    return () => { void lock?.release().catch(() => undefined); };
  }, [stage]);
  useEffect(() => {
    const m = document.querySelector('meta[name="theme-color"]');
    const prev = m?.getAttribute("content");
    m?.setAttribute("content", TOP);
    const k = (ev: KeyboardEvent) => { if (ev.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => { if (m && prev) m.setAttribute("content", prev); window.removeEventListener("keydown", k); };
  }, [onClose]);

  const stopEarly = () => {
    const secs = startedAt.current ? Math.round((Date.now() - startedAt.current) / 1000) : 0;
    setResult({ seconds: secs, completed: false });
    setStage("done");
  };
  const finishWith = (moodAfter?: number) => onDone({ ...(result ?? { seconds: 0, completed: false }), moodAfter, minutes });
  const go = () => { unlockBreathAudio(); setPrefs({ minutes: { ...prefs.minutes, [e.id]: minutes } }); setStage("run"); };

  const open = stage === "done" ? true : stage === "pick" ? false : kind === "in" || kind === "in2" ? true : kind === "out" ? false : openBefore(list, idx);
  const dur = step ? step.s * 1000 : 1500;
  const progress = stage === "run" ? 1 - left / (total * 1000) : stage === "done" ? 1 : 0;
  const mm = Math.floor(left / 60000), ss = Math.floor((left % 60000) / 1000);
  const trackName = TRACKS.find((t) => t.id === prefs.music)?.label ?? "Aus";
  const vibOk = canVibrate();

  const ctrl = (key: string, icon: React.ReactNode, label: string, value: string, on: boolean, onClick: () => void, disabled = false) => (
    <button key={key} type="button" onClick={onClick} disabled={disabled} aria-label={`${label}: ${value}`} className={`flex w-full min-w-0 items-center gap-3 rounded-2xl px-3 py-2 text-left transition active:scale-[.98] disabled:opacity-40 ${on ? "bg-white/[0.1]" : "bg-white/[0.05]"} hover:bg-white/[0.14]`}>
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[12px] [&>svg]:h-[19px] [&>svg]:w-[19px] ${on ? "bg-brand-500 text-white" : "bg-white/[0.08] text-white/55"}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] leading-4 text-white/55">{label}</span>
        <span className={`block truncate text-[15px] leading-5 font-semibold ${on ? "" : "text-white/60"}`}>{value}</span>
      </span>
    </button>
  );
  const HAPTIC_NEXT: Record<HapticLevel, HapticLevel> = { strong: "soft", soft: "off", off: "strong" };
  const HAPTIC_LABEL: Record<HapticLevel, string> = { strong: "Deutlich", soft: "Sanft", off: "Aus" };
  const controls = (
    <div className="grid grid-cols-2 gap-2">
      {ctrl("look", prefs.look === "orb" ? <Circle /> : <Flower2 />, "Bild", prefs.look === "orb" ? "Kugel" : "Blume", true, () => setPrefs({ look: prefs.look === "orb" ? "flower" : "orb" }))}
      {ctrl("vib", <Vibrate />, "Vibration", vibOk ? HAPTIC_LABEL[prefs.haptics] : "Nicht möglich", vibOk && prefs.haptics !== "off", () => setPrefs({ haptics: HAPTIC_NEXT[prefs.haptics] }), !vibOk)}
      {ctrl("voice", voice ? <AudioLines /> : <VolumeX />, "Stimme", voice ? "An" : "Aus", voice, () => setPrefs({ voice: !prefs.voice, silent: false }), silent)}
      {ctrl("bowl", bowl ? <Bell /> : <BellOff />, "Klangschale", bowl ? "An" : "Aus", bowl, () => { const v = !prefs.bowl; setPrefs({ bowl: v, silent: false }); if (v) { unlockBreathAudio(); bell(0.22); } }, silent)}
      <div className="col-span-2">{ctrl("music", <Music />, "Musik", silent ? "Aus" : trackName, music !== "off", () => setPicking("music"), silent)}</div>
    </div>
  );
  const silentToggle = (
    <button type="button" onClick={() => setPrefs({ silent: !silent })} aria-pressed={silent} className={`mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${silent ? "bg-brand-500/90" : "bg-white/[0.05] hover:bg-white/[0.1]"}`}>
      <Smartphone size={19} className="shrink-0" />
      <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">Nur Vibration</span><span className="block text-[12.5px] text-white/60">Ohne Ton, fürs Büro oder die Hosentasche</span></span>
      <span className={`h-6 w-10 shrink-0 rounded-full p-0.5 transition ${silent ? "bg-white" : "bg-white/20"}`}><span className={`block h-5 w-5 rounded-full transition ${silent ? "translate-x-4 bg-brand-500" : "bg-white"}`} /></span>
    </button>
  );

  return (
    <div role="dialog" aria-modal aria-label={e.name} className="fixed inset-0 z-[300] flex flex-col text-white" style={{ background: BG }}>
      <div className="pt-safe flex items-center justify-between px-4 py-3">
        <button type="button" onClick={onClose} aria-label="Zurück" className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.08] text-white/80 hover:bg-white/[0.14]"><ChevronLeft size={21} /></button>
        <span className="min-w-0 truncate px-2 text-[13px] font-semibold tracking-wide text-white/60 uppercase">{stage === "run" && idx >= 0 ? `${mm}:${String(ss).padStart(2, "0")}` : e.name}</span>
        <button type="button" onClick={onClose} aria-label="Schließen" className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.08] text-white/80 hover:bg-white/[0.14]"><X size={19} /></button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6">
        <div className="relative grid place-items-center">
          <ProgressRing p={progress} />
          <div className="absolute inset-0 grid place-items-center">
            {prefs.look === "orb" ? <Orb open={open} half={stage === "pick"} ms={dur} still={stage !== "run"} /> : <Flower open={open} half={stage === "pick"} ms={dur} still={stage !== "run"} />}
          </div>
        </div>
        <p key={`${stage}${idx}`} className="breathe-word mt-6 min-h-9 text-center text-[26px] font-light tracking-wide text-white/90">
          {stage === "pick" ? "Bereit?" : stage === "done" ? (result?.completed ? "Schön gemacht." : "Gut, dass du da warst.") : step ? step.word : "Mach es dir bequem"}
        </p>
        {stage === "run" && step && (step.kind === "in" || step.kind === "out") && step.s >= 2 && !step.thought ? (
          <span key={`a${idx}`} className="breathe-word mt-1 flex flex-col items-center text-[14px] text-white/55">
            <span className="text-white/80"><AirIcon kind={step.kind} ms={dur} /></span>{step.hint ?? (step.kind === "in" ? "durch die Nase" : "langsam ausatmen")}
          </span>
        ) : (
          <p className="mx-auto mt-2 min-h-6 max-w-[20rem] text-center text-[15px] leading-6 text-white/60">
            {stage === "run" ? (step ? step.thought ?? step.hint ?? step.blockLabel ?? "" : e.intro) : stage === "done" ? "Nimm diese Ruhe mit." : `${rhythmLabel(e)} · ${durationLabel(total)}`}
          </p>
        )}
        {stage === "run" && step?.blockLabel && step.thought && <p className="mt-1 text-[12.5px] text-white/40">{step.blockLabel}</p>}
      </div>

      <div className="mx-auto w-full max-w-md px-5" style={{ paddingBottom: "max(2rem, calc(env(safe-area-inset-bottom) + 1.25rem))" }}>
        {stage === "pick" && (
          <>
            {e.caution && <p className="mb-3 flex gap-2.5 rounded-2xl bg-white/[0.07] px-3.5 py-3 text-[13px] leading-[19px] text-white/75"><TriangleAlert size={17} className="mt-px shrink-0 text-[#c4b5ff]" />{e.caution}</p>}
            {flexible(e) && (
              <div className="mb-3 grid grid-cols-4 gap-1 rounded-full bg-white/[0.07] p-1">
                {[1, 3, 5, 10].map((x) => <button key={x} type="button" onClick={() => setMinutes(x)} className={`h-11 rounded-full text-[15px] font-semibold transition ${x === minutes ? "bg-white text-[#141522]" : "text-white/70 hover:text-white"}`}>{x} Min.</button>)}
              </div>
            )}
            {controls}
            {silentToggle}
            {!vibOk && <p className="mt-2 text-center text-[12px] text-white/45">{isNative() ? "" : "Vibration gibt es in der App (iPhone und Android) und in Android-Browsern."}</p>}
            <button type="button" onClick={go} className="mt-4 h-14 w-full rounded-full bg-white text-[17px] font-semibold text-[#141522] hover:bg-white/90">Los geht's</button>
          </>
        )}
        {stage === "run" && (
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button type="button" onClick={stopEarly} className="h-12 rounded-full bg-white/[0.08] text-[15px] font-semibold text-white/80 hover:bg-white/[0.14]">Beenden</button>
            <button type="button" onClick={() => setPrefs({ silent: !silent })} aria-pressed={silent} aria-label="Nur Vibration" className={`grid h-12 w-12 place-items-center rounded-full ${silent ? "bg-brand-500" : "bg-white/[0.08]"}`}><Smartphone size={19} /></button>
          </div>
        )}
        {stage === "done" && (
          <div className="grid gap-2.5">
            {askMood && (
              <>
                <p className="text-center text-[15px] font-semibold text-white/80">Wie fühlst du dich jetzt?</p>
                <div className="mb-2 grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((v) => <button key={v} type="button" onClick={() => finishWith(v)} aria-label={`Stimmung ${v} von 5`} className="grid h-16 place-items-center rounded-2xl bg-white/[0.07] text-white transition hover:bg-white/[0.14] active:scale-95"><MoodFace mood={v} size={34} /></button>)}
                </div>
              </>
            )}
            <button type="button" onClick={() => { unlockBreathAudio(); setStage("run"); }} className="h-12 w-full rounded-full bg-white/[0.08] text-[15px] font-semibold text-white/85 hover:bg-white/[0.14]">Noch einmal</button>
            <button type="button" onClick={() => finishWith()} className="h-12 w-full rounded-full text-[15px] font-semibold text-white/60 hover:text-white">Fertig</button>
          </div>
        )}
      </div>

      {picking === "music" && (
        <div className="absolute inset-0 z-10 flex flex-col" style={{ background: BG }}>
          <div className="pt-safe flex items-center justify-between px-4 py-3">
            <span className="w-11" />
            <span className="text-[15px] font-semibold">Musik im Hintergrund</span>
            <button type="button" onClick={() => setPicking(null)} aria-label="Schließen" className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.08] text-white/80"><X size={19} /></button>
          </div>
          <p className="px-6 text-center text-[13.5px] text-white/50">Antippen zum Anhören und Übernehmen. Alles wird live erzeugt, ohne Download.</p>
          <div className="pb-safe mx-auto mt-4 w-full max-w-md flex-1 overflow-y-auto px-4 pb-8">
            {[{ id: "off" as Music, label: "Keine Musik", sub: "Nur Stimme und Klangschale" }, ...TRACKS].map((t) => {
              const on = prefs.music === t.id;
              return (
                <button key={t.id} type="button" onClick={() => { if (t.id !== "off") unlockBreathAudio(); setPrefs({ music: t.id }); }} className={`flex min-h-[60px] w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ${on ? "bg-white/[0.09]" : "hover:bg-white/[0.05]"}`}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.08] text-white/80">{t.id === "off" ? <VolumeX size={17} /> : <Music size={17} />}</span>
                  <span className="min-w-0 flex-1"><span className={`block truncate text-[16px] ${on ? "font-semibold" : "font-medium"}`}>{t.label}</span><span className="block truncate text-[13px] text-white/50">{t.sub}</span></span>
                  {on && <Check size={17} />}
                </button>
              );
            })}
            <div className={`mt-5 rounded-2xl bg-white/[0.06] px-4 py-3.5 transition ${prefs.music === "off" ? "opacity-40" : ""}`}>
              <div className="flex items-center justify-between text-[14px]"><span className="text-white/60">Lautstärke</span><span className="font-semibold tabular-nums">{Math.round(prefs.volume * 100)} %</span></div>
              <div className="mt-2.5 flex items-center gap-3">
                <Volume1 size={17} className="shrink-0 text-white/40" />
                <input type="range" min={0} max={1} step={0.01} value={prefs.volume} disabled={prefs.music === "off"} onChange={(ev) => setPrefs({ volume: Number(ev.target.value) })} aria-label="Lautstärke der Musik" className="breathe-range flex-1 cursor-pointer" style={{ "--p": `${Math.round(prefs.volume * 100)}%` } as React.CSSProperties} />
                <Volume2 size={17} className="shrink-0 text-white/60" />
              </div>
            </div>
            <button type="button" onClick={() => setPicking(null)} className="mt-5 h-12 w-full rounded-full bg-white text-[15px] font-semibold text-[#141522] hover:bg-white/90">Fertig</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** beim Halten bleibt das Bild, wie es nach dem letzten Ein-/Ausatmen war */
function openBefore(list: { kind: PhaseKind }[], idx: number): boolean {
  for (let i = idx - 1; i >= 0; i--) { const k = list[i].kind; if (k === "in" || k === "in2") return true; if (k === "out") return false; }
  return false;
}

const SIZE = "h-[min(78vw,340px,34dvh)] w-[min(78vw,340px,34dvh)]";

function ProgressRing({ p }: { p: number }) {
  const r = 48, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className={`${SIZE} -rotate-90`} aria-hidden>
      <circle cx="50" cy="50" r={r} fill="none" strokeWidth="0.8" className="ring-track" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#b9a6ff" strokeWidth="0.9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p)} style={{ transition: "stroke-dashoffset .3s linear" }} />
    </svg>
  );
}

/** Blume aus acht Blättern (1:1 Notara): öffnet sich beim Einatmen, schließt sich beim Ausatmen */
function Flower({ open, half, ms, still }: { open: boolean; half?: boolean; ms: number; still: boolean }) {
  const sc = half ? 0.6 : open ? 1 : 0.2;
  const petals = Array.from({ length: 8 }, (_, i) => i * 45);
  const t = `transform ${still ? 1200 : ms}ms cubic-bezier(.45,0,.55,1), opacity ${still ? 1200 : ms}ms ease-in-out`;
  return (
    <svg viewBox="-104 -104 208 208" className="h-[82%] w-[82%] overflow-visible" aria-hidden>
      <defs>
        <radialGradient id="petal" cx="50%" cy="85%" r="80%">
          <stop offset="0%" stopColor="#e6dcff" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#9b7bff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#5b43f5" stopOpacity="0.15" />
        </radialGradient>
      </defs>
      <g style={{ transform: `rotate(${open ? 30 : half ? 15 : 0}deg) scale(${sc})`, transition: t }}>
        {petals.map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <ellipse cx="0" cy="-48" rx="26" ry="50" fill="url(#petal)" style={{ mixBlendMode: "screen", transform: `translateY(${open || half ? 0 : 18}px)`, transition: t }} />
          </g>
        ))}
      </g>
      <circle r="9" fill="#f6f2ff" opacity="0.85" style={{ transform: `scale(${open ? 1 : 0.6})`, transition: t }} />
    </svg>
  );
}

/** Kugel: wächst beim Einatmen, schrumpft beim Ausatmen, mit weichem Schein */
function Orb({ open, half, ms, still }: { open: boolean; half?: boolean; ms: number; still: boolean }) {
  const t = `transform ${still ? 1200 : ms}ms cubic-bezier(.45,0,.55,1), opacity ${still ? 1200 : ms}ms ease-in-out`;
  return (
    <div className="relative grid h-[82%] w-[82%] place-items-center" aria-hidden>
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(155,123,255,.55)_0%,rgba(109,74,255,.18)_45%,transparent_70%)]" style={{ transform: `scale(${open ? 1.1 : 0.5})`, opacity: open ? 1 : 0.5, transition: t }} />
      <div className="h-[56%] w-[56%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#efe9ff,#9b7bff_45%,#4a2fd1)] shadow-[0_0_60px_rgba(139,107,255,.6)]" style={{ transform: `scale(${open ? 1 : half ? 0.7 : 0.42})`, transition: t }} />
    </div>
  );
}

/** Nase (Einatmen) bzw. Mund (Ausatmen) mit Luftstrom (1:1 Notara) */
function AirIcon({ kind, ms }: { kind: "in" | "out"; ms: number }) {
  const flow = { animationDuration: `${Math.max(1200, ms)}ms` };
  return kind === "in" ? (
    <svg viewBox="0 0 64 56" className="h-12 w-14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M27 6c0 9-2 15-6 20M37 6c0 9 2 15 6 20" opacity=".55" />
      <path d="M21 26c-4 1.5-6 5-4.5 8 1.3 2.6 4.6 3.2 7 1.6M43 26c4 1.5 6 5 4.5 8-1.3 2.6-4.6 3.2-7 1.6" />
      <path d="M24.5 35.6c2.5 1.6 4.8 2.4 7.5 2.4s5-.8 7.5-2.4" />
      <ellipse cx="27.5" cy="33" rx="2.4" ry="1.4" /><ellipse cx="36.5" cy="33" rx="2.4" ry="1.4" />
      <g className="air-in" style={flow} opacity=".8"><path d="M27.5 52v-6M36.5 52v-6" /><path d="M24.5 49l3-3 3 3M33.5 49l3-3 3 3" /></g>
    </svg>
  ) : (
    <svg viewBox="0 0 64 56" className="h-12 w-14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 26c5-6 10-8 14-6 2.5-2 6-2 8 0 4-2 9 0 14 6-6 7-12 10-18 10S16 33 10 26Z" />
      <path d="M14 26.5c6 2 14 2 22 0" opacity=".55" />
      <g className="air-out" style={flow} opacity=".8"><path d="M44 20c4 1 7 3 9 6M46 27h10M44 33c4-1 7-3 9-6" /></g>
    </svg>
  );
}
