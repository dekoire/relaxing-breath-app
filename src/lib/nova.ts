/**
 * Nova fragt, was du gerade brauchst (rein, getestet in nova.test.ts). Ohne Server: ein kurzes Gespräch mit festen
 * Fragen, am Ende IMMER eine Empfehlung. Schaut, was du heute schon gemacht hast, und entscheidet, ob noch etwas
 * sinnvoll ist oder ob eine kurze, sanfte Übung reicht. Fokus: Beruhigung, Wohlbefinden, Haltung.
 */
import { EXERCISES, exerciseById, tagsFor, type Exercise } from "@/data/exercises";

export type NeedId = "ruhe" | "schlaf" | "fokus" | "energie" | "kopf" | "koerper";
export const NEEDS: { id: NeedId; label: string; tags: string[]; say: string }[] = [
  { id: "ruhe", label: "Runterkommen", tags: ["stress", "ruhe", "unruhe", "angst"], say: "Okay. Dann bringen wir deinen Körper zur Ruhe. Das lange Ausatmen hilft am schnellsten." },
  { id: "schlaf", label: "Einschlafen", tags: ["schlaf", "nachts", "abend"], say: "Verstehe. Wir machen es dir leicht, schwer zu werden. Du musst nichts erzwingen." },
  { id: "fokus", label: "Konzentrieren", tags: ["fokus", "pruefung", "buero"], say: "Gut. Ein ruhiger, gleichmäßiger Takt macht den Kopf klar, ohne müde zu machen." },
  { id: "energie", label: "Wach werden", tags: ["energie", "morgen", "muede"], say: "Alles klar. Wir holen etwas Energie, kräftig, aber sicher." },
  { id: "kopf", label: "Gedanken sortieren", tags: ["grübeln", "stoisch", "ueberfordert"], say: "Das kenne ich. Lass uns trennen, was in deiner Hand liegt und was nicht." },
  { id: "koerper", label: "Verspannung lösen", tags: ["verspannt", "nacken", "kopfschmerz", "schmerz"], say: "Okay. Wir atmen dahin, wo es fest ist, und lassen es mit jedem Ausatmen etwas weicher werden." },
];

/** Gedanken für die Haltung (ruhig, ohne Fachwörter) */
export const THOUGHTS = [
  "Du musst nicht alles heute lösen. Ein Schritt reicht.",
  "Was in deiner Hand liegt, darfst du anpacken. Den Rest darfst du loslassen.",
  "Gefühle kommen und gehen wie Wellen. Du bist das Meer, nicht die Welle.",
  "Nicht die Dinge selbst beunruhigen uns, sondern wie wir über sie denken.",
  "Ruhe ist keine Belohnung für erledigte Arbeit. Du darfst sie dir jetzt nehmen.",
];

export type Today = { minutes: number; doneIds: string[]; part: "morning" | "day" | "evening" };

/** Begrüßung je nachdem, was heute schon war */
export function greeting(t: Today): string {
  const hi = t.part === "morning" ? "Guten Morgen." : t.part === "evening" ? "Guten Abend." : "Hallo.";
  if (t.minutes >= 30) return `${hi} Du hast heute schon ${t.minutes} Minuten geatmet. Das ist richtig viel. Wie geht es dir gerade?`;
  if (t.minutes > 0) return `${hi} Schön, dass du wieder da bist. Heute warst du schon ${t.minutes} ${t.minutes === 1 ? "Minute" : "Minuten"} dabei. Was brauchst du jetzt?`;
  return `${hi} Ich bin Nova. Erzähl mir kurz, was du gerade brauchst. Ich suche dir die passende Übung.`;
}

/** freier Text → Bedürfnis (Wörter wie „gestresst“, „kann nicht schlafen“, „Prüfung“) */
export function needOf(text: string): NeedId | undefined {
  const tags = tagsFor(text);
  const t = text.toLowerCase();
  if (/schlaf|müde ins bett|wach lieg|nacht/.test(t)) return "schlaf";
  if (/konzentr|fokus|lernen|prüfung|arbeit|meeting/.test(t)) return "fokus";
  if (/grübel|gedanken|kopf voll|sorgen|überfordert|sinn/.test(t)) return "kopf";
  if (/verspann|nacken|rücken|kopfschmerz|schmerz/.test(t)) return "koerper";
  if (/energie|schlapp|antrieb|wach werden|motiv/.test(t)) return "energie";
  if (/stress|unruh|angst|panik|nervös|wut|ruhig/.test(t)) return "ruhe";
  return NEEDS.find((n) => n.tags.some((x) => tags.includes(x)))?.id;
}

export type Advice = { exercise: Exercise; text: string; thought: string; short: boolean };

/**
 * Empfehlung: passende Schlagwörter, bevorzugt etwas Neues von heute, abends nichts Aktivierendes.
 * Wer heute schon viel geatmet hat (≥ 30 Min.), bekommt bewusst nur etwas Kurzes und Sanftes.
 */
export function advise(need: NeedId, minutesAvailable: number, t: Today, seed = 0): Advice {
  const n = NEEDS.find((x) => x.id === need)!;
  const much = t.minutes >= 30;
  const calm = t.part === "evening" || need === "schlaf" || need === "ruhe";
  const ranked = EXERCISES.map((e) => {
    let s = e.tags.filter((x) => n.tags.includes(x)).length * 3;
    if (t.doneIds.includes(e.id)) s -= 2;
    if (calm && e.level === "fortgeschritten") s -= 6;
    if (e.evidence === "stark" || e.evidence === "gut") s += 1;
    if (e.minutes > minutesAvailable && !e.rounds) s -= 1;
    if (much && (e.level === "fortgeschritten" || e.minutes > 3)) s -= 3;
    return { e, s };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  const exercise = ranked[seed % Math.max(1, Math.min(3, ranked.length))]?.e ?? exerciseById("laenger-aus")!;
  const text = much
    ? `Du hast heute schon viel für dich getan. Mehr ist nicht nötig. Wenn du magst, nur kurz: „${exercise.name}“.`
    : `${n.say} Ich empfehle dir „${exercise.name}“.`;
  return { exercise, text, thought: THOUGHTS[(seed + need.length) % THOUGHTS.length], short: much };
}
