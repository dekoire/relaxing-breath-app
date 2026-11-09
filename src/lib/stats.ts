/**
 * Zahlen für „Heute“ und den Rückblick (rein, getestet in stats.test.ts): Minuten geatmet, Serie (mit einem Joker
 * je Woche wie in Notara), Stimmung vorher/nachher, häufigste Gefühle, Einflüsse und stoische Lehren.
 */
import type { CheckIn, Session } from "@/lib/types";

const iso = (d: Date) => d.toLocaleDateString("sv-SE");
export const daysAgo = (n: number, from = new Date()) => { const d = new Date(from); d.setDate(d.getDate() - n); return iso(d); };

/** Tage mit Übung oder Check-in in Folge bis heute; heute noch nichts = zählt ab gestern; ein Pausetag je 7 Tage wird verziehen */
export function streak(checkins: CheckIn[], sessions: Session[], today = new Date()): number {
  const days = new Set([...checkins.map((c) => c.date), ...sessions.filter((s) => s.seconds >= 30).map((s) => s.date)]);
  let n = 0, i = days.has(iso(today)) ? 0 : 1, jokers = 0;
  for (; i < 400; i++) {
    const d = daysAgo(i, today);
    if (days.has(d)) { n++; continue; }
    // Joker: ein fehlender Tag je angefangene Woche der Serie, wenn der Tag davor wieder zählt
    if (n > 0 && jokers < Math.floor(n / 7) + 1 && days.has(daysAgo(i + 1, today))) { jokers++; continue; }
    break;
  }
  return n;
}

export function dayStats(checkins: CheckIn[], sessions: Session[], date: string) {
  const s = sessions.filter((x) => x.date === date);
  const c = checkins.filter((x) => x.date === date);
  return { minutes: Math.round(s.reduce((n, x) => n + x.seconds, 0) / 60), exercises: s.filter((x) => x.completed).length, checkins: c.length, last: [...c].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] };
}

export function week(checkins: CheckIn[], sessions: Session[], today = new Date()) {
  return Array.from({ length: 7 }, (_, k) => {
    const date = daysAgo(6 - k, today);
    const c = checkins.filter((x) => x.date === date);
    const s = sessions.filter((x) => x.date === date);
    const mood = c.length ? c.reduce((n, x) => n + x.mood, 0) / c.length : undefined;
    return { date, mood, minutes: Math.round(s.reduce((n, x) => n + x.seconds, 0) / 60) };
  });
}

const count = (xs: string[]) => [...xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1]);

/** Rückblick über `days` Tage */
export function report(checkins: CheckIn[], sessions: Session[], days = 30, today = new Date()) {
  const from = daysAgo(days - 1, today);
  const c = checkins.filter((x) => x.date >= from);
  const s = sessions.filter((x) => x.date >= from);
  const withAfter = c.filter((x) => x.moodAfter != null);
  const lift = withAfter.length ? withAfter.reduce((n, x) => n + (x.moodAfter! - x.mood), 0) / withAfter.length : undefined;
  const avgMood = c.length ? c.reduce((n, x) => n + x.mood, 0) / c.length : undefined;
  const lessons = [...c].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).flatMap((x) => x.answers.filter((a) => a.a.trim()).map((a) => ({ ...a, date: x.date }))).slice(0, 6);
  return {
    checkins: c.length,
    minutes: Math.round(s.reduce((n, x) => n + x.seconds, 0) / 60),
    sessions: s.filter((x) => x.completed).length,
    avgMood,
    lift,
    emotions: count(c.flatMap((x) => x.emotions)).slice(0, 6),
    influences: count(c.flatMap((x) => x.influences).filter((x) => x !== "Nichts Bestimmtes")).slice(0, 5),
    body: count(c.flatMap((x) => x.body).filter((x) => x !== "nichts")).slice(0, 5),
    exercises: count(s.map((x) => x.exerciseId)).slice(0, 5),
    control: count(c.map((x) => x.control ?? "").filter(Boolean)),
    lessons,
  };
}
