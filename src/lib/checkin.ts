/**
 * Check-in „Wie geht's dir?“ – rein (ohne React), getestet in checkin.test.ts. Aufbau siehe docs/konzept.md:
 *
 *  1. Stimmung (angenehm ↔ unangenehm, wie „Gemütszustand“ in Apple Health)
 *  2. Energie (niedrig · mittel · hoch) → zusammen ein Feld des „Mood Meter“ (Yale, App „How We Feel“)
 *  3. Das passende Wort (Gefühle benennen senkt nachweislich ihre Wucht, „Affect Labeling“)
 *  4. Was spürst du im Körper? (Körperwahrnehmung, liefert Symptome für die Übung)
 *  5. Was beeinflusst dich? (wie Apple Health / Daylio: Muster über Wochen sichtbar machen)
 *  6. Stoisch: Liegt das in deiner Hand? (Epiktet) + eine Frage je Tageszeit (Morgen vorbereiten, Abend prüfen)
 *  7. Empfehlung: passende Atemübung → danach „Wie fühlst du dich jetzt?“ (vorher/nachher)
 */
import { EXERCISES, type Exercise } from "@/data/exercises";

export type Part = "morning" | "day" | "evening";
export type Energy = 1 | 2 | 3;
export type Quadrant = "angespannt" | "lebendig" | "schwer" | "ruhig";
export type Control = "ganz" | "teils" | "nicht";

export const MOODS: { v: number; label: string }[] = [
  { v: 1, label: "Sehr unangenehm" },
  { v: 2, label: "Unangenehm" },
  { v: 3, label: "Neutral" },
  { v: 4, label: "Angenehm" },
  { v: 5, label: "Sehr angenehm" },
];
export const ENERGY: { v: Energy; label: string; sub: string }[] = [
  { v: 1, label: "Wenig Energie", sub: "müde, schwer, leer" },
  { v: 2, label: "Mittel", sub: "weder noch" },
  { v: 3, label: "Viel Energie", sub: "aufgedreht, wach, unter Strom" },
];

export function quadrantOf(mood: number, energy: Energy): Quadrant {
  if (mood >= 4) return energy === 3 ? "lebendig" : energy === 1 ? "ruhig" : "lebendig";
  if (mood <= 2) return energy === 1 ? "schwer" : "angespannt";
  return energy === 3 ? "angespannt" : energy === 1 ? "schwer" : "ruhig";
}
export const QUADRANT: Record<Quadrant, { label: string; sub: string; goal: string[]; color: string }> = {
  angespannt: { label: "Angespannt", sub: "unangenehm, viel Energie", goal: ["ruhe", "stress"], color: "#8b6bff" },
  schwer: { label: "Schwer", sub: "unangenehm, wenig Energie", goal: ["balance", "energie"], color: "#6b6f86" },
  lebendig: { label: "Lebendig", sub: "angenehm, viel Energie", goal: ["fokus", "balance"], color: "#b9a6ff" },
  ruhig: { label: "Ruhig", sub: "angenehm, wenig Energie", goal: ["achtsam", "dankbar"], color: "#9a98b0" },
};

