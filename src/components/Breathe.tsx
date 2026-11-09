import { useEffect, useMemo, useRef, useState } from "react";
import { AudioLines, Bell, BellOff, Check, Clock, Flower2, SlidersHorizontal, Sparkles, Wind, Music, TriangleAlert, Vibrate, Volume1, Volume2, VolumeX, X } from "lucide-react";
import { type Exercise, type PhaseKind, durationLabel, flexible, gainOf, rhythmWords, steps as stepsOf, totalSec } from "@/data/exercises";
import { bell, startMusic, unlockBreathAudio, TRACKS, type Pad, type Track } from "@/lib/sound";
import { play, canVibrate, isNative, type HapticLevel } from "@/lib/haptics";
import { hush, say as speak, useVoices } from "@/lib/speech";
import { usePrefs } from "@/lib/prefs";
import { MoodFace } from "@/components/MoodFace";
import { Nova } from "@/components/Nova";

/**
 * Die Atemübung im Vollbild (aufgebaut wie „Atmen mit Nova“ in Notara, `src/components/Breathe.tsx`): Blume (oder
 * Kugel) öffnet sich beim Einatmen und schließt sich beim Ausatmen, darunter das Wort, Nase bzw. Mund als Bild,
 * oben die Restzeit als Ring. Dazu – einzeln schaltbar – Stimme, Klangschale, Musik und die Vibrationssprache
 * (`src/lib/haptics.ts`). „Nur Vibration“ schaltet alles Hörbare ab: Übung im Büro, Handy in der Hosentasche.
 *
 * Ablauf: Bereit (Dauer, Bedienung, Vorsicht) → Einleitung (gesprochen, Runden starten erst danach) → Schritte aus
 * `steps()` → „Wie fühlst du dich jetzt?“ → `onDone`.
 */
