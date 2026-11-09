import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Check, ChevronLeft, Mic, Square, Volume2, VolumeX, X, LifeBuoy } from "lucide-react";
import { BODY, CONTROL, CRISIS, EMOTIONS, ENERGY, INFLUENCES, MOODS, PART_TITLE, QUADRANT, partOf, quadrantOf, recommend, reflectQuestions, type Control, type Energy } from "@/lib/checkin";
import { MoodFace } from "@/components/MoodFace";
import { ExerciseRow, Photo } from "@/components/Art";
import { useStore } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";
import { hush, say, useDictation } from "@/lib/speech";
import { tick } from "@/lib/haptics";
import { newId, todayIso, type CheckIn as CheckInT } from "@/lib/types";

/**
 * Check-in „Wie geht's dir?“ als ruhiger Ablauf, KEIN Chat (Entscheidung siehe docs/konzept.md): eine Frage pro
 * Bildschirm, große Kacheln zum Antippen, wo es geht ohne Tippen. Freie Antworten kann man tippen oder diktieren,
 * die Fragen auf Wunsch vorlesen lassen (oben rechts). Aufbau wie FlowShell in Notara: ‹ · Punkte · ×, unten Weiter.
 *
 * Schritte: Stimmung → Energie → Wort → Körper → Einfluss → In deiner Hand? → stoische Frage(n) → Empfehlung.
 * Gespeichert wird beim Start der Übung bzw. „Ohne Übung speichern“.
 */
type StepId = "mood" | "energy" | "words" | "body" | "influence" | "control" | `q${number}` | "result";

