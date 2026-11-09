import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowDownRight, ArrowUpRight, BarChart3, Eye, Lightbulb, Minus, Quote, Trash2, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { report } from "@/lib/stats";
import { compare, insights, moodSeries } from "@/lib/insights";
import { BadgeGrid, ProgressCard, useProgress } from "@/components/Progress";
import { BODY, CONTROL, MOODS, QUADRANT, quadrantOf } from "@/lib/checkin";
import { exerciseById } from "@/data/exercises";
import { EmptyState, EqualList, PageTitle, Section, Segmented, Button } from "@/components/primitives";
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
  const dev = useMemo(() => compare(checkins, sessions, Number(range)), [checkins, sessions, range]);
  const series = useMemo(() => moodSeries(checkins, Number(range)), [checkins, range]);
  const notes = useMemo(() => insights(checkins, sessions, Number(range)), [checkins, sessions, range]);
  const g = useProgress();
  const list = [...checkins].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (!checkins.length && !sessions.length) return (
    <div>
      <PageTitle title="Rückblick" />
      <EmptyState icon={<BarChart3 />} title="Noch nichts zum Zurückblicken" text="Mach deinen ersten Check-in. Nach ein paar Tagen siehst du hier, wie es dir ging und was dir hilft." action={<Button href="/checkin">Check-in starten</Button>} />
    </div>
  );
  return (
    <div>
      <PageTitle title="Rückblick" right={<div className="w-44"><Segmented label="Zeitraum" joined value={range} onChange={setRange} options={[{ id: "7", label: "7 Tage" }, { id: "30", label: "30 Tage" }]} /></div>} />

      <ProgressCard />

      <Section title="So hast du dich entwickelt">
        <p className="-mt-1 mb-3 text-small text-muted">Die letzten {range} Tage im Vergleich zu den {range} Tagen davor.</p>
        <div className="grid grid-cols-2 gap-2.5">
          <Delta label="Tage dabei" now={dev.now.activeDays} before={dev.before.activeDays} />
          <Delta label="Minuten geatmet" now={dev.now.minutes} before={dev.before.minutes} />
          <Delta label="So ging es dir meistens" now={dev.now.mood} before={dev.before.mood} word />
          <Delta label="Nach dem Atmen" now={dev.now.lift} before={dev.before.lift} lift />
        </div>
      </Section>

      <Section title={range === "7" ? "Deine Stimmung diese Woche" : "Deine Stimmung im Monat"}>
        <div className={`flex h-44 items-end rounded-3xl border border-card-line bg-surface p-4 ${range === "7" ? "gap-2" : "gap-[3px]"}`}>
          {series.map((d, k) => (
            <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="flex w-full flex-1 items-end"><div className={`w-full transition-all ${range === "7" ? "rounded-xl" : "rounded-full"}`} style={{ height: d.mood ? `${(d.mood / 5) * 100}%` : "6%", background: d.mood ? MOOD_FLAT[Math.round(d.mood)] : "var(--color-surface-3)" }} /></div>
              <span className="h-4 text-caption font-semibold text-muted">{range === "7" ? new Date(`${d.date}T12:00:00`).toLocaleDateString("de-DE", { weekday: "short" }).slice(0, 2) : k % 7 === 0 || k === series.length - 1 ? new Date(`${d.date}T12:00:00`).getDate() + "." : ""}</span>
            </div>
          ))}
        </div>
      </Section>

      {notes.length > 0 && (
        <Section title="Was mir auffällt">
          <EqualList items={notes.map((n) => ({ key: n.text, lead: n.kind === "good" ? <TrendingUp /> : n.kind === "tip" ? <Lightbulb /> : <Eye />, text: n.text }))} />
        </Section>
      )}

      <Section title="Abzeichen" action={<span className="text-small text-muted">{g.badges.filter((b) => b.earned).length} von {g.badges.length}</span>}>
        <BadgeGrid list={[...g.badges].sort((a, b) => Number(b.earned) - Number(a.earned) || b.now / b.goal - a.now / a.goal)} />
      </Section>

      {r.emotions.length > 0 && <Section title="Häufigste Gefühle"><Bars items={r.emotions} /></Section>}
      {r.body.length > 0 && <Section title="Im Körper"><Bars items={r.body.map(([id, n]) => [BODY.find((b) => b.id === id)?.label ?? id, n])} /></Section>}
      {r.influences.length > 0 && <Section title="Was dich beschäftigt hat"><Bars items={r.influences} /></Section>}
      {r.control.length > 0 && (
        <Section title="Konntest du etwas ändern?">
          <Bars items={CONTROL.map((c) => [c.label, r.control.find(([v]) => v === c.v)?.[1] ?? 0] as [string, number])} />
        </Section>
      )}
      {r.exercises.length > 0 && (
        <Section title="Deine Übungen">
          <div className="grid gap-1">{r.exercises.map(([id, n]) => { const e = exerciseById(id); return e ? <ExerciseRow key={id} e={e} sub={`${n}× geatmet`} to={`/uebung/${id}`} /> : null; })}</div>
        </Section>
      )}
      {r.lessons.length > 0 && (
        <Section title="Was du aufgeschrieben hast">
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
                <p className="truncate text-small text-muted">{new Date(c.createdAt).toLocaleString("de-DE", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}{c.exerciseId ? ` · ${exerciseById(c.exerciseId)?.name ?? ""}` : ""}{c.moodAfter ? ` · danach ${c.moodAfter > c.mood ? "besser" : c.moodAfter < c.mood ? "schlechter" : "gleich"}` : ""}</p>
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

/** Wert jetzt mit kleinem Pfeil gegenüber vorher (höher = besser) */
function Delta({ label, now, before, word, lift }: { label: string; now?: number; before?: number; word?: boolean; lift?: boolean }) {
  const show = (v?: number) => v == null ? "·" : word ? MOODS[Math.round(v) - 1]?.label ?? "·" : lift ? (v > 0.2 ? "Besser" : v < -0.2 ? "Schlechter" : "Gleich") : String(v);
  const d = now != null && before != null ? now - before : undefined;
  const step = word || lift ? 0.3 : 0.5;
  const dir = d == null ? undefined : d > step ? "up" : d < -step ? "down" : "same";
  return (
    <div className="rounded-[22px] border border-card-line bg-surface px-4 py-3.5">
      <p className="text-caption text-muted">{label}</p>
      <p className="mt-0.5 truncate text-[22px] leading-8 font-bold tabular-nums">{show(now)}</p>
      <p className="mt-0.5 flex items-center gap-1 text-caption text-muted">
        {dir === "up" ? <ArrowUpRight size={14} className="text-fg" /> : dir === "down" ? <ArrowDownRight size={14} /> : <Minus size={14} />}
        {before == null ? "vorher noch nichts" : `vorher ${show(before)}`}
      </p>
    </div>
  );
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