/** flacher Verlauf von oben links nach unten rechts, gedecktes Blau-Grau (Nutzerwunsch) */
const TOP = "#2a2f3b";
const BG = "linear-gradient(135deg, #2e3441 0%, #232833 55%, #1b1f28 100%)";
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
  const [picking, setPicking] = useState<"adjust" | null>(null);
  const [result, setResult] = useState<{ seconds: number; completed: boolean }>();
  // jedes für sich an/aus, in jeder Kombination
  const voice = prefs.voice, bowl = prefs.bowl, music: Music = prefs.music;
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
  const musicLive = stage === "run" || picking === "adjust";
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
  /** vor dem Start und während der Einleitung halb offen – nie nur ein Punkt */
  const half = stage === "pick" || (stage === "run" && idx < 0);
  const progress = stage === "run" ? 1 - left / (total * 1000) : stage === "done" ? 1 : 0;
  const mm = Math.floor(left / 60000), ss = Math.floor((left % 60000) / 1000);
  const trackName = TRACKS.find((t) => t.id === prefs.music)?.label ?? "Aus";
  const vibOk = canVibrate();
  const voices = useVoices();

  /** EINE kompakte Leiste (Nutzerwunsch): sechs runde Knöpfe mit kleinem Wort, vor und während der Übung an derselben Stelle */
  const ctrl = (key: string, icon: React.ReactNode, label: string, on: boolean, onClick: () => void, disabled = false) => (
    <button key={key} type="button" onClick={onClick} disabled={disabled} aria-pressed={on} aria-label={label} className="flex min-w-0 flex-col items-center gap-1.5 transition active:scale-95 disabled:opacity-35">
      <span className={`grid h-12 w-12 place-items-center rounded-full [&>svg]:h-[20px] [&>svg]:w-[20px] ${on ? "bg-brand-500 text-white" : "bg-white/[0.08] text-white/60"}`}>{icon}</span>
      <span className={`w-full truncate text-center text-[11.5px] leading-4 font-semibold ${on ? "text-white/85" : "text-white/45"}`}>{label}</span>
    </button>
  );
  const vibOn = vibOk && prefs.haptics !== "off";
  const controls = (
    <>
      <div className="grid grid-cols-5 gap-1">
        {ctrl("look", prefs.look === "flower" ? <Flower2 /> : <Nova size={22} />, prefs.look === "flower" ? "Blume" : "Nova", true, () => setPrefs({ look: prefs.look === "flower" ? "nova" : "flower" }))}
        {ctrl("vib", <Vibrate />, "Vibration", vibOn, () => setPrefs({ haptics: prefs.haptics === "off" ? prefs.hapticLevel : "off" }), !vibOk)}
        {ctrl("voice", voice ? <AudioLines /> : <VolumeX />, "Stimme", voice, () => { setPrefs({ voice: !voice }); if (voice) hush(); })}
        {ctrl("bowl", bowl ? <Bell /> : <BellOff />, "Schale", bowl, () => { setPrefs({ bowl: !bowl }); if (!bowl) { unlockBreathAudio(); bell(0.22); } })}
        {ctrl("music", <Music />, "Musik", music !== "off", () => { if (music === "off") { unlockBreathAudio(); setPrefs({ music: prefs.track }); } else setPrefs({ music: "off" }); })}
      </div>
      <button type="button" onClick={() => setPicking("adjust")} className="mx-auto mt-2 flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13.5px] font-semibold text-white/60 hover:bg-white/[0.08] hover:text-white"><SlidersHorizontal size={15} /> Anpassen</button>
    </>
  );

  return (
    <div role="dialog" aria-modal aria-label={e.name} className="fixed inset-0 z-[300] flex flex-col text-white" style={{ background: BG }}>
      <div className="top-safe flex items-center justify-between px-5 pb-2">
        <span className="w-11" />
        <span className="min-w-0 truncate px-2 text-[13px] font-semibold tracking-wide text-white/55 tabular-nums">{stage === "run" && idx >= 0 ? `${mm}:${String(ss).padStart(2, "0")}` : ""}</span>
        <button type="button" onClick={onClose} aria-label="Schließen" className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.08] text-white/80 hover:bg-white/[0.14]"><X size={19} /></button>
      </div>

      {stage === "pick" ? (
        /* vor dem Start: ruhige Zusammenfassung – was dich erwartet, was du davon hast */
        <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col justify-center overflow-y-auto px-6">
          <div className="mx-auto h-28 w-28">{prefs.look === "flower" ? <Flower open={false} half ms={1200} still /> : <NovaBreath open={false} half ms={1200} still />}</div>
          <h1 className="mt-3 text-center text-[28px] leading-9 font-semibold tracking-tight">{e.name}</h1>
          <p className="mx-auto mt-1 max-w-[19rem] text-center text-[15px] leading-6 text-white/60">{e.short}</p>
          <div className="mt-7 space-y-4">
            <div>
              <p className="mb-2 text-[12px] font-semibold tracking-wide text-white/45 uppercase">Was dich erwartet</p>
              <ul className="space-y-2.5 text-[15px] leading-6 text-white/85">
                <li className="flex gap-3"><Clock size={18} className="mt-0.5 shrink-0 text-[#b9a6ff]" />{durationLabel(total)}</li>
                <li className="flex gap-3"><Wind size={18} className="mt-0.5 shrink-0 text-[#b9a6ff]" />{rhythmWords(e)}</li>
                <li className="flex gap-3"><AudioLines size={18} className="mt-0.5 shrink-0 text-[#b9a6ff]" />{guideLine(voice, bowl, music !== "off" ? trackName : "", vibOn)}</li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-semibold tracking-wide text-white/45 uppercase">Was du davon hast</p>
              <p className="flex gap-3 text-[15px] leading-6 text-white/85"><Sparkles size={18} className="mt-0.5 shrink-0 text-[#b9a6ff]" />{gainOf(e)}</p>
            </div>
            {e.caution && <p className="flex gap-3 text-[13px] leading-5 text-white/55"><TriangleAlert size={16} className="mt-0.5 shrink-0" />{e.caution}</p>}
          </div>
        </div>
      ) : (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6">
        <div className="relative grid place-items-center">
          <ProgressRing p={progress} />
          <div className="absolute inset-0 grid place-items-center">
            {prefs.look === "flower" ? <Flower open={open} half={half} ms={dur} still={stage !== "run"} /> : <NovaBreath open={open} half={half} ms={dur} still={stage !== "run"} />}
          </div>
        </div>
        {/* feste Höhen: Wort und Zeile darunter springen nicht, das Bild bleibt stehen */}
        <p key={`${stage}${idx}`} className="breathe-word mt-5 flex h-10 items-center justify-center text-center text-[26px] font-light tracking-wide text-white/90">
          {stage === "done" ? (result?.completed ? "Schön gemacht." : "Gut, dass du da warst.") : step ? step.word : "Mach es dir bequem"}
        </p>
        <div className="flex h-[88px] w-full flex-col items-center justify-start overflow-hidden">
          {stage === "run" && step && (step.kind === "in" || step.kind === "out") && step.s >= 2 && !step.thought ? (
            <span key={`a${idx}`} className="breathe-word flex flex-col items-center text-[14px] text-white/55">
              <span className="text-white/80"><AirIcon kind={step.kind} ms={dur} /></span>{step.hint ?? (step.kind === "in" ? "durch die Nase" : "langsam ausatmen")}
            </span>
          ) : (
            <p className="mx-auto mt-1 line-clamp-3 max-w-[20rem] text-center text-[15px] leading-6 text-white/60">
              {stage === "run" ? (step ? step.thought ?? step.hint ?? step.blockLabel ?? "" : e.intro) : "Nimm diese Ruhe mit."}
            </p>
          )}
        </div>
      </div>
      )}

      <div className="bottom-safe mx-auto w-full max-w-md px-5 pt-3">
        {stage === "pick" && (
          <>
            {flexible(e) && (
              <div className="mb-4 grid grid-cols-4 gap-1 rounded-full bg-white/[0.07] p-1">
                {[1, 3, 5, 10].map((x) => <button key={x} type="button" onClick={() => setMinutes(x)} className={`h-11 rounded-full text-[15px] font-semibold transition ${x === minutes ? "bg-white text-[#141522]" : "text-white/70 hover:text-white"}`}>{x} Min.</button>)}
              </div>
            )}
            {controls}
            {!vibOk && !isNative() && <p className="mt-2 text-center text-[12px] text-white/45">Vibration gibt es in der App (iPhone und Android) und in Android-Browsern.</p>}
            <button type="button" onClick={go} className="mt-4 h-14 w-full rounded-full bg-white text-[17px] font-semibold text-[#141522] hover:bg-white/90">Los geht's</button>
          </>
        )}
        {stage === "run" && (
          <>
            {controls}
            <button type="button" onClick={stopEarly} className="mt-4 h-12 w-full rounded-full bg-white/[0.08] text-[15px] font-semibold text-white/80 hover:bg-white/[0.14]">Beenden</button>
          </>
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

      {picking === "adjust" && (
        <div className="absolute inset-0 z-10 flex flex-col" style={{ background: BG }}>
          <div className="top-safe flex items-center justify-between px-5 pb-2">
            <span className="w-11" />
            <span className="text-[15px] font-semibold">Anpassen</span>
            <button type="button" onClick={() => { hush(); setPicking(null); }} aria-label="Schließen" className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.08] text-white/80"><X size={19} /></button>
          </div>
          <div className="bottom-safe mx-auto mt-2 w-full max-w-md flex-1 space-y-6 overflow-y-auto px-5">
            <Group title="Bild">
              <Seg value={prefs.look} onChange={(v) => setPrefs({ look: v as "nova" | "flower" })} options={[["nova", "Nova"], ["flower", "Blume"]]} />
            </Group>
            <Group title="Vibration">
              {vibOk ? <Seg value={prefs.haptics} onChange={(v) => { const h = v as HapticLevel; setPrefs(h === "off" ? { haptics: h } : { haptics: h, hapticLevel: h }); if (h !== "off") play("in", 2, h); }} options={[["off", "Aus"], ["soft", "Sanft"], ["strong", "Deutlich"]]} />
                : <p className="text-[13.5px] text-white/50">Vibration gibt es in der App (iPhone und Android) und in Android-Browsern.</p>}
            </Group>
            <Group title="Stimme">
              <div className="grid gap-1">
                <Row on={!voice} onClick={() => { hush(); setPrefs({ voice: false }); }}>Ohne Stimme</Row>
                {(voices.length ? voices : [{ name: "" } as SpeechSynthesisVoice]).map((v) => (
                  <Row key={v.name || "auto"} on={voice && (prefs.voiceName === v.name || (!prefs.voiceName && v === voices[0]) || (!v.name && !prefs.voiceName))} onClick={() => { setPrefs({ voice: true, voiceName: v.name }); void speak("Einatmen. Und langsam ausatmen.", { voiceName: v.name }); }}>{v.name || "Stimme des Geräts"}</Row>
                ))}
              </div>
            </Group>
            <Group title="Klangschale">
              <Seg value={bowl ? "on" : "off"} onChange={(v) => { setPrefs({ bowl: v === "on" }); if (v === "on") { unlockBreathAudio(); bell(0.22); } }} options={[["off", "Aus"], ["on", "An"]]} />
            </Group>
            <Group title="Musik">
              <div className="grid gap-1">
                <Row on={music === "off"} onClick={() => setPrefs({ music: "off" })}>Keine Musik</Row>
                {TRACKS.map((t) => <Row key={t.id} on={music === t.id} sub={t.sub} onClick={() => { unlockBreathAudio(); setPrefs({ music: t.id, track: t.id }); }}>{t.label}</Row>)}
              </div>
              <div className={`mt-3 flex items-center gap-3 transition ${music === "off" ? "opacity-40" : ""}`}>
                <Volume1 size={17} className="shrink-0 text-white/40" />
                <input type="range" min={0} max={1} step={0.01} value={prefs.volume} disabled={music === "off"} onChange={(ev) => setPrefs({ volume: Number(ev.target.value) })} aria-label="Lautstärke der Musik" className="breathe-range flex-1 cursor-pointer" style={{ "--p": `${Math.round(prefs.volume * 100)}%` } as React.CSSProperties} />
                <Volume2 size={17} className="shrink-0 text-white/60" />
              </div>
            </Group>
            <button type="button" onClick={() => { hush(); setPicking(null); }} className="h-12 w-full rounded-full bg-white text-[15px] font-semibold text-[#141522] hover:bg-white/90">Fertig</button>
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
  const sc = open ? 1 : half ? 0.7 : 0.45;
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
            <ellipse cx="0" cy="-48" rx="26" ry="50" fill="url(#petal)" style={{ mixBlendMode: "screen", transform: `translateY(${open || half ? 0 : 10}px)`, transition: t }} />
          </g>
        ))}
      </g>
      <circle r="9" fill="#f6f2ff" opacity="0.85" style={{ transform: `scale(${open ? 1 : 0.6})`, transition: t }} />
    </svg>
  );
}

