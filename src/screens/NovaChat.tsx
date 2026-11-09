import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowUp, ChevronLeft, Play } from "lucide-react";
import { EXERCISES, durationLabel, exerciseById, totalSec, type Exercise } from "@/data/exercises";
import { NEEDS, advise, greeting, needOf, type NeedId, type Today } from "@/lib/nova";
import { partOf } from "@/lib/checkin";
import { useStore } from "@/lib/store";
import { todayIso } from "@/lib/types";
import { Nova } from "@/components/Nova";
import { Photo, artBg } from "@/components/Art";

/**
 * Frag Nova (`/nova`): ein kurzes Gespräch, was du gerade brauchst. Nova fragt höchstens zwei Dinge, beruhigt und
 * empfiehlt am Ende IMMER eine Übung. Sie schaut, was du heute schon gemacht hast. Mit KI (`/api/nova`) frei,
 * sonst mit festen Fragen (`src/lib/nova.ts`).
 */
type Msg = { from: "nova" | "me"; text: string; exercise?: Exercise; thought?: string };
const TIMES = [[1, "1 Minute"], [3, "3 Minuten"], [5, "5 Minuten oder mehr"]] as const;

export default function NovaChat() {
  const nav = useNavigate();
  const { sessions, checkins } = useStore();
  const today = todayIso();
  const t: Today = useMemo(() => {
    const s = sessions.filter((x) => x.date === today);
    return { minutes: Math.round(s.reduce((n, x) => n + x.seconds, 0) / 60), doneIds: s.map((x) => x.exerciseId), part: partOf() };
  }, [sessions, today]);
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ from: "nova", text: greeting(t) }]);
  const [need, setNeed] = useState<NeedId>();
  const [quick, setQuick] = useState<string[]>(NEEDS.map((n) => n.label));
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const ai = useRef<boolean | undefined>(undefined);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy]);

  const say = (m: Msg) => setMsgs((xs) => [...xs, m]);

  /** feste Fragen ohne KI: Bedürfnis → Zeit → Empfehlung */
  const local = (answer: string) => {
    if (!need) {
      const n = NEEDS.find((x) => x.label === answer)?.id ?? needOf(answer);
      if (!n) { say({ from: "nova", text: "Danke, dass du das teilst. Was würde dir jetzt am meisten helfen?" }); setQuick(NEEDS.map((x) => x.label)); return; }
      setNeed(n);
      say({ from: "nova", text: "Wie viel Zeit hast du gerade?" });
      setQuick(TIMES.map(([, l]) => l));
      return;
    }
    const min = TIMES.find(([, l]) => l === answer)?.[0] ?? (Number(/\d+/.exec(answer)?.[0]) || 3);
    const a = advise(need, min, t, msgs.length);
    say({ from: "nova", text: a.text, exercise: a.exercise, thought: a.thought });
    setQuick(["Etwas anderes", "Nochmal von vorn"]);
  };

  const send = async (answer: string) => {
    if (!answer.trim() || busy) return;
    setText("");
    const mine: Msg = { from: "me", text: answer };
    setMsgs((xs) => [...xs, mine]);
    if (answer === "Nochmal von vorn") { setNeed(undefined); say({ from: "nova", text: "Gern. Was brauchst du gerade?" }); setQuick(NEEDS.map((n) => n.label)); return; }
    if (answer === "Etwas anderes" && need) { const a = advise(need, 5, { ...t, doneIds: [...t.doneIds, ...msgs.flatMap((m) => (m.exercise ? [m.exercise.id] : []))] }, msgs.length + 1); say({ from: "nova", text: `Dann vielleicht „${a.exercise.name}“.`, exercise: a.exercise }); return; }
    if (ai.current !== false) {
      setBusy(true);
      try {
        const r = await fetch("/api/nova", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
          messages: [...msgs, mine].map((m) => ({ role: m.from === "me" ? "user" : "assistant", content: m.text })),
          today: { minutes: t.minutes, done: t.doneIds.map((id) => exerciseById(id)?.name ?? id), part: t.part, mood: [...checkins].filter((c) => c.date === today).pop()?.mood },
          exercises: EXERCISES.map((e) => ({ id: e.id, name: e.name, tags: e.tags, level: e.level, minutes: e.minutes })),
        }) });
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as { reply?: string; exercise?: string | null; quick?: string[] };
        ai.current = true;
        say({ from: "nova", text: j.reply ?? "", exercise: exerciseById(j.exercise ?? undefined) });
        setQuick((j.quick ?? []).slice(0, 3));
        setBusy(false);
        return;
      } catch { ai.current = false; setBusy(false); }
    }
    local(answer);
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-page text-fg">
      <header className="top-safe shrink-0">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-6 pb-3">
          <button type="button" onClick={() => nav(-1)} aria-label="Zurück" className="grid h-11 w-11 place-items-center rounded-full bg-fg/[0.07] hover:bg-fg/[0.12]"><ChevronLeft size={21} /></button>
          <Nova size={40} state={busy ? "think" : "idle"} />
          <div><p className="text-[17px] font-semibold">Nova</p><p className="text-caption text-muted">Ruhe, Wohlbefinden, Haltung</p></div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 space-y-3 overflow-y-auto px-6 pt-2 pb-4">
        {msgs.map((m, k) => m.from === "me" ? (
          <p key={k} className="ml-auto w-fit max-w-[85%] rounded-[22px] rounded-br-md bg-brand-500 px-4 py-3 text-body leading-6 text-white">{m.text}</p>
        ) : (
          <div key={k} className="reveal-up max-w-[92%] space-y-2.5">
            {m.text && <p className="w-fit rounded-[22px] rounded-bl-md bg-surface px-4 py-3 text-body leading-6">{m.text}</p>}
            {m.thought && <p className="border-l-2 border-fg/25 pl-3 text-small leading-5 text-soft italic">{m.thought}</p>}
            {m.exercise && (
              <div className="overflow-hidden rounded-[22px] border border-card-line bg-surface">
                <div className="relative aspect-[16/8]" style={{ background: artBg(m.exercise) }}><Photo e={m.exercise} w={700} /></div>
                <div className="p-4">
                  <p className="text-[17px] font-semibold">{m.exercise.name}</p>
                  <p className="mt-0.5 text-small text-muted">{m.exercise.short} · {durationLabel(totalSec(m.exercise))}</p>
                  <button type="button" onClick={() => nav(`/atmen/${m.exercise!.id}`)} className="mt-3.5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-500 text-[16px] font-semibold text-white"><Play size={16} fill="currentColor" /> Jetzt starten</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {busy && <p className="w-fit rounded-[22px] bg-surface px-4 py-3 text-body text-muted">…</p>}
        <div ref={end} />
      </main>

      <footer className="shrink-0 border-t border-line bg-page" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        {quick.length > 0 && <div className="mx-auto max-w-xl px-6"><div className="hscroll gap-2 pt-3">{quick.map((q) => <button key={q} type="button" onClick={() => void send(q)} className="h-10 shrink-0 rounded-full bg-fg/[0.08] px-4 text-small font-semibold hover:bg-fg/[0.13]">{q}</button>)}</div></div>}
        <form onSubmit={(e) => { e.preventDefault(); void send(text); }} className="mx-auto mt-2.5 flex max-w-xl items-center gap-2 px-6">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Schreib Nova, wie es dir geht …" className="h-12 min-w-0 flex-1 rounded-full border border-card-line bg-surface px-5 text-[16px] placeholder:text-muted focus:border-brand-500 focus:outline-none" data-own-focus />
          <button type="submit" aria-label="Senden" disabled={!text.trim() || busy} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-500 text-white disabled:opacity-40"><ArrowUp size={20} /></button>
        </form>
      </footer>
    </div>
  );
}
