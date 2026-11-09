/**
 * „So hast du dich entwickelt“: Vergleich mit dem Zeitraum davor und kurze Beobachtungen in einfachen Sätzen
 * (rein, getestet in insights.test.ts). Beobachtungen erst ab genug Daten, sonst lieber nichts sagen.
 */
import type { CheckIn, Session } from "@/lib/types";
import { daysAgo } from "@/lib/stats";
import { exerciseById } from "@/data/exercises";

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined);
const within = (date: string, from: string, to: string) => date >= from && date <= to;

export type Period = { activeDays: number; minutes: number; checkins: number; mood?: number; lift?: number };
function period(checkins: CheckIn[], sessions: Session[], from: string, to: string): Period {
  const c = checkins.filter((x) => within(x.date, from, to));
  const s = sessions.filter((x) => within(x.date, from, to));
  const days = new Set([...c.map((x) => x.date), ...s.filter((x) => x.seconds >= 30).map((x) => x.date)]);
  const after = c.filter((x) => x.moodAfter != null);
  return { activeDays: days.size, minutes: Math.round(s.reduce((n, x) => n + x.seconds, 0) / 60), checkins: c.length, mood: avg(c.map((x) => x.mood)), lift: avg(after.map((x) => x.moodAfter! - x.mood)) };
}

/** dieser Zeitraum gegen den gleich langen davor */
export function compare(checkins: CheckIn[], sessions: Session[], days: number, today = new Date()) {
  const now = period(checkins, sessions, daysAgo(days - 1, today), daysAgo(0, today));
  const before = period(checkins, sessions, daysAgo(days * 2 - 1, today), daysAgo(days, today));
  return { now, before };
}

/** Stimmung je Tag (Durchschnitt), leere Tage ohne Wert */
export function moodSeries(checkins: CheckIn[], days: number, today = new Date()) {
  return Array.from({ length: days }, (_, k) => {
    const date = daysAgo(days - 1 - k, today);
    return { date, mood: avg(checkins.filter((c) => c.date === date).map((c) => c.mood)) };
  });
}

export type Insight = { kind: "good" | "tip" | "notice"; text: string };

/** bis zu vier Beobachtungen, die wichtigsten zuerst */
export function insights(checkins: CheckIn[], sessions: Session[], days: number, today = new Date()): Insight[] {
  const out: Insight[] = [];
  const { now, before } = compare(checkins, sessions, days, today);
  const from = daysAgo(Math.max(days, 30) - 1, today);
  const recent = checkins.filter((c) => c.date >= from);
  if (now.mood != null && before.mood != null && Math.abs(now.mood - before.mood) >= 0.4)
    out.push(now.mood > before.mood ? { kind: "good", text: "Dir geht es besser als im Zeitraum davor." } : { kind: "notice", text: "Dir ging es zuletzt etwas schlechter als davor. Sei geduldig mit dir." });
  if (now.activeDays > before.activeDays && before.activeDays > 0) out.push({ kind: "good", text: `Du warst an ${now.activeDays} Tagen dabei, ${now.activeDays - before.activeDays} mehr als davor.` });

  // welche Übung hilft am meisten (mind. 2-mal mit „danach“)
  const byEx = new Map<string, number[]>();
  for (const c of recent) if (c.exerciseId && c.moodAfter != null) byEx.set(c.exerciseId, [...(byEx.get(c.exerciseId) ?? []), c.moodAfter - c.mood]);
  const best = [...byEx].filter(([, xs]) => xs.length >= 2).map(([id, xs]) => [id, avg(xs)!] as const).sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] > 0.2) { const e = exerciseById(best[0]); if (e) out.push({ kind: "tip", text: `Nach „${e.name}“ geht es dir am meisten besser.` }); }

  // morgens gegen abends
  const m = avg(recent.filter((c) => c.part === "morning").map((c) => c.mood));
  const e = avg(recent.filter((c) => c.part === "evening").map((c) => c.mood));
  if (m != null && e != null && recent.filter((c) => c.part === "morning").length >= 2 && recent.filter((c) => c.part === "evening").length >= 2 && Math.abs(m - e) >= 0.5)
    out.push({ kind: "notice", text: m > e ? "Morgens geht es dir meist besser als abends. Eine Übung am Abend kann helfen." : "Abends geht es dir meist besser als morgens. Ein kurzer Start in den Tag kann helfen." });

  // was zieht runter
  const all = avg(recent.map((c) => c.mood));
  if (all != null) {
    const infl = new Map<string, number[]>();
    for (const c of recent) for (const i of c.influences) if (i !== "Nichts Bestimmtes") infl.set(i, [...(infl.get(i) ?? []), c.mood]);
    const low = [...infl].filter(([, xs]) => xs.length >= 2).map(([i, xs]) => [i, avg(xs)!] as const).sort((a, b) => a[1] - b[1])[0];
    if (low && all - low[1] >= 0.5) out.push({ kind: "notice", text: `Wenn dich „${low[0]}“ beschäftigt, geht es dir schlechter.` });
  }
  return out.slice(0, 4);
}