/** Gefühlswörter je Feld (Mood Meter), jedes mit Schlagwörtern für die Übung */
export const EMOTIONS: Record<Quadrant, { w: string; tags: string[] }[]> = {
  angespannt: [
    { w: "Gestresst", tags: ["stress"] }, { w: "Ängstlich", tags: ["angst"] }, { w: "Nervös", tags: ["unruhe"] },
    { w: "Gereizt", tags: ["wut"] }, { w: "Wütend", tags: ["wut"] }, { w: "Überfordert", tags: ["ueberfordert", "stress"] },
    { w: "Panisch", tags: ["panik"] }, { w: "Getrieben", tags: ["unruhe", "grübeln"] }, { w: "Besorgt", tags: ["angst", "grübeln"] },
  ],
  schwer: [
    { w: "Müde", tags: ["muede"] }, { w: "Traurig", tags: ["traurig"] }, { w: "Erschöpft", tags: ["muede", "ueberfordert"] },
    { w: "Lustlos", tags: ["muede", "traurig"] }, { w: "Einsam", tags: ["traurig"] }, { w: "Enttäuscht", tags: ["traurig"] },
    { w: "Leer", tags: ["muede", "traurig"] }, { w: "Niedergeschlagen", tags: ["traurig"] }, { w: "Gelangweilt", tags: ["muede"] },
  ],
  lebendig: [
    { w: "Motiviert", tags: ["fokus"] }, { w: "Fröhlich", tags: ["dankbar"] }, { w: "Aufgeregt", tags: ["unruhe"] },
    { w: "Neugierig", tags: ["fokus"] }, { w: "Stolz", tags: ["dankbar"] }, { w: "Energiegeladen", tags: ["energie"] },
    { w: "Hoffnungsvoll", tags: ["dankbar"] }, { w: "Konzentriert", tags: ["fokus"] }, { w: "Verliebt", tags: ["dankbar"] },
  ],
  ruhig: [
    { w: "Gelassen", tags: ["ruhe"] }, { w: "Zufrieden", tags: ["dankbar"] }, { w: "Dankbar", tags: ["dankbar"] },
    { w: "Entspannt", tags: ["ruhe"] }, { w: "Geborgen", tags: ["dankbar"] }, { w: "Ausgeglichen", tags: ["balance"] },
    { w: "Schläfrig", tags: ["schlaf"] }, { w: "Nachdenklich", tags: ["grübeln"] }, { w: "Erleichtert", tags: ["ruhe"] },
  ],
};
export const emotionTags = (words: string[]) => [...new Set(Object.values(EMOTIONS).flat().filter((e) => words.includes(e.w)).flatMap((e) => e.tags))];

export const BODY: { id: string; label: string; tags: string[] }[] = [
  { id: "herz", label: "Herzrasen", tags: ["herzrasen"] },
  { id: "brust", label: "Enge in der Brust", tags: ["enge"] },
  { id: "atem", label: "Flacher Atem", tags: ["kurzatmig"] },
  { id: "nacken", label: "Verspannter Nacken", tags: ["verspannt"] },
  { id: "kopf", label: "Kopfdruck", tags: ["kopfschmerz"] },
  { id: "bauch", label: "Flauer Bauch", tags: ["bauch"] },
  { id: "unruhe", label: "Innere Unruhe", tags: ["unruhe"] },
  { id: "schwer", label: "Schwere Glieder", tags: ["muede"] },
  { id: "hitze", label: "Hitze", tags: ["hitze"] },
  { id: "schmerz", label: "Schmerzen", tags: ["schmerz"] },
  { id: "nichts", label: "Nichts Besonderes", tags: [] },
];
export const bodyTags = (ids: string[]) => [...new Set(BODY.filter((b) => ids.includes(b.id)).flatMap((b) => b.tags))];

export const INFLUENCES = ["Arbeit", "Schule / Studium", "Beziehung", "Familie", "Freunde", "Gesundheit", "Schlaf", "Geld", "Zukunft", "Wetter", "Nachrichten", "Ich selbst", "Nichts Bestimmtes"];

/** Stoisch: Dichotomie der Kontrolle (Epiktet, Handbüchlein 1) – Antwort und ein Satz dazu */
export const CONTROL: { v: Control; label: string; reply: string }[] = [
  { v: "ganz", label: "Ja, das liegt bei mir", reply: "Dann ist es deine Aufgabe, nicht deine Last. Ein kleiner Schritt reicht für heute." },
  { v: "teils", label: "Teilweise", reply: "Trenne die Teile: Um deinen Teil kümmerst du dich, den Rest darfst du loslassen." },
  { v: "nicht", label: "Nein, eigentlich nicht", reply: "„Nicht die Dinge beunruhigen uns, sondern unsere Meinungen über die Dinge.“ (Epiktet) Was du ändern kannst, ist dein Blick darauf." },
];

export function partOf(d = new Date()): Part {
  const h = d.getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 18 || h < 3) return "evening";
  return "day";
}
export const PART_TITLE: Record<Part, string> = { morning: "Guten Morgen", day: "Kurz innehalten", evening: "Guten Abend" };