export default function CheckInPage() {
  const nav = useNavigate();
  const { checkins, saveCheckin } = useStore();
  const [prefs, setPrefs] = usePrefs();
  const part = useMemo(() => partOf(), []);
  const today = todayIso();
  const questions = useMemo(() => reflectQuestions(part, checkins, prefs.length, today), []); // eslint-disable-line react-hooks/exhaustive-deps
  const order: StepId[] = ["mood", "energy", "words", "body", "influence", "control", ...questions.map((_, i) => `q${i}` as StepId), "result"];
  const [i, setI] = useState(0);
  const step = order[i];
  const [mood, setMood] = useState<number>();
  const [energy, setEnergy] = useState<Energy>();
  const [emotions, setEmotions] = useState<string[]>([]);
  const [body, setBody] = useState<string[]>([]);
  const [influences, setInfluences] = useState<string[]>([]);
  const [control, setControl] = useState<Control>();
  const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ""));
  const id = useRef(newId("c")).current;

  const q = mood && energy ? quadrantOf(mood, energy) : undefined;
  const picks = useMemo(() => (mood && energy ? recommend({ mood, energy, emotions, body, part }) : []), [mood, energy, emotions, body, part]);

  const next = () => { tick(); setI((n) => Math.min(order.length - 1, n + 1)); };
  const back = () => (i === 0 ? nav(-1) : setI((n) => n - 1));
  const toggle = (xs: string[], x: string, set: (v: string[]) => void, max = 99, only?: string) => {
    tick();
    if (only && x === only) return set(xs.includes(x) ? [] : [x]);
    const base = only ? xs.filter((y) => y !== only) : xs;
    set(base.includes(x) ? base.filter((y) => y !== x) : base.length >= max ? base : [...base, x]);
  };

  const record = (exerciseId?: string): CheckInT => ({
    id, createdAt: new Date().toISOString(), date: today, part, mood: mood ?? 3, energy: energy ?? 2, emotions, body, influences, control,
    answers: questions.map((qq, k) => ({ q: qq, a: answers[k] ?? "" })).filter((a) => a.a.trim()), exerciseId,
  });
  const start = (exerciseId: string) => { saveCheckin(record(exerciseId)); nav(`/atmen/${exerciseId}?checkin=${id}`, { replace: true }); };
  const saveOnly = () => { saveCheckin(record()); nav("/", { replace: true }); };

  // Frage vorlesen (wenn eingeschaltet)
  const title = TITLES(step, questions, part);
  useEffect(() => { if (prefs.readAloud) void say(title.q); return () => hush(); }, [step, prefs.readAloud]); // eslint-disable-line react-hooks/exhaustive-deps

  const canNext = step === "mood" ? !!mood : step === "energy" ? !!energy : true;
  const auto = step === "mood" || step === "energy" || step === "control";

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-page text-fg">
      <header className="pt-safe shrink-0">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3">
          <button type="button" onClick={back} aria-label="Zurück" className="grid h-11 w-11 place-items-center rounded-full bg-fg/[0.07] hover:bg-fg/[0.12]"><ChevronLeft size={21} /></button>
          <div className="flex flex-1 justify-center gap-1.5" aria-label={`Schritt ${i + 1} von ${order.length}`}>
            {order.map((s, k) => <span key={s} className={`h-1.5 rounded-full transition-all duration-300 ${k === i ? "w-6 bg-brand-500" : k < i ? "w-1.5 bg-fg/50" : "w-1.5 bg-fg/15"}`} />)}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPrefs({ readAloud: !prefs.readAloud })} aria-pressed={prefs.readAloud} aria-label={prefs.readAloud ? "Nicht mehr vorlesen" : "Fragen vorlesen"} className={`grid h-11 w-11 place-items-center rounded-full ${prefs.readAloud ? "bg-brand-500 text-white" : "bg-fg/[0.07] hover:bg-fg/[0.12]"}`}>{prefs.readAloud ? <Volume2 size={19} /> : <VolumeX size={19} />}</button>
            <button type="button" onClick={() => nav("/")} aria-label="Schließen" className="grid h-11 w-11 place-items-center rounded-full bg-fg/[0.07] hover:bg-fg/[0.12]"><X size={19} /></button>
          </div>
        </div>
      </header>

      <main key={step} className="reveal-up mx-auto w-full max-w-xl flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <p className="text-small font-semibold text-brand-400">{title.over}</p>
        <h1 className="mt-1 text-[30px] leading-[36px] font-bold tracking-tight">{title.q}</h1>
        {title.sub && <p className="mt-2 text-body leading-6 text-muted">{title.sub}</p>}

        <div className="mt-7">
          {step === "mood" && (
            <div className="grid gap-2.5">
              {[...MOODS].reverse().map((m) => (
                <Tile key={m.v} on={mood === m.v} onClick={() => { setMood(m.v); window.setTimeout(next, 220); }}>
                  <MoodFace mood={m.v} size={38} className={mood === m.v ? "text-white" : ""} />
                  <span className="text-[18px] font-semibold">{m.label}</span>
                </Tile>
              ))}
            </div>
          )}
          {step === "energy" && (
            <div className="grid gap-2.5">
              {[...ENERGY].reverse().map((x) => (
                <Tile key={x.v} on={energy === x.v} onClick={() => { setEnergy(x.v); window.setTimeout(next, 220); }}>
                  <EnergyBars v={x.v} />
                  <span><span className="block text-[18px] font-semibold">{x.label}</span><span className={`block text-small ${energy === x.v ? "text-white/75" : "text-muted"}`}>{x.sub}</span></span>
                </Tile>
              ))}
            </div>
          )}
          {step === "words" && q && (
            <>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-fg/[0.06] px-3 py-1.5 text-small font-semibold"><span className="h-2.5 w-2.5 rounded-full" style={{ background: QUADRANT[q].color }} />{QUADRANT[q].label} · {QUADRANT[q].sub}</p>
              <Chips items={EMOTIONS[q].map((e) => e.w)} on={emotions} onToggle={(w) => toggle(emotions, w, setEmotions, 3)} />
            </>
          )}
          {step === "body" && <Chips items={BODY.map((b) => b.label)} on={body.map((id) => BODY.find((b) => b.id === id)!.label)} onToggle={(l) => toggle(body, BODY.find((b) => b.label === l)!.id, setBody, 99, "nichts")} />}
          {step === "influence" && <Chips items={INFLUENCES} on={influences} onToggle={(w) => toggle(influences, w, setInfluences, 99, "Nichts Bestimmtes")} />}
          {step === "control" && (
            <div className="grid gap-2.5">
              {CONTROL.map((c) => <Tile key={c.v} on={control === c.v} onClick={() => { setControl(c.v); tick(); }}><span className="text-[18px] font-semibold">{c.label}</span></Tile>)}
              {control && <p className="reveal-up mt-3 rounded-2xl bg-lavender px-4 py-3.5 text-body leading-6 text-fg">{CONTROL.find((c) => c.v === control)!.reply}</p>}
            </div>
          )}
          {step.startsWith("q") && <Answer key={step} value={answers[Number(step.slice(1))]} onChange={(v) => setAnswers((a) => a.map((x, k) => (k === Number(step.slice(1)) ? v : x)))} />}
          {step === "result" && (
            <>
              {mood && mood <= 1 && <p className="mb-5 flex gap-3 rounded-2xl bg-fg/[0.06] px-4 py-3.5 text-small leading-[21px] text-soft"><LifeBuoy size={20} className="shrink-0 text-brand-400" />{CRISIS}</p>}
              {picks[0] && (
                <button type="button" onClick={() => start(picks[0].exercise.id)} className="press relative block w-full overflow-hidden rounded-[28px] p-5 text-left text-white" style={{ background: "#262b35" }}>
                  <Photo e={picks[0].exercise} w={900} />
                  <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(42,47,59,.55) 0%, rgba(29,33,41,.8) 100%)" }} />
                  <span className="relative text-small font-semibold text-white/75">Für dich jetzt</span>
                  <span className="relative mt-1 block text-[26px] leading-8 font-bold">{picks[0].exercise.name}</span>
                  <span className="relative mt-2 block max-w-[85%] text-body leading-6 text-white/85">{picks[0].reason}</span>
                  <span className="relative mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-[16px] font-semibold text-[#141522]">Jetzt atmen <ArrowRight size={18} /></span>
                </button>
              )}
              <p className="mt-6 mb-1 text-small font-semibold text-muted">Oder lieber</p>
              {picks.slice(1).map((p) => <ExerciseRow key={p.exercise.id} e={p.exercise} sub={p.reason} onClick={() => start(p.exercise.id)} />)}
            </>
          )}
        </div>
      </main>

      <footer className="shrink-0 border-t border-line bg-page" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        <div className="mx-auto flex max-w-xl gap-2 px-5 pt-3">
          {step === "result" ? (
            <button type="button" onClick={saveOnly} className="h-14 flex-1 rounded-full bg-fg/[0.08] text-[16px] font-semibold hover:bg-fg/[0.13]">Ohne Übung speichern</button>
          ) : (
            <>
              {!auto && <button type="button" onClick={next} className="h-14 rounded-full px-5 text-[16px] font-semibold text-muted hover:text-fg">Überspringen</button>}
              <button type="button" onClick={next} disabled={!canNext} className="h-14 flex-1 rounded-full bg-brand-500 text-[17px] font-semibold text-white disabled:opacity-40">Weiter</button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

function TITLES(step: StepId, questions: string[], part: ReturnType<typeof partOf>): { over: string; q: string; sub?: string } {
  switch (step) {
    case "mood": return { over: PART_TITLE[part], q: "Wie geht's dir gerade?", sub: "Ganz ehrlich, ohne nachzudenken." };
    case "energy": return { over: "Energie", q: "Wie viel Energie hast du?" };
    case "words": return { over: "Gefühl benennen", q: "Welches Wort passt am besten?", sub: "Bis zu drei. Ein Gefühl zu benennen nimmt ihm schon etwas Wucht." };
    case "body": return { over: "Körper", q: "Was spürst du im Körper?", sub: "Danach suche ich die passende Atemübung aus." };
    case "influence": return { over: "Hintergrund", q: "Was beeinflusst dich gerade?" };
    case "control": return { over: "Stoisch", q: "Liegt das, was dich beschäftigt, in deiner Hand?", sub: "Epiktet: Manches liegt bei uns, anderes nicht." };
    case "result": return { over: "Danke fürs Hinschauen", q: "Lass uns atmen." };
    default: { const k = Number(step.slice(1)); return { over: `Reflexion ${k + 1} von ${questions.length}`, q: questions[k], sub: "Ein Satz reicht. Tippen oder sprechen." }; }
  }
}

function Tile({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={`press flex min-h-[72px] w-full items-center gap-4 rounded-[22px] px-5 py-3 text-left ${on ? "bg-brand-500 text-white" : "bg-surface shadow-[inset_0_0_0_1px_var(--color-card-line)] hover:bg-surface-2"}`}>
      {children}
      {on && <Check size={20} className="ml-auto shrink-0" />}
    </button>
  );
}

function Chips({ items, on, onToggle }: { items: string[]; on: string[]; onToggle: (x: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((x) => {
        const sel = on.includes(x);
        return <button key={x} type="button" onClick={() => onToggle(x)} aria-pressed={sel} className={`press inline-flex h-12 items-center gap-2 rounded-full px-5 text-[16px] font-semibold ${sel ? "bg-brand-500 text-white" : "bg-surface shadow-[inset_0_0_0_1px_var(--color-card-line)] hover:bg-surface-2"}`}>{sel && <Check size={16} />}{x}</button>;
      })}
    </div>
  );
}

function EnergyBars({ v }: { v: number }) {
  return <span className="flex h-9 w-9 items-end justify-center gap-1" aria-hidden>{[1, 2, 3].map((k) => <span key={k} className={`w-2 rounded-full ${k <= v ? "bg-current" : "bg-current opacity-20"}`} style={{ height: `${k * 30 + 10}%` }} />)}</span>;
}

/** freie Antwort: großes Feld, Mikrofon zum Diktieren */
function Answer({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const base = useRef(value);
  const d = useDictation((t) => onChange(`${base.current ? `${base.current} ` : ""}${t}`));
  return (
    <div className="relative">
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={5} placeholder="Schreib hier …" className="w-full resize-none rounded-[22px] border border-card-line bg-surface px-5 py-4 pr-16 text-[17px] leading-7 placeholder:text-muted focus:border-brand-500 focus:outline-none" data-own-focus />
      {d.supported && (
        <button type="button" onClick={() => { if (d.on) d.stop(); else { base.current = value; d.start(); } }} aria-label={d.on ? "Diktieren stoppen" : "Antwort sprechen"} className={`absolute right-3 bottom-4 grid h-11 w-11 place-items-center rounded-full ${d.on ? "animate-pulse bg-brand-500 text-white" : "bg-fg/[0.08] hover:bg-fg/[0.13]"}`}>{d.on ? <Square size={15} fill="currentColor" /> : <Mic size={19} />}</button>
      )}
    </div>
  );
}
