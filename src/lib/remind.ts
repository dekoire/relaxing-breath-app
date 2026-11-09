/**
 * Tägliche Erinnerung: morgens und/oder abends zu einer festen Uhrzeit. In der App fürs Handy über lokale
 * Mitteilungen (kommen auch, wenn die App zu ist), im Browser nur, solange die App offen ist (`RemindWatcher`).
 * Text wechselt und nennt die Serie (rein: `reminderText`, getestet).
 */
export type Remind = { on: boolean; morning: boolean; evening: boolean; mTime: string; eTime: string };
export const DEFAULT_REMIND: Remind = { on: false, morning: true, evening: true, mTime: "08:00", eTime: "21:00" };

const MORNING = ["Guten Morgen. Wie geht's dir heute?", "Ein Atemzug für den Start in den Tag?", "Zwei Minuten für dich, bevor es losgeht?"];
const EVENING = ["Wie war dein Tag? Kurz nachspüren?", "Zeit zum Runterkommen. Eine Atemübung?", "Lass den Tag mit einem ruhigen Atemzug enden."];

export function reminderText(part: "morning" | "evening", streak: number, day: number): { title: string; body: string } {
  const list = part === "morning" ? MORNING : EVENING;
  const title = list[day % list.length];
  const body = streak >= 2 ? `Du bist ${streak} Tage in Folge dabei. Bleib dran.` : "Ein paar Minuten reichen schon.";
  return { title, body };
}
