/**
 * Punkte, Stufen und Abzeichen (rein, getestet in progress.test.ts). Belohnt wird Dranbleiben, nicht Leistung:
 * jeder Check-in, jede Minute Atmen, Tage in Folge. Keine Strafe, wenn man einen Tag auslässt.
 */
import type { CheckIn, Session } from "@/lib/types";
import { daysAgo, streak } from "@/lib/stats";

export const POINTS = { checkin: 10, perMinute: 2, completed: 5, streakDay: 5 } as const;

/** Punkte gesamt: Check-ins, Minuten, fertige Übungen und ein Bonus je Tag einer laufenden Serie (ab Tag 2) */
export function points(checkins: CheckIn[], sessions: Session[]): number {
  const c = checkins.length * POINTS.checkin;
  const s = sessions.reduce((n, x) => n + Math.floor(x.seconds / 60) * POINTS.perMinute + (x.completed ? POINTS.completed : 0), 0);
  return c + s + Math.max(0, longestRuns(activeDays(checkins, sessions)).reduce((n, r) => n + Math.max(0, r - 1), 0)) * POINTS.streakDay;
}

/** Punkte für eine einzelne Übung (für „+12 Punkte“ am Ende) */
export const sessionPoints = (seconds: number, completed: boolean) => Math.floor(seconds / 60) * POINTS.perMinute + (completed ? POINTS.completed : 0);

export const activeDays = (checkins: CheckIn[], sessions: Session[]) =>
  new Set([...checkins.map((c) => c.date), ...sessions.filter((s) => s.seconds >= 30).map((s) => s.date)]);

/** Längen aller Serien (aufeinanderfolgende Tage) */
function longestRuns(days: Set<string>): number[] {
  const runs: number[] = [];
  let run = 0, prev = "";
  for (const d of [...days].sort()) {
    if (prev && daysAgo(-1, new Date(`${prev}T12:00:00`)) === d) run++;
    else { if (run) runs.push(run); run = 1; }
    prev = d;
  }
  if (run) runs.push(run);
  return runs;
}
export const bestStreak = (checkins: CheckIn[], sessions: Session[]) => Math.max(0, ...longestRuns(activeDays(checkins, sessions)));

/** Stufen: ab diesen Punkten, mit ruhigen Namen */
export const LEVELS: { at: number; name: string }[] = [
  { at: 0, name: "Erster Atemzug" },
  { at: 60, name: "Angekommen" },
  { at: 180, name: "Dranbleiber" },
  { at: 400, name: "Ruhepol" },
  { at: 750, name: "Gelassen" },
  { at: 1250, name: "Atem-Profi" },
  { at: 2000, name: "Fels in der Brandung" },
  { at: 3000, name: "Meister der Ruhe" },
];
export function levelOf(p: number) {
  let i = 0;
  for (let k = 0; k < LEVELS.length; k++) if (p >= LEVELS[k].at) i = k;
  const next = LEVELS[i + 1];
  return { n: i + 1, name: LEVELS[i].name, next: next?.at, toNext: next ? next.at - p : 0, share: next ? (p - LEVELS[i].at) / (next.at - LEVELS[i].at) : 1 };
}

export type Badge = { id: string; title: string; text: string; now: number; goal: number; earned: boolean };

/** alle Abzeichen mit Fortschritt; neue = Eintrag hier (und ein Testfall) */
export function badges(checkins: CheckIn[], sessions: Session[], today = new Date()): Badge[] {
  const minutes = Math.round(sessions.reduce((n, x) => n + x.seconds, 0) / 60);
  const done = sessions.filter((s) => s.completed).length;
  const kinds = new Set(sessions.filter((s) => s.seconds >= 30 && s.exerciseId !== "timer").map((s) => s.exerciseId)).size;
  const best = Math.max(bestStreak(checkins, sessions), streak(checkins, sessions, today));
  const both = new Set(checkins.filter((c) => c.part === "morning").map((c) => c.date));
  const roundDays = checkins.filter((c) => c.part === "evening" && both.has(c.date)).map((c) => c.date);
  const better = checkins.filter((c) => c.moodAfter != null && c.moodAfter > c.mood).length;
  const timer = sessions.filter((s) => s.exerciseId === "timer" && s.seconds >= 60).length;
  const b = (id: string, title: string, text: string, now: number, goal: number): Badge => ({ id, title, text, now: Math.min(now, goal), goal, earned: now >= goal });
  return [
    b("first", "Erster Atemzug", "Deine erste Atemübung", done, 1),
    b("checkin1", "Hingespürt", "Dein erster Check-in", checkins.length, 1),
    b("streak3", "3 Tage in Folge", "Drei Tage hintereinander dabei", best, 3),
    b("streak7", "Eine ganze Woche", "Sieben Tage in Folge", best, 7),
    b("streak30", "Ein ganzer Monat", "30 Tage in Folge", best, 30),
    b("min60", "Eine Stunde Ruhe", "Insgesamt 60 Minuten geatmet", minutes, 60),
    b("min300", "Fünf Stunden Ruhe", "Insgesamt 300 Minuten geatmet", minutes, 300),
    b("kinds5", "Neugierig", "5 verschiedene Übungen ausprobiert", kinds, 5),
    b("kinds15", "Entdecker", "15 verschiedene Übungen ausprobiert", kinds, 15),
    b("checkin10", "Kennt sich gut", "10 Check-ins", checkins.length, 10),
    b("round", "Rund um den Tag", "Morgens und abends eingecheckt", new Set(roundDays).size, 1),
    b("better5", "Spürbar besser", "5-mal ging es dir nach dem Atmen besser", better, 5),
    b("timer", "Stille Zeit", "Den Timer genutzt", timer, 1),
  ];
}