/* ---------- Stoische Fragen (aus Notara `stoic.ts`) ---------- */

export const VARIANTS: Record<string, string[]> = {
  intention: ["Worauf kommt es heute an? Nenn eine Sache, die du wirklich gut machen willst.", "Was ist heute das Eine, das zählt?", "Wenn heute nur eine Sache klappt: welche soll es sein?", "Wofür willst du dir heute am meisten Zeit nehmen?"],
  hard: ["Was könnte heute schwierig werden, und wie willst du dann reagieren?", "Wo könnte es heute haken, und was machst du dann?", "Was könnte dich heute aus der Ruhe bringen, und wie bleibst du gelassen?"],
  good: ["Was ist dir heute gelungen?", "Worauf bist du heute stolz?", "Was lief heute gut, auch wenn es klein war?"],
  behind: ["Wo bist du heute hinter dir zurückgeblieben?", "Was würdest du heute anders machen?", "Wo hast du heute nicht so gehandelt, wie du es willst?"],
  lesson: ["Was machst du morgen besser?", "Was nimmst du dir für morgen vor?", "Was willst du morgen anders angehen?"],
  day: ["Was beschäftigt dich gerade?", "Was geht dir gerade durch den Kopf?", "Was ist gerade wichtig für dich?"],
  gratitude: ["Wofür bist du heute dankbar?", "Was war heute ein kleiner guter Moment?", "Wem bist du gerade dankbar, und warum?"],
};
const dayNo = (iso: string) => Math.floor(new Date(`${iso}T12:00:00`).getTime() / 864e5);
const normQ = (x: string) => x.toLowerCase().replace(/[^a-zäöüß ]/g, "").trim();

/** eine Variante je Tag, nicht in den letzten drei Tagen gestellt */
export function vary(key: keyof typeof VARIANTS, history: { date: string; answers?: { q: string }[] }[], today: string): string {
  const list = VARIANTS[key];
  const recent = new Set(history.filter((e) => e.date < today && dayNo(today) - dayNo(e.date) <= 3).flatMap((e) => (e.answers ?? []).map((a) => normQ(a.q))));
  const start = dayNo(today) % list.length;
  for (let k = 0; k < list.length; k++) { const q = list[(start + k) % list.length]; if (!recent.has(normQ(q))) return q; }
  return list[start];
}

export type Length = "short" | "normal" | "long";
export const LENGTH: Record<Length, { label: string; sub: string; n: number }> = {
  short: { label: "Kurz", sub: "1 Frage", n: 1 },
  normal: { label: "Normal", sub: "2 Fragen", n: 2 },
  long: { label: "In Ruhe", sub: "3 Fragen", n: 3 },
};

/** stoische Fragen je Tageszeit, die wichtigsten zuerst; greift den Vorsatz vom Morgen bzw. die Lehre von gestern auf */
export function reflectQuestions(part: Part, history: CheckInLike[], length: Length, today: string): string[] {
  const v = (k: keyof typeof VARIANTS) => vary(k, history, today);
  const sorted = [...history].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const ans = (e: CheckInLike | undefined, key: string) => e?.answers?.find((a) => VARIANTS[key].includes(a.q))?.a?.trim();
  const morning = sorted.find((e) => e.date === today && e.part === "morning" && ans(e, "intention"));
  const lastEve = sorted.find((e) => e.date < today && e.part === "evening" && ans(e, "lesson"));
  let qs: string[];
  if (part === "morning") qs = [v("intention"), ...(lastEve ? [`Gestern Abend hast du dir vorgenommen: „${ans(lastEve, "lesson")}“. Wie setzt du das heute um?`] : []), v("hard"), v("gratitude")];
  else if (part === "evening") qs = [...(morning ? [`Heute Morgen wolltest du: „${ans(morning, "intention")}“. Wie ist es gelaufen?`] : [v("good")]), v("lesson"), v("behind"), v("gratitude")];
  else qs = [v("day"), v("gratitude"), v("good")];
  return qs.slice(0, LENGTH[length].n);
}

/* ---------- Empfehlung ---------- */

