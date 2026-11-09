import { useMemo, useState } from "react";
import { Link } from "react-router";
import { BarChart3, Quote, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { report, week } from "@/lib/stats";
import { BODY, CONTROL, QUADRANT, quadrantOf } from "@/lib/checkin";
import { exerciseById } from "@/data/exercises";
import { EmptyState, PageTitle, Section, Segmented, Button } from "@/components/primitives";
import { MoodFace, MOOD_FLAT } from "@/components/MoodFace";
import { ExerciseRow } from "@/components/Art";

/**
 * Rückblick (Reflexionsbericht): Zahlen über 7 oder 30 Tage, Stimmung je Tag, was das Atmen bringt (vorher/nachher),
 * häufigste Gefühle, Körper, Einflüsse, Lieblingsübungen, stoische Haltung und die eigenen Sätze. Darunter alle Check-ins.
 */
export default function Review() {
  const { checkins, sessions, removeCheckin } = useStore();
  const [range, setRange] = useState<"7" | "30">("7");
  const r = useMemo(() => report(checkins, sessions, Number(range)), [checkins, sessions, range]);
  const w = week(checkins, sessions);
  const list = [...checkins].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (!checkins.length && !sessions.length) return (
    <div>
      <PageTitle title="Rückblick" />
      <EmptyState icon={<BarChart3 />} title="Noch nichts zum Zurückblicken" text="Mach deinen ersten Check-in. Nach ein paar Tagen siehst du hier deine Muster." action={<Button href="/checkin">Check-in starten</Button>} />
    </div>
  );
  return (
    <div>
      <PageTitle title="Rückblick" right={<div className="w-44"><Segmented label="Zeitraum" joined value={range} onChange={setRange} options={[{ id: "7", label: "7 Tage" }, { id: "30", label: "30 Tage" }]} /></div>} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Big value={r.checkins} label="Check-ins" />
        <Big value={r.minutes} label="Minuten geatmet" />
        <Big value={r.avgMood ? r.avgMood.toFixed(1).replace(".", ",") : "–"} label="Stimmung Ø (1–5)" />
        <Big value={r.lift != null ? `${r.lift > 0 ? "+" : ""}${r.lift.toFixed(1).replace(".", ",")}` : "–"} label="Nach dem Atmen" accent />
      </div>
      {r.lift != null && <p className="mt-3 text-small leading-5 text-muted">{r.lift > 0 ? `Nach einer Übung ging es dir im Schnitt ${r.lift.toFixed(1).replace(".", ",")} Stufen besser.` : "Das Atmen hat deine Stimmung bisher wenig verändert – probier andere Übungen aus."}</p>}

      <Section title="Stimmung diese Woche">
        <div className="flex h-44 items-end gap-2 rounded-3xl border border-card-line bg-surface p-4">
          {w.map((d) => (
            <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="flex w-full flex-1 items-end"><div className="w-full rounded-xl transition-all" style={{ height: d.mood ? `${(d.mood / 5) * 100}%` : "6%", background: d.mood ? MOOD_FLAT[Math.round(d.mood)] : "var(--color-surface-3)" }} /></div>
              <span className="text-caption font-semibold text-muted">{new Date(`${d.date}T12:00:00`).toLocaleDateString("de-DE", { weekday: "short" }).slice(0, 2)}</span>
            </div>
          ))}
        </div>
      </Section>

      {r.emotions.length > 0 && <Section title="Häufigste Gefühle"><Bars items={r.emotions} /></Section>}
      {r.body.length > 0 && <Section title="Im Körper"><Bars items={r.body.map(([id, n]) => [BODY.find((b) => b.id === id)?.label ?? id, n])} /></Section>}
      {r.influences.length > 0 && <Section title="Was dich beeinflusst"><Bars items={r.influences} /></Section>}
      {r.control.length > 0 && (
        <Section title="Stoisch: in deiner Hand?">
          <div className="grid grid-cols-3 gap-3">{CONTROL.map((c) => <Big key={c.v} value={r.control.find(([v]) => v === c.v)?.[1] ?? 0} label={c.label} />)}</div>
        </Section>
      )}
      {r.exercises.length > 0 && (
        <Section title="Deine Übungen">
          <div className="grid gap-1">{r.exercises.map(([id, n]) => { const e = exerciseById(id); return e ? <ExerciseRow key={id} e={e} sub={`${n}× geatmet`} to={`/uebung/${id}`} /> : null; })}</div>
        </Section>
      )}
      {r.lessons.length > 0 && (
        <Section title="Deine Gedanken">
          <div className="grid gap-3">
            {r.lessons.map((l, k) => (
              <figure key={k} className="rounded-3xl border border-card-line bg-surface p-5">
                <Quote size={18} className="text-brand-400" />
                <blockquote className="mt-2 text-[17px] leading-7">{l.a}</blockquote>
                <figcaption className="mt-2 text-small text-muted">{l.q} · {new Date(`${l.date}T12:00:00`).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}</figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      <Section title="Alle Check-ins">
        <div className="divide-y divide-line overflow-hidden rounded-3xl border border-card-line bg-surface">
          {list.map((c) => (
            <div key={c.id} className="flex items-center gap-3.5 px-4 py-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white" style={{ background: MOOD_FLAT[Math.round(c.mood)] }}><MoodFace mood={c.mood} size={26} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">{c.emotions.join(", ") || QUADRANT[quadrantOf(c.mood, c.energy)].label}</p>
                <p className="truncate text-small text-muted">{new Date(c.createdAt).toLocaleString("de-DE", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}{c.exerciseId ? ` · ${exerciseById(c.exerciseId)?.name ?? ""}` : ""}{c.moodAfter ? ` · danach ${c.moodAfter}/5` : ""}</p>
              </div>
              <button type="button" onClick={() => { if (confirm("Diesen Check-in löschen?")) removeCheckin(c.id); }} aria-label="Löschen" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted hover:bg-fg/[0.06] hover:text-fg"><Trash2 size={17} /></button>
            </div>
          ))}
          {!list.length && <p className="px-4 py-5 text-small text-muted">Noch keine Check-ins. <Link to="/checkin" className="font-semibold text-fg">Jetzt starten</Link></p>}
        </div>
      </Section>
    </div>
  );
}

function Big({ value, label, accent }: { value: React.ReactNode; label: string; accent?: boolean }) {
  return <div className={`rounded-3xl px-4 py-4 ${accent ? "bg-brand-500 text-white" : "border border-card-line bg-surface"}`}><p className="text-[28px] leading-9 font-bold tabular-nums">{value}</p><p className={`text-caption leading-4 ${accent ? "text-white/75" : "text-muted"}`}>{label}</p></div>;
}

function Bars({ items }: { items: [string, number][] }) {
  const max = Math.max(1, ...items.map(([, n]) => n));
  return (
    <div className="grid gap-2.5 rounded-3xl border border-card-line bg-surface p-4">
      {items.map(([l, n]) => (
        <div key={l} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3">
          <span className="truncate text-[15px] font-medium">{l}</span>
          <span className="h-3 overflow-hidden rounded-full bg-fg/[0.06]"><span className="block h-full rounded-full bg-brand-500" style={{ width: `${(n / max) * 100}%` }} /></span>
          <span className="text-right text-small text-muted tabular-nums">{n}</span>
        </div>
      ))}
    </div>
  );
}
