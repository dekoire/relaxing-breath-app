import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Bell, Pause, Play, X } from "lucide-react";
import { usePrefs } from "@/lib/prefs";
import { useStore } from "@/lib/store";
import { bell, unlockBreathAudio } from "@/lib/sound";
import { tick } from "@/lib/haptics";
import { newId, todayIso } from "@/lib/types";
import { sessionPoints } from "@/lib/progress";

/**
 * Timer: einfach still sitzen und atmen, so lange du willst. Gong am Anfang und Ende, auf Wunsch zwischendurch.
 * Ein ruhiger Kreis atmet mit (4 Sek. ein, 6 Sek. aus), man muss ihm aber nicht folgen. Zählt wie eine Übung
 * (Minuten, Punkte, Serie), gespeichert mit `exerciseId: "timer"`.
 */
const BG = "linear-gradient(135deg, #2e3441 0%, #232833 55%, #1b1f28 100%)";
const MINUTES = [1, 3, 5, 10, 15, 20];
const GONGS: [number, string][] = [[0, "Aus"], [1, "Jede Min."], [5, "Alle 5 Min."]];

export default function TimerPage() {
  const nav = useNavigate();
  const [prefs, setPrefs] = usePrefs();
  const { saveSession } = useStore();
  const [stage, setStage] = useState<"pick" | "run" | "done">("pick");
  const [left, setLeft] = useState(prefs.timer.minutes * 60);
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState(true);
  const total = prefs.timer.minutes * 60;
  const startedAt = useRef(0);
  const used = useRef(0);

  // Countdown
  useEffect(() => {
    if (stage !== "run" || paused) return;
    const id = window.setInterval(() => setLeft((s) => {
      const n = s - 1;
      const gone = total - n;
      if (prefs.timer.gong && n > 0 && gone % (prefs.timer.gong * 60) === 0) { if (prefs.bowl) bell(0.18); tick(); }
      if (n <= 0) { window.clearInterval(id); finish(true); return 0; }
      return n;
    }), 1000);
    return () => window.clearInterval(id);
  }, [stage, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  // ruhiger Atem-Kreis: 4 Sek. auf, 6 Sek. zu
  useEffect(() => {
    if (stage !== "run" || paused) return;
    let t = 0;
    const loop = (open: boolean) => { setPhase(open); t = window.setTimeout(() => loop(!open), open ? 4000 : 6000); };
    loop(true);
    return () => window.clearTimeout(t);
  }, [stage, paused]);

  // Bildschirm bleibt an
  useEffect(() => {
    let lock: { release: () => Promise<void> } | undefined;
    if (stage === "run") (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request("screen").then((l) => { lock = l; }).catch(() => undefined);
    return () => { void lock?.release(); };
  }, [stage]);

  const start = () => { unlockBreathAudio(); if (prefs.bowl) bell(); tick(); used.current = 0; startedAt.current = Date.now(); setLeft(total); setPaused(false); setStage("run"); };
  function finish(completed: boolean) {
    const seconds = completed ? total : total - left;
    used.current = seconds;
    if (prefs.bowl) bell();
    if (seconds >= 10) saveSession({ id: newId("s"), createdAt: new Date().toISOString(), date: todayIso(), exerciseId: "timer", seconds, completed });
    setStage("done");
  }

  const mm = Math.floor(left / 60), ss = left % 60;
  const p = stage === "run" ? 1 - left / total : 0;
  const r = 46, c = 2 * Math.PI * r;

  return (
    <div className="fixed inset-0 z-[300] flex flex-col text-white" style={{ background: BG }}>
      <div className="top-safe flex items-center justify-between px-5 pb-2">
        <span className="w-11" />
        <span className="text-[13px] font-semibold tracking-wide text-white/55">Timer</span>
        <button type="button" onClick={() => (stage === "run" ? finish(false) : nav(-1))} aria-label="Schließen" className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.08] text-white/80 hover:bg-white/[0.14]"><X size={19} /></button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6">
        <div className="relative grid h-[min(72vw,300px)] w-[min(72vw,300px)] place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="2" />
            <circle cx="50" cy="50" r={r} fill="none" stroke="#b3a1ff" strokeWidth="2" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p)} style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <span aria-hidden className="absolute h-[62%] w-[62%] rounded-full bg-[radial-gradient(circle,rgba(179,161,255,.35)_0%,rgba(109,74,255,.12)_55%,transparent_72%)]" style={{ transform: `scale(${stage === "run" && !paused ? (phase ? 1.15 : 0.75) : 0.9})`, transition: `transform ${phase ? 4000 : 6000}ms ease-in-out` }} />
          <div className="relative text-center">
            {stage === "done" ? (
              <><p className="text-[30px] font-semibold">Geschafft</p><p className="mt-1 text-[15px] text-white/65">{Math.max(1, Math.round(used.current / 60))} Min. Ruhe · +{sessionPoints(used.current, used.current >= total)} Punkte</p></>
            ) : (
              <><p className="text-[54px] leading-none font-light tabular-nums">{mm}:{String(ss).padStart(2, "0")}</p>
                <p className="mt-3 h-5 text-[14px] text-white/55">{stage === "run" ? (paused ? "Pausiert" : phase ? "Einatmen" : "Ausatmen") : "Setz dich bequem hin"}</p></>
            )}
          </div>
        </div>
        {stage === "run" && <p className="mt-8 max-w-[18rem] text-center text-[15px] leading-6 text-white/55">Atme ruhig. Wenn Gedanken kommen, lass sie ziehen und komm zurück zum Atem.</p>}
      </div>

      <div className="bottom-safe mx-auto w-full max-w-md px-5 pt-3">
        {stage === "pick" && (
          <>
            <p className="mb-2 text-[12px] font-semibold tracking-wide text-white/45 uppercase">Wie lange?</p>
            <div className="mb-4 grid grid-cols-6 gap-1 rounded-full bg-white/[0.07] p-1">
              {MINUTES.map((x) => <button key={x} type="button" onClick={() => { setPrefs({ timer: { ...prefs.timer, minutes: x } }); setLeft(x * 60); }} className={`h-11 rounded-full text-[15px] font-semibold transition ${x === prefs.timer.minutes ? "bg-white text-[#141522]" : "text-white/70 hover:text-white"}`}>{x}</button>)}
            </div>
            <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-white/45 uppercase"><Bell size={13} /> Gong zwischendurch</p>
            <div className="grid grid-cols-3 gap-1 rounded-full bg-white/[0.07] p-1">
              {GONGS.map(([g, l]) => <button key={g} type="button" onClick={() => setPrefs({ timer: { ...prefs.timer, gong: g } })} className={`h-11 rounded-full px-1 text-[13.5px] font-semibold transition ${g === prefs.timer.gong ? "bg-white text-[#141522]" : "text-white/70 hover:text-white"}`}>{l}</button>)}
            </div>
            <button type="button" onClick={start} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-[17px] font-semibold text-[#141522] hover:bg-white/90"><Play size={18} fill="currentColor" /> Starten · {prefs.timer.minutes} Min.</button>
          </>
        )}
        {stage === "run" && (
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => setPaused((x) => !x)} className="flex h-14 items-center justify-center gap-2 rounded-full bg-white/[0.1] text-[16px] font-semibold hover:bg-white/[0.16]">{paused ? <><Play size={17} fill="currentColor" /> Weiter</> : <><Pause size={17} fill="currentColor" /> Pause</>}</button>
            <button type="button" onClick={() => finish(false)} className="h-14 rounded-full bg-white/[0.06] text-[16px] font-semibold text-white/75 hover:bg-white/[0.12]">Beenden</button>
          </div>
        )}
        {stage === "done" && (
          <div className="grid gap-2.5">
            <button type="button" onClick={() => setStage("pick")} className="h-14 rounded-full bg-white/[0.1] text-[16px] font-semibold hover:bg-white/[0.16]">Noch einmal</button>
            <button type="button" onClick={() => nav("/", { replace: true })} className="h-12 rounded-full text-[15px] font-semibold text-white/65 hover:text-white">Fertig</button>
          </div>
        )}
      </div>
    </div>
  );
}