/** Nova in Lila (wie „Atmen mit Nova“ in Notara): groß beim Einatmen, klein beim Ausatmen, dahinter ein weicher Schein */
function NovaBreath({ open, half, ms, still }: { open: boolean; half?: boolean; ms: number; still: boolean }) {
  const t = `transform ${still ? 1200 : ms}ms cubic-bezier(.45,0,.55,1), opacity ${still ? 1200 : ms}ms ease-in-out`;
  const sc = open ? 1.15 : half ? 0.9 : 0.68;
  return (
    <div className="relative grid h-[82%] w-[82%] place-items-center" aria-hidden>
      <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgba(139,108,255,.38)_0%,rgba(109,74,255,.12)_45%,transparent_70%)]" style={{ transform: `scale(${open ? 1.1 : 0.6})`, opacity: open ? 1 : 0.5, transition: t }} />
      <div style={{ transform: `scale(${sc})`, transition: t }}><Nova size={170} state={open && !still ? "listen" : "idle"} /></div>
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

function guideLine(voice: boolean, bowl: boolean, track: string, vib: boolean): string {
  const parts = [voice ? "Nova spricht dich durch" : "", bowl ? "Klangschale" : "", track ? `Musik: ${track}` : "", vib ? "Vibration hält den Takt" : ""].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Ganz leise, du folgst dem Bild";
}
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><p className="mb-2 text-[12px] font-semibold tracking-wide text-white/45 uppercase">{title}</p>{children}</section>;
}
function Seg({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="grid gap-1 rounded-full bg-white/[0.07] p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map(([id, l]) => <button key={id} type="button" onClick={() => onChange(id)} className={`h-10 rounded-full text-[14.5px] font-semibold transition ${value === id ? "bg-white text-[#141522]" : "text-white/70 hover:text-white"}`}>{l}</button>)}
    </div>
  );
}
function Row({ on, sub, onClick, children }: { on: boolean; sub?: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-3.5 py-2 text-left ${on ? "bg-white/[0.1]" : "hover:bg-white/[0.05]"}`}>
      <span className="min-w-0 flex-1"><span className={`block truncate text-[15.5px] ${on ? "font-semibold" : ""}`}>{children}</span>{sub && <span className="block truncate text-[12.5px] text-white/50">{sub}</span>}</span>
      {on && <Check size={17} />}
    </button>
  );
}