export type CheckInLike = { date: string; createdAt: string; part: Part; mood: number; energy?: Energy; answers?: { q: string; a: string }[] };
export type Input = { mood: number; energy: Energy; emotions: string[]; body: string[]; part: Part };
export type Pick = { exercise: Exercise; reason: string };

/**
 * Passende Übungen: Schlagwörter aus Gefühlswörtern und Körper zählen am meisten, dazu das Ziel des Feldes
 * (angespannt → beruhigen …) und die Tageszeit. Bei schlechter Stimmung keine Übungen für Fortgeschrittene und keine
 * stark aktivierenden. Ergebnis: die besten drei mit einem Satz, warum.
 */
export function recommend(i: Input, list: Exercise[] = EXERCISES): Pick[] {
  const q = quadrantOf(i.mood, i.energy);
  const feel = emotionTags(i.emotions), body = bodyTags(i.body), goal = QUADRANT[q].goal;
  const time = i.part === "morning" ? ["morgen"] : i.part === "evening" ? ["abend", "schlaf"] : ["buero"];
  const scored = list.map((e) => {
    let s = 0;
    const why: string[] = [];
    for (const t of body) if (e.tags.includes(t)) { s += 5; why.push(t); }
    for (const t of feel) if (e.tags.includes(t)) { s += 4; why.push(t); }
    for (const t of goal) if (e.tags.includes(t)) s += 2;
    for (const t of time) if (e.tags.includes(t)) s += 1.5;
    if (q === "angespannt" && (e.category === "akut" || e.category === "beruhigen")) s += 2;
    if (q === "angespannt" && e.category === "energie") s -= 6;
    if (q === "schwer" && (e.category === "energie" || e.category === "balance")) s += 1.5;
    if (i.mood <= 2 && e.level === "fortgeschritten") s -= 8;
    if (i.part === "evening" && e.category === "energie") s -= 4;
    if (i.part === "morning" && e.category === "schlafen") s -= 3;
    if (e.level === "leicht") s += 0.5;
    return { e, s, why };
  }).sort((a, b) => b.s - a.s || a.e.name.localeCompare(b.e.name));
  return scored.slice(0, 3).map(({ e, why }) => ({ exercise: e, reason: reasonText(e, why, q, i.part) }));
}

const TAG_SAY: Record<string, string> = {
  herzrasen: "gegen Herzrasen", enge: "wenn die Brust eng ist", kurzatmig: "wenn der Atem flach ist", verspannt: "löst Verspannung",
  kopfschmerz: "bei Kopfdruck", bauch: "beruhigt den Bauch", unruhe: "gegen Unruhe", muede: "gegen Müdigkeit", hitze: "kühlt",
  schmerz: "bei Schmerzen", stress: "gegen Stress", angst: "bei Angst", panik: "bei Panik", wut: "kühlt Wut ab",
  traurig: "wenn es schwer ist", ueberfordert: "wenn alles zu viel ist", grübeln: "gegen Grübeln", dankbar: "verstärkt Dankbarkeit",
  schlaf: "zum Einschlafen", fokus: "für Fokus", energie: "für Energie", ruhe: "zum Runterkommen", balance: "bringt in die Mitte",
};
function reasonText(e: Exercise, why: string[], q: Quadrant, part: Part): string {
  const first = why.find((t) => TAG_SAY[t]);
  if (first) return `${TAG_SAY[first][0].toUpperCase()}${TAG_SAY[first].slice(1)}: ${e.short}`;
  if (part === "evening" && e.tags.includes("schlaf")) return `Passt zum Abend: ${e.short}`;
  if (part === "morning" && e.tags.includes("morgen")) return `Guter Start in den Tag: ${e.short}`;
  return `Passt, wenn du dich ${QUADRANT[q].label.toLowerCase()} fühlst: ${e.short}`;
}

/** Hinweis auf Hilfe bei sehr schlechter Stimmung */
export const CRISIS = "Wenn es dir sehr schlecht geht: Die TelefonSeelsorge ist rund um die Uhr da, kostenlos und anonym: 0800 111 0 111 oder 0800 111 0 222. Im Notfall 112.";
