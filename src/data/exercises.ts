/**
 * Bibliothek der Atemübungen. Rein (ohne React/Browser), getestet in exercises.test.ts.
 *
 * Aufbau einer Übung: ein Zyklus aus Blöcken (`cycle`), jeder Block aus Phasen (Ein · Nachatmen · Halten · Aus · Pause),
 * der Block läuft `repeat`-mal. Einfache Muster haben einen Block. So gehen auch Programme wie „30× schnell, dann
 * erholen“ (Kapalabhati) oder die Einschlaf-Leiter (Ausatmen wird von Runde zu Runde länger).
 *
 * Schlagwörter (`tags`) kommen aus `TAGS` (Gefühl, Körper, Ziel, Situation) – daraus entstehen Suche, Filter und die
 * Empfehlung nach dem Check-in. Keine Heilversprechen: Texte sagen, wobei eine Übung helfen KANN.
 */

export type PhaseKind = "in" | "in2" | "hold" | "out" | "rest";
export type Phase = {
  kind: PhaseKind;
  /** Sekunden */
  s: number;
  /** eigenes Wort statt „Einatmen“ (z. B. „Links einatmen“, „Summend ausatmen“) */
  cue?: string;
  /** kleine Zeile darunter (z. B. „durch die Nase“) */
  hint?: string;
};
export type Block = { phases: Phase[]; repeat: number; /** Name des Abschnitts, z. B. „Schnell ausstoßen“ */ label?: string };

export type Category = "beruhigen" | "schlafen" | "fokus" | "energie" | "balance" | "koerper" | "akut";
export type Level = "leicht" | "mittel" | "fortgeschritten";
export type Motif = "flower" | "wave" | "moon" | "sun" | "square" | "triangle" | "circle" | "drop" | "leaf" | "flame" | "mountain" | "spiral" | "heart" | "bee" | "lungs" | "hand" | "stairs";

export type Exercise = {
  id: string;
  name: string;
  /** eine Zeile auf der Karte */
  short: string;
  /** warum es wirkt, 1–3 Sätze */
  why: string;
  /** so geht's, kurze Schritte */
  how: string[];
  cycle: Block[];
  /** Vorgabe-Dauer in Minuten (wird in ganze Runden umgerechnet) */
  minutes: number;
  /** feste Anzahl Runden statt Dauer (z. B. Physiologischer Seufzer: 5 Runden) */
  rounds?: number;
  category: Category;
  level: Level;
  tags: string[];
  /** Hinweis zur Vorsicht (wird vor dem Start gezeigt) */
  caution?: string;
  /** gesprochene Einleitung */
  intro: string;
  /** je Runde ein anderer Gedanke (Body-Scan, Dankbarkeit, 5-4-3-2-1) */
  roundCues?: string[];
  /** Atemzüge zählen (Zen): das Wort beim Ausatmen ist die Zahl 1–10 */
  count?: boolean;
  /** Bild (später echte Fotos über `image`) */
  art: { from: string; to: string; motif: Motif };
  image?: string;
  /** wie gut erforscht: stark (mehrere Studien/Übersichten) · gut (gute Einzelstudien) · erste (erste kleine Studien) */
  evidence?: Evidence;
  /** kurze Quelle, z. B. „Balban et al., 2023“ */
  study?: string;
};
export type Evidence = "stark" | "gut" | "erste";
export const EVIDENCE_LABEL: Record<Evidence, string> = { stark: "Sehr gut erforscht", gut: "Gut erforscht", erste: "Erste Studien" };

/* ---------- Schlagwörter: Gefühl, Körper, Ziel, Situation ---------- */

export type TagGroup = "gefuehl" | "koerper" | "ziel" | "situation";
export type Tag = { id: string; label: string; group: TagGroup; /** Suchwörter, die auch dazu passen */ words: string[] };

export const TAGS: Tag[] = [
  // Gefühl
  { id: "stress", label: "Gestresst", group: "gefuehl", words: ["stress", "gestresst", "druck", "hektik", "angespannt", "anspannung"] },
  { id: "angst", label: "Ängstlich", group: "gefuehl", words: ["angst", "ängstlich", "sorge", "sorgen", "besorgt", "furcht"] },
  { id: "panik", label: "Panik", group: "gefuehl", words: ["panik", "panikattacke", "attacke", "kontrollverlust"] },
  { id: "unruhe", label: "Unruhig", group: "gefuehl", words: ["unruhe", "unruhig", "nervös", "nervositaet", "nervosität", "zappelig", "rastlos"] },
  { id: "wut", label: "Wütend", group: "gefuehl", words: ["wut", "wütend", "ärger", "ärgerlich", "sauer", "gereizt", "genervt", "frust", "frustriert", "aggressiv"] },
  { id: "traurig", label: "Traurig", group: "gefuehl", words: ["traurig", "trauer", "niedergeschlagen", "down", "schwer", "melancholisch", "einsam", "einsamkeit"] },
  { id: "ueberfordert", label: "Überfordert", group: "gefuehl", words: ["überfordert", "überforderung", "zu viel", "alles zu viel", "überlastet"] },
  { id: "grübeln", label: "Grübeln", group: "gefuehl", words: ["grübeln", "gedankenkarussell", "gedanken", "kopf voll", "kopf zu voll", "gedankenkreisen", "zerdenken"] },
  { id: "muede", label: "Müde", group: "gefuehl", words: ["müde", "erschöpft", "erschöpfung", "schlapp", "kraftlos", "energielos", "antriebslos"] },
  { id: "einsam", label: "Einsam", group: "gefuehl", words: ["einsam", "einsamkeit", "allein", "alleine", "verlassen"] },
  { id: "trauer", label: "Trauer", group: "gefuehl", words: ["trauer", "trauern", "verlust", "abschied", "liebeskummer", "trennung"] },
  { id: "ausgebrannt", label: "Ausgebrannt", group: "gefuehl", words: ["burnout", "ausgebrannt", "leer", "am ende", "keine kraft"] },
  { id: "aufgeregt", label: "Aufgeregt", group: "gefuehl", words: ["aufgeregt", "aufregung", "hibbelig", "vorfreude", "kribbeln"] },
  { id: "ungeduld", label: "Ungeduldig", group: "gefuehl", words: ["ungeduld", "ungeduldig", "warten", "genervt vom warten"] },
  { id: "dankbar", label: "Dankbar", group: "gefuehl", words: ["dankbar", "dankbarkeit", "glücklich", "zufrieden", "freude"] },
  // Körper
  { id: "herzrasen", label: "Herzrasen", group: "koerper", words: ["herzrasen", "herzklopfen", "puls", "herz", "schneller puls"] },
  { id: "enge", label: "Enge in der Brust", group: "koerper", words: ["enge", "brust", "druck auf der brust", "beklemmung", "kloß"] },
  { id: "kurzatmig", label: "Kurzatmig", group: "koerper", words: ["kurzatmig", "atemnot", "luftnot", "flacher atem", "keine luft", "hyperventilieren", "hyperventilation"] },
  { id: "verspannt", label: "Verspannt", group: "koerper", words: ["verspannt", "verspannung", "nacken", "schultern", "rücken", "kiefer", "zähne"] },
  { id: "kopfschmerz", label: "Kopfdruck", group: "koerper", words: ["kopfschmerz", "kopfschmerzen", "kopfdruck", "migräne", "spannungskopfschmerz"] },
  { id: "bauch", label: "Flaues Gefühl im Bauch", group: "koerper", words: ["bauch", "magen", "flau", "übelkeit", "übel", "bauchweh"] },
  { id: "hitze", label: "Hitze", group: "koerper", words: ["hitze", "heiß", "warm", "schwitzen", "hitzewallung"] },
  { id: "schmerz", label: "Schmerz", group: "koerper", words: ["schmerz", "schmerzen", "weh", "regelschmerz", "rückenschmerz"] },
  { id: "nacken", label: "Nackenverspannung", group: "koerper", words: ["nacken", "nackenverspannung", "steifer nacken", "schulter", "schultern", "verspannte schultern"] },
  { id: "ruecken", label: "Rückenschmerzen", group: "koerper", words: ["rücken", "rückenschmerzen", "kreuz", "hexenschuss", "lendenwirbel"] },
  { id: "uebelkeit", label: "Übelkeit", group: "koerper", words: ["übelkeit", "übel", "reiseübelkeit", "seekrank", "brechreiz", "schlecht im magen"] },
  { id: "schwindel", label: "Schwindel", group: "koerper", words: ["schwindel", "schwindelig", "benommen", "kribbeln in den händen"] },
  { id: "zittern", label: "Zittern", group: "koerper", words: ["zittern", "zittrig", "wackelige knie", "adrenalin"] },
  { id: "hitzewallung", label: "Hitzewallungen", group: "koerper", words: ["hitzewallung", "hitzewallungen", "wechseljahre", "menopause", "schweißausbruch"] },
  { id: "blutdruck", label: "Hoher Blutdruck", group: "koerper", words: ["blutdruck", "bluthochdruck", "hypertonie", "hoher puls"] },
  { id: "regel", label: "Regelschmerzen", group: "koerper", words: ["regelschmerzen", "periode", "menstruation", "krämpfe", "unterleib"] },
  // Ziel
  { id: "schlaf", label: "Einschlafen", group: "ziel", words: ["schlaf", "schlafen", "einschlafen", "durchschlafen", "schlaflos", "nacht", "bett", "insomnie"] },
  { id: "fokus", label: "Fokus", group: "ziel", words: ["fokus", "konzentration", "konzentrieren", "klar", "klarheit", "lernen", "arbeiten"] },
  { id: "energie", label: "Energie", group: "ziel", words: ["energie", "wach", "aufwachen", "munter", "power", "antrieb", "mittagstief"] },
  { id: "ruhe", label: "Ruhe finden", group: "ziel", words: ["ruhe", "entspannen", "entspannung", "runterkommen", "abschalten", "gelassen", "gelassenheit", "beruhigen"] },
  { id: "balance", label: "Gleichgewicht", group: "ziel", words: ["balance", "gleichgewicht", "ausgleich", "mitte", "zentrieren", "erden", "geerdet"] },
  { id: "achtsam", label: "Achtsamkeit", group: "ziel", words: ["achtsam", "achtsamkeit", "meditation", "meditieren", "präsent", "im moment"] },
  { id: "erholung", label: "Erholung", group: "ziel", words: ["erholung", "erholen", "regeneration", "auftanken", "kraft sammeln"] },
  { id: "stoisch", label: "Gelassenheit (stoisch)", group: "ziel", words: ["stoisch", "stoiker", "stoa", "kontrolle", "loslassen", "akzeptieren", "seneca", "marc aurel", "epiktet"] },
  // Situation
  { id: "pruefung", label: "Prüfung", group: "situation", words: ["prüfung", "klausur", "test", "examen", "bewerbung", "vorstellungsgespräch"] },
  { id: "auftritt", label: "Auftritt", group: "situation", words: ["auftritt", "präsentation", "vortrag", "rede", "lampenfieber", "meeting", "bühne"] },
  { id: "buero", label: "Im Büro", group: "situation", words: ["büro", "arbeit", "schreibtisch", "pause", "job", "homeoffice", "unauffällig", "leise"] },
  { id: "morgen", label: "Am Morgen", group: "situation", words: ["morgen", "morgens", "aufstehen", "start", "tagesbeginn"] },
  { id: "abend", label: "Am Abend", group: "situation", words: ["abend", "abends", "feierabend", "tagesende"] },
  { id: "sport", label: "Sport", group: "situation", words: ["sport", "training", "laufen", "joggen", "erholung", "regeneration"] },
  { id: "unterwegs", label: "Unterwegs", group: "situation", words: ["unterwegs", "bahn", "zug", "flugzeug", "flugangst", "fliegen", "stau", "warten", "gehen", "spazieren"] },
  { id: "geburt", label: "Geburt & Wehen", group: "situation", words: ["geburt", "wehen", "entbindung", "kreißsaal", "presswehen", "geburtsvorbereitung"] },
  { id: "schwanger", label: "Schwangerschaft", group: "situation", words: ["schwanger", "schwangerschaft", "baby im bauch", "werdende mutter"] },
  { id: "arzt", label: "Arzt & Zahnarzt", group: "situation", words: ["arzt", "zahnarzt", "krankenhaus", "op", "operation", "untersuchung", "mrt", "wartezimmer"] },
  { id: "spritze", label: "Spritze & Blutabnahme", group: "situation", words: ["spritze", "impfung", "blutabnahme", "nadel", "piks"] },
  { id: "streit", label: "Nach einem Streit", group: "situation", words: ["streit", "konflikt", "auseinandersetzung", "beleidigt", "verletzt"] },
  { id: "albtraum", label: "Nach einem Albtraum", group: "situation", words: ["albtraum", "alptraum", "schlecht geträumt", "aufgeschreckt"] },
  { id: "nachts", label: "Nachts wach", group: "situation", words: ["nachts wach", "aufgewacht", "kann nicht wieder einschlafen", "3 uhr", "durchschlafen"] },
  { id: "auto", label: "Im Auto", group: "situation", words: ["auto", "autofahren", "stau", "fahrstunde", "rote ampel"] },
  { id: "verlangen", label: "Verlangen & Sucht", group: "situation", words: ["rauchen", "zigarette", "rauchverlangen", "heißhunger", "süßes", "craving", "sucht", "handy weglegen", "alkohol"] },
  { id: "eltern", label: "Stress mit Kindern", group: "situation", words: ["eltern", "kinder schreien", "trotzanfall", "baby schreit", "mama", "papa"] },
  { id: "kinder", label: "Für Kinder", group: "situation", words: ["kind", "kinder", "familie", "spielerisch"] },
];
export const tagOf = (id: string) => TAGS.find((t) => t.id === id);
export const TAG_GROUP_LABEL: Record<TagGroup, string> = { gefuehl: "Gefühl", koerper: "Körper", ziel: "Ziel", situation: "Situation" };

export const CATEGORIES: { id: Category; label: string; sub: string; from: string; to: string }[] = [
  { id: "akut", label: "Sofort-Hilfe", sub: "In 1 Minute ruhiger", from: "#6d4aff", to: "#2a1a7a" },
  { id: "beruhigen", label: "Beruhigen", sub: "Runterfahren, loslassen", from: "#7c6cf2", to: "#2f2a6b" },
  { id: "schlafen", label: "Schlafen", sub: "Schwer werden, einschlafen", from: "#3b3f8f", to: "#121433" },
  { id: "fokus", label: "Fokus", sub: "Klar und konzentriert", from: "#4b5563", to: "#111827" },
  { id: "energie", label: "Energie", sub: "Wach werden, aufladen", from: "#b18cff", to: "#5b2bd6" },
  { id: "balance", label: "Balance", sub: "In die Mitte kommen", from: "#8e8aa8", to: "#36334a" },
  { id: "koerper", label: "Körper", sub: "Verspannung lösen, spüren", from: "#9a7cf0", to: "#3a2a70" },
];
export const categoryOf = (id: Category) => CATEGORIES.find((c) => c.id === id)!;

/* ---------- Bausteine ---------- */

const p = (kind: PhaseKind, s: number, cue?: string, hint?: string): Phase => ({ kind, s, ...(cue ? { cue } : {}), ...(hint ? { hint } : {}) });
const simple = (...phases: Phase[]): Block[] => [{ phases, repeat: 1 }];
const NOSE = "durch die Nase";
const MOUTH = "langsam, durch den Mund";

/* ---------- Die Übungen ---------- */

export const EXERCISES: Exercise[] = [
  // ——— Sofort-Hilfe ———
  {
    id: "seufzer",
    name: "Physiologischer Seufzer",
    short: "Zweimal ein, lang aus. Der schnellste Weg runter.",
    why: "Das doppelte Einatmen öffnet die Lungenbläschen wieder, das lange Ausatmen bremst über den Vagusnerv den Puls. In Studien (Stanford, 2023) senkte schon wenige Minuten am Tag Stress spürbar.",
    how: ["Tief durch die Nase einatmen", "Oben noch einen kleinen Schluck nachatmen", "Ganz lang durch den Mund ausatmen"],
    cycle: simple(p("in", 2.5, undefined, NOSE), p("in2", 1, "Noch ein Schluck", "oben nachatmen"), p("out", 6, undefined, MOUTH)),
    minutes: 1, rounds: 6,
    category: "akut", level: "leicht",
    tags: ["stress", "panik", "angst", "herzrasen", "enge", "ueberfordert", "ruhe", "buero", "auftritt"],
    intro: "Wir machen den physiologischen Seufzer. Zweimal einatmen, einmal lang aus. Das bremst deinen Körper sofort.",
    art: { from: "#7b5cff", to: "#2a1a7a", motif: "lungs" },
  },
  {
    id: "erden-54321",
    name: "Erden 5 · 4 · 3 · 2 · 1",
    short: "Atmen und die Sinne einsammeln. Hilft bei Panik.",
    why: "Wenn die Angst hochfährt, holt dich das Benennen von Dingen um dich herum zurück ins Jetzt. Ruhiges Ausatmen dazu senkt die Erregung.",
    how: ["Ruhig einatmen", "Beim Ausatmen in Gedanken benennen, was du gerade wahrnimmst", "Jede Runde ein anderer Sinn"],
    cycle: simple(p("in", 4, undefined, NOSE), p("out", 7, "Ausatmen und benennen")),
    minutes: 2, rounds: 6,
    category: "akut", level: "leicht",
    tags: ["panik", "angst", "unruhe", "grübeln", "balance", "achtsam"],
    roundCues: ["Fünf Dinge, die du siehst", "Vier Dinge, die du fühlst", "Drei Dinge, die du hörst", "Zwei Dinge, die du riechst", "Eine Sache, die du schmeckst", "Spür deine Füße am Boden"],
    intro: "Lass uns dich erden. Wir atmen ruhig, und beim Ausatmen sammelst du ein, was um dich herum ist.",
    art: { from: "#8b7bb8", to: "#2d2840", motif: "mountain" },
  },
  {
    id: "buero-reset",
    name: "Unauffällig im Büro",
    short: "60 Sekunden, niemand merkt was. Ideal mit Vibration.",
    why: "Leises Nasenatmen mit längerem Ausatmen beruhigt, ohne dass man es sieht oder hört. Mit der Vibration in der Hosentasche brauchst du nicht mal auf den Bildschirm.",
    how: ["Durch die Nase ein", "Durch die Nase länger aus", "Schultern dabei sinken lassen"],
    cycle: simple(p("in", 4, undefined, NOSE), p("out", 6, undefined, "leise, durch die Nase")),
    minutes: 1,
    category: "akut", level: "leicht",
    tags: ["buero", "stress", "unruhe", "auftritt", "ruhe", "verspannt"],
    intro: "Eine Minute nur für dich. Durch die Nase ein, durch die Nase länger aus.",
    art: { from: "#5c5f6e", to: "#1b1c22", motif: "circle" },
  },
  {
    id: "lippenbremse",
    name: "Lippenbremse",
    short: "Gegen das Gefühl, keine Luft zu bekommen.",
    why: "Durch gespitzte Lippen ausatmen hält die Atemwege länger offen. Der Atem wird langsamer und tiefer, das Gefühl von Luftnot lässt nach.",
    how: ["Durch die Nase einatmen", "Lippen spitzen wie zum Pfeifen", "Doppelt so lang sanft ausatmen"],
    cycle: simple(p("in", 2.5, undefined, NOSE), p("out", 5, "Durch die Lippen aus", "wie durch einen Strohhalm")),
    minutes: 2,
    category: "akut", level: "leicht",
    tags: ["kurzatmig", "panik", "angst", "sport", "enge", "unterwegs"],
    caution: "Bei echter Atemnot oder Schmerzen in der Brust: bitte ärztliche Hilfe holen (112).",
    intro: "Wir atmen mit der Lippenbremse. Ein durch die Nase, dann langsam durch die gespitzten Lippen aus.",
    art: { from: "#7f6ad6", to: "#2a2156", motif: "drop" },
  },

  // ——— Beruhigen ———
  {
    id: "laenger-aus",
    name: "Länger aus 4 · 6",
    short: "Der Klassiker: länger aus als ein beruhigt.",
    why: "Beim Ausatmen wird der Herzschlag etwas langsamer. Ist das Ausatmen länger als das Einatmen, überwiegt die Ruhe.",
    how: ["4 Sekunden ein", "6 Sekunden aus", "Ohne Pause dazwischen"],
    cycle: simple(p("in", 4, undefined, NOSE), p("out", 6, undefined, MOUTH)),
    minutes: 3,
    category: "beruhigen", level: "leicht",
    tags: ["stress", "unruhe", "ruhe", "ueberfordert", "buero", "abend", "angst"],
    intro: "Wir atmen länger aus als ein. Das beruhigt. Lass die Schultern sinken.",
    art: { from: "#8c6cff", to: "#33207a", motif: "flower" },
  },
  {
    id: "478",
    name: "4 · 7 · 8 Atmung",
    short: "Halten und lang ausatmen. Hilft bei Unruhe.",
    why: "Das Halten verlangsamt den Atem, das lange Ausatmen beruhigt das Nervensystem. Bekannt gemacht von Dr. Andrew Weil als „natürliches Beruhigungsmittel“.",
    how: ["4 Sekunden durch die Nase ein", "7 Sekunden halten", "8 Sekunden hörbar durch den Mund aus"],
    cycle: simple(p("in", 4, undefined, NOSE), p("hold", 7), p("out", 8, undefined, MOUTH)),
    minutes: 3,
    category: "beruhigen", level: "mittel",
    tags: ["angst", "unruhe", "schlaf", "panik", "grübeln", "ruhe", "abend"],
    caution: "Wird dir schwindelig, atme ein paar Runden normal und mach dann weiter.",
    intro: "Wir atmen vier, sieben, acht. Wir halten kurz und atmen lange aus. Mach es dir bequem.",
    art: { from: "#6a5af9", to: "#1f1a5c", motif: "moon" },
  },
  {
    id: "bienen",
    name: "Bienen-Atmung",
    short: "Summend ausatmen. Der Kopf wird still.",
    why: "Das Summen (Bhramari) verlängert das Ausatmen von selbst und vibriert sanft im Kopf. Viele erleben danach weniger Gedankenlärm.",
    how: ["Durch die Nase einatmen", "Mund zu, beim Ausatmen leise summen wie eine Biene", "Optional: Ohren mit den Daumen verschließen"],
    cycle: simple(p("in", 4, undefined, NOSE), p("out", 8, "Summend ausatmen", "mmmmm …")),
    minutes: 3,
    category: "beruhigen", level: "leicht",
    tags: ["grübeln", "unruhe", "wut", "stress", "schlaf", "kopfschmerz", "achtsam"],
    intro: "Wir machen die Bienen-Atmung. Einatmen, und beim Ausatmen leise summen.",
    art: { from: "#a68bff", to: "#3a2878", motif: "bee" },
  },
  {
    id: "dreieck",
    name: "Dreieck 4 · 4 · 4",
    short: "Ein, halten, aus. Einfach und ruhig.",
    why: "Drei gleich lange Teile geben dem Kopf etwas zum Festhalten. Gut für Einsteiger, die die Box zu lang finden.",
    how: ["4 ein", "4 halten", "4 aus"],
    cycle: simple(p("in", 4, undefined, NOSE), p("hold", 4), p("out", 4)),
    minutes: 3,
    category: "beruhigen", level: "leicht",
    tags: ["stress", "unruhe", "fokus", "ruhe", "achtsam"],
    intro: "Wir atmen im Dreieck. Ein, halten, aus. Jeweils vier.",
    art: { from: "#7869c9", to: "#262046", motif: "triangle" },
  },
  {
    id: "eins-zu-zwei",
    name: "1 : 2 Atmung",
    short: "Doppelt so lang aus wie ein.",
    why: "Das Verhältnis 1 zu 2 gilt im Yoga als stärkste Beruhigung ohne Halten. Gut, wenn Halten unangenehm ist.",
    how: ["3 Sekunden ein", "6 Sekunden aus", "Weich und ohne Druck"],
    cycle: simple(p("in", 3, undefined, NOSE), p("out", 6, undefined, MOUTH)),
    minutes: 3,
    category: "beruhigen", level: "leicht",
    tags: ["angst", "stress", "ruhe", "herzrasen", "abend"],
    intro: "Wir atmen doppelt so lang aus wie ein. Ganz ohne Halten.",
    art: { from: "#9483ff", to: "#2c2266", motif: "wave" },
  },
  {
    id: "wut-abkuehlen",
    name: "Wut abkühlen",
    short: "Fäuste ballen, Hände öffnen, ausatmen.",
    why: "Die Spannung bewusst aufbauen und loslassen nimmt dem Ärger die Wucht. Das lange Ausatmen holt den Körper aus dem Kampfmodus.",
    how: ["Einatmen und die Hände zur Faust ballen", "Kurz halten", "Ausatmen und die Hände weit öffnen"],
    cycle: simple(p("in", 4, "Einatmen, Fäuste ballen"), p("hold", 2, "Spannung halten"), p("out", 7, "Ausatmen, Hände öffnen", "lass los")),
    minutes: 2,
    category: "beruhigen", level: "leicht",
    tags: ["wut", "stress", "verspannt", "ueberfordert"],
    intro: "Lass uns die Wut abkühlen. Beim Einatmen ballst du die Fäuste, beim Ausatmen lässt du los.",
    art: { from: "#7b5cff", to: "#341a5e", motif: "flame" },
  },
  {
    id: "kuehlen",
    name: "Kühlende Atmung",
    short: "Durch die gerollte Zunge ein. Kühlt Hitze und Ärger.",
    why: "Sitali-Atmung kühlt die einströmende Luft über die feuchte Zunge. Im Yoga gegen Hitze, Gereiztheit und hitzige Gedanken.",
    how: ["Zunge zu einem Röhrchen rollen (oder Zähne leicht aufeinander)", "Durch die Zunge einatmen, kühl", "Mund zu, durch die Nase aus"],
    cycle: simple(p("in", 4, "Durch die Zunge ein", "kühle Luft"), p("hold", 2), p("out", 6, "Durch die Nase aus")),
    minutes: 2,
    category: "beruhigen", level: "mittel",
    tags: ["hitze", "wut", "stress", "unruhe"],
    intro: "Wir atmen kühlend. Durch die gerollte Zunge ein, durch die Nase aus.",
    art: { from: "#8fa0ff", to: "#28306b", motif: "drop" },
  },
  {
    id: "mond",
    name: "Mond-Atmung",
    short: "Links ein, rechts aus. Für den ruhigen Abend.",
    why: "Chandra Bhedana: Atmen durch das linke Nasenloch gilt im Yoga als kühlend und beruhigend. Der Atem wird langsamer.",
    how: ["Rechtes Nasenloch mit dem Daumen schließen", "Links einatmen", "Links schließen, rechts ausatmen"],
    cycle: simple(p("in", 4, "Links einatmen", "rechts zu"), p("hold", 2), p("out", 6, "Rechts ausatmen", "links zu")),
    minutes: 3,
    category: "beruhigen", level: "mittel",
    tags: ["abend", "schlaf", "ruhe", "hitze", "unruhe"],
    intro: "Wir atmen wie der Mond. Immer links ein, rechts aus.",
    art: { from: "#5a5aa8", to: "#15163a", motif: "moon" },
  },
  {
    id: "flugangst",
    name: "Unterwegs ruhig bleiben",
    short: "Für Flugzeug, Stau und volle Bahn.",
    why: "Wenn du nicht wegkannst, hilft langsames Atmen mit Fokus auf den Boden unter dir. Der Körper merkt: keine Gefahr.",
    how: ["Füße fest auf den Boden", "4 ein", "Beim Ausatmen den Sitz unter dir spüren"],
    cycle: simple(p("in", 4, undefined, NOSE), p("out", 7, "Ausatmen, schwer werden", "spür den Sitz unter dir")),
    minutes: 3,
    category: "beruhigen", level: "leicht",
    tags: ["unterwegs", "angst", "panik", "unruhe", "herzrasen"],
    intro: "Du bist unterwegs und kannst nicht weg. Das ist okay. Füße auf den Boden, wir atmen zusammen.",
    art: { from: "#6f7bd6", to: "#1e2350", motif: "wave" },
  },

  // ——— Schlafen ———
  {
    id: "schlaf-48",
    name: "4 ein · 8 aus",
    short: "Sanft in den Schlaf. Der Körper wird schwer.",
    why: "Sehr langes Ausatmen verlangsamt den Puls deutlich. Viele schlafen schon bevor die Übung zu Ende ist.",
    how: ["4 ein", "8 aus", "Mit jeder Runde ein Stück schwerer werden"],
    cycle: simple(p("in", 4, undefined, NOSE), p("out", 8, undefined, "langsam, ganz weich")),
    minutes: 5,
    category: "schlafen", level: "leicht",
    tags: ["schlaf", "abend", "grübeln", "ruhe", "unruhe"],
    intro: "Lass uns langsam runterkommen. Wir atmen ruhig und lange aus. So wird der Körper schwer.",
    art: { from: "#3d3f94", to: "#0e0f2a", motif: "moon" },
  },
  {
    id: "einschlaf-leiter",
    name: "Einschlaf-Leiter",
    short: "Das Ausatmen wird Stufe für Stufe länger.",
    why: "Du fängst bequem an und verlängerst das Ausatmen schrittweise. So gleitet der Körper ohne Anstrengung in den Ruhemodus.",
    how: ["Erst 4 ein, 4 aus", "Dann 4 ein, 6 aus", "Zum Schluss 4 ein, 8 aus"],
    cycle: [
      { phases: [p("in", 4), p("out", 4)], repeat: 3, label: "Stufe 1 · 4 · 4" },
      { phases: [p("in", 4), p("out", 6)], repeat: 4, label: "Stufe 2 · 4 · 6" },
      { phases: [p("in", 4), p("out", 8)], repeat: 6, label: "Stufe 3 · 4 · 8" },
    ],
    minutes: 4, rounds: 1,
    category: "schlafen", level: "leicht",
    tags: ["schlaf", "abend", "grübeln", "ruhe"],
    intro: "Wir steigen die Einschlaf-Leiter hinab. Das Ausatmen wird Stufe für Stufe länger.",
    art: { from: "#2f3478", to: "#0b0c22", motif: "stairs" },
  },
  {
    id: "body-scan",
    name: "Atmen durch den Körper",
    short: "Jede Runde eine Körperstelle weich atmen.",
    why: "Aufmerksamkeit wandert mit dem Atem durch den Körper. Spannung, die man bemerkt, kann man loslassen. Gut vor dem Einschlafen.",
    how: ["Einatmen und in die genannte Stelle spüren", "Beim Ausatmen dort weich werden"],
    cycle: simple(p("in", 4, "Einatmen, hinspüren"), p("out", 7, "Ausatmen, weich werden")),
    minutes: 4, rounds: 10,
    category: "schlafen", level: "leicht",
    tags: ["verspannt", "schlaf", "schmerz", "achtsam", "abend", "kopfschmerz"],
    roundCues: ["Stirn und Augen", "Kiefer und Zunge", "Nacken", "Schultern", "Arme und Hände", "Brust", "Bauch", "Rücken", "Beine", "Füße, der ganze Körper"],
    intro: "Wir atmen durch den Körper. Jede Runde eine Stelle. Beim Ausatmen wird sie weich.",
    art: { from: "#4a3f8f", to: "#141029", motif: "spiral" },
  },
  {
    id: "zaehlen",
    name: "Atemzüge zählen",
    short: "Zen: bis zehn zählen, dann von vorn.",
    why: "Die älteste Meditation: Atemzüge zählen. Schweift der Kopf ab, fängst du freundlich bei eins an. Trainiert Ruhe und Aufmerksamkeit.",
    how: ["Natürlich einatmen", "Beim Ausatmen innerlich zählen", "Bei zehn wieder bei eins beginnen"],
    cycle: simple(p("in", 4), p("out", 6)),
    count: true,
    minutes: 5,
    category: "schlafen", level: "leicht",
    tags: ["achtsam", "grübeln", "schlaf", "fokus", "ruhe"],
    intro: "Wir zählen die Atemzüge. Beim Ausatmen zählst du. Bei zehn fängst du wieder bei eins an.",
    art: { from: "#55507a", to: "#18162a", motif: "circle" },
  },

  // ——— Fokus ———
  {
    id: "box",
    name: "Box-Atmung 4 · 4 · 4 · 4",
    short: "Wie ein Quadrat. Ordnet den Kopf.",
    why: "Vier gleiche Seiten: ein, halten, aus, halten. Wird von Spezialeinheiten und Piloten genutzt, um unter Druck klar zu bleiben.",
    how: ["4 ein", "4 halten", "4 aus", "4 halten"],
    cycle: simple(p("in", 4, undefined, NOSE), p("hold", 4), p("out", 4), p("rest", 4)),
    minutes: 3,
    category: "fokus", level: "mittel",
    tags: ["fokus", "stress", "pruefung", "auftritt", "grübeln", "buero", "ueberfordert"],
    intro: "Wir atmen gleichmäßig wie ein Quadrat. Ein, halten, aus, halten.",
    art: { from: "#4b5563", to: "#111827", motif: "square" },
  },
  {
    id: "mini-box",
    name: "Mini-Box 3 · 3 · 3 · 3",
    short: "Die Box für Einsteiger und zwischendurch.",
    why: "Kürzere Seiten, gleiche Wirkung: der Kopf bekommt einen Takt. Gut, wenn 4 Sekunden Halten noch zu lang ist.",
    how: ["3 ein", "3 halten", "3 aus", "3 halten"],
    cycle: simple(p("in", 3), p("hold", 3), p("out", 3), p("rest", 3)),
    minutes: 2,
    category: "fokus", level: "leicht",
    tags: ["fokus", "stress", "buero", "kinder"],
    intro: "Wir machen die kleine Box. Drei ein, drei halten, drei aus, drei halten.",
    art: { from: "#6b7280", to: "#1f2937", motif: "square" },
  },
  {
    id: "box-6",
    name: "Box 6 · 6 · 6 · 6",
    short: "Lange Seiten für Geübte. Tiefe Ruhe, klarer Kopf.",
    why: "Mit längeren Seiten sinkt die Atemfrequenz auf etwa 2,5 Züge pro Minute. Fordert, beruhigt aber stark.",
    how: ["6 ein", "6 halten", "6 aus", "6 halten"],
    cycle: simple(p("in", 6), p("hold", 6), p("out", 6), p("rest", 6)),
    minutes: 4,
    category: "fokus", level: "fortgeschritten",
    tags: ["fokus", "achtsam", "ruhe", "stoisch"],
    caution: "Wenn das Halten drückt: zurück zur 4er-Box.",
    intro: "Wir atmen die große Box. Sechs auf jeder Seite.",
    art: { from: "#374151", to: "#0b0f19", motif: "square" },
  },
  {
    id: "wechsel",
    name: "Wechselatmung",
    short: "Abwechselnd durch ein Nasenloch. Bringt in die Mitte.",
    why: "Nadi Shodhana verlangsamt den Atem und braucht volle Aufmerksamkeit. Kleine Studien zeigen weniger Anspannung und bessere Konzentration.",
    how: ["Rechte Hand: Daumen schließt rechts, Ringfinger links", "Links ein, rechts aus", "Rechts ein, links aus"],
    cycle: simple(
      p("in", 4, "Links einatmen", "rechts zu"), p("hold", 2), p("out", 4, "Rechts ausatmen", "links zu"),
      p("in", 4, "Rechts einatmen"), p("hold", 2), p("out", 4, "Links ausatmen", "rechts zu"),
    ),
    minutes: 4,
    category: "fokus", level: "mittel",
    tags: ["balance", "fokus", "grübeln", "unruhe", "achtsam", "pruefung"],
    intro: "Wir machen die Wechselatmung. Ich sage dir jedes Mal, welche Seite.",
    art: { from: "#8a86a6", to: "#2d2b3d", motif: "spiral" },
  },
  {
    id: "auftritt",
    name: "Vor dem Auftritt",
    short: "Lampenfieber in Fokus verwandeln.",
    why: "Etwas Aufregung macht dich wach. Kurz halten und lang ausatmen nimmt die Spitze, ohne dich müde zu machen.",
    how: ["4 ein", "Kurz halten", "6 aus, Schultern runter"],
    cycle: simple(p("in", 4, undefined, NOSE), p("hold", 2), p("out", 6, "Ausatmen, Schultern runter")),
    minutes: 2,
    category: "fokus", level: "leicht",
    tags: ["auftritt", "pruefung", "unruhe", "herzrasen", "fokus", "angst"],
    intro: "Gleich ist dein Moment. Die Aufregung zeigt, dass es dir wichtig ist. Wir machen sie zu Fokus.",
    art: { from: "#6b5ad6", to: "#1d1940", motif: "sun" },
  },
  {
    id: "stoisch",
    name: "Stoische Atmung",
    short: "Ein: was ich ändern kann. Aus: was ich lasse.",
    why: "Die Dichotomie der Kontrolle (Epiktet) als Atem: beim Einatmen nimmst du an, was in deiner Hand liegt, beim Ausatmen lässt du los, was nicht.",
    how: ["Einatmen: Was liegt in meiner Hand?", "Ausatmen: Den Rest lasse ich los"],
    cycle: simple(p("in", 5, "Was liegt in meiner Hand?"), p("hold", 2), p("out", 7, "Den Rest lasse ich los")),
    minutes: 3,
    category: "fokus", level: "leicht",
    tags: ["stoisch", "grübeln", "ueberfordert", "stress", "angst", "balance", "morgen"],
    intro: "Epiktet sagt: Manche Dinge liegen in unserer Hand, andere nicht. Wir atmen das ein, was du ändern kannst, und lassen den Rest los.",
    art: { from: "#77708f", to: "#211e2b", motif: "mountain" },
  },
  {
    id: "gedanken-parken",
    name: "Gedanken parken",
    short: "Beim Ausatmen jeden Gedanken auf eine Wolke legen.",
    why: "Gedanken zu benennen statt ihnen zu folgen schafft Abstand. Der Atem gibt den Takt.",
    how: ["Einatmen und bemerken, was gerade denkt", "Ausatmen: den Gedanken auf eine Wolke legen und ziehen lassen"],
    cycle: simple(p("in", 4, "Einatmen, bemerken"), p("out", 7, "Ausatmen, ziehen lassen", "auf eine Wolke legen")),
    minutes: 3,
    category: "fokus", level: "leicht",
    tags: ["grübeln", "schlaf", "ueberfordert", "achtsam", "stoisch"],
    intro: "Wir parken deine Gedanken. Du musst sie nicht lösen. Nur bemerken und ziehen lassen.",
    art: { from: "#9d97b8", to: "#2f2c40", motif: "wave" },
  },

  // ——— Energie ———
  {
    id: "wach-werden",
    name: "Wach in 2 Minuten",
    short: "Lang ein, kurz aus. Macht munter statt Kaffee.",
    why: "Ist das Einatmen länger als das Ausatmen, wird der Körper eher aktiviert. Gut gegen das Mittagstief.",
    how: ["Kräftig durch die Nase ein", "Kurz halten", "Kurz und zügig aus"],
    cycle: simple(p("in", 4, undefined, NOSE), p("hold", 2), p("out", 2, "Zügig aus")),
    minutes: 2,
    category: "energie", level: "leicht",
    tags: ["energie", "muede", "morgen", "fokus", "buero"],
    intro: "Wir holen dir Energie. Lang ein, kurz aus.",
    art: { from: "#b18cff", to: "#5b2bd6", motif: "sun" },
  },
  {
    id: "stufen",
    name: "Stufen-Atmung",
    short: "In vier kleinen Schlucken einatmen.",
    why: "Das stufenweise Einatmen füllt die Lunge ganz und weckt. Das lange Ausatmen hält dich trotzdem ruhig.",
    how: ["Viermal kurz durch die Nase einatmen, wie Stufen", "Lang durch den Mund aus"],
    cycle: simple(p("in", 1, "Eins"), p("in2", 1, "Zwei"), p("in2", 1, "Drei"), p("in2", 1, "Vier"), p("out", 5, undefined, MOUTH)),
    minutes: 2,
    category: "energie", level: "leicht",
    tags: ["energie", "muede", "morgen", "traurig"],
    intro: "Wir atmen in Stufen. Vier kleine Schlucke ein, dann lang aus.",
    art: { from: "#a07cff", to: "#4b25b8", motif: "stairs" },
  },
  {
    id: "sonne",
    name: "Sonnen-Atmung",
    short: "Rechts ein, links aus. Aktivierend.",
    why: "Surya Bhedana, das Gegenstück zur Mond-Atmung: durch das rechte Nasenloch einatmen gilt im Yoga als wärmend und weckend.",
    how: ["Linkes Nasenloch schließen", "Rechts einatmen", "Rechts schließen, links ausatmen"],
    cycle: simple(p("in", 4, "Rechts einatmen", "links zu"), p("hold", 2), p("out", 4, "Links ausatmen", "rechts zu")),
    minutes: 2,
    category: "energie", level: "mittel",
    tags: ["energie", "morgen", "muede", "traurig"],
    intro: "Wir atmen wie die Sonne. Immer rechts ein, links aus.",
    art: { from: "#c3a0ff", to: "#6a35e0", motif: "sun" },
  },
  {
    id: "kapalabhati",
    name: "Kapalabhati",
    short: "Kurz und kräftig ausstoßen. Weckt richtig auf.",
    why: "Beim „Schädelleuchten“ stößt der Bauch die Luft kurz aus, das Einatmen passiert von selbst. Sehr aktivierend, danach kommt eine stille Pause.",
    how: ["Aufrecht sitzen", "Den Bauch kurz einziehen, Luft stößt durch die Nase raus", "Einatmen passiert von allein", "Nach der Runde ruhig erholen"],
    cycle: [
      { phases: [p("out", 0.6, "Aus", "Bauch rein"), p("in", 0.6, "Ein", "lass einströmen")], repeat: 30, label: "30× ausstoßen" },
      { phases: [p("in", 4, "Tief einatmen"), p("hold", 6), p("out", 6, "Langsam aus")], repeat: 1, label: "Erholen" },
      { phases: [p("in", 4), p("out", 6)], repeat: 2, label: "Nachspüren" },
    ],
    minutes: 3, rounds: 3,
    category: "energie", level: "fortgeschritten",
    tags: ["energie", "muede", "morgen"],
    caution: "Nicht in der Schwangerschaft, bei Bluthochdruck, Herzproblemen, Epilepsie oder frischen Operationen. Nie im Auto oder im Wasser. Bei Schwindel aufhören.",
    intro: "Wir machen Kapalabhati. Kurze, kräftige Stöße aus dem Bauch. Das Einatmen passiert von selbst.",
    art: { from: "#d0b3ff", to: "#7140e8", motif: "flame" },
  },
  {
    id: "blasebalg",
    name: "Blasebalg",
    short: "Gleich kräftig ein und aus. Wärmt und weckt.",
    why: "Bhastrika bewegt viel Luft in kurzer Zeit. Danach fühlen sich viele wach und warm.",
    how: ["Kräftig durch die Nase ein", "Kräftig durch die Nase aus", "Nach der Runde langsam erholen"],
    cycle: [
      { phases: [p("in", 1, "Ein"), p("out", 1, "Aus")], repeat: 15, label: "15× kräftig" },
      { phases: [p("in", 4, "Tief ein"), p("hold", 5), p("out", 7, "Ganz langsam aus")], repeat: 1, label: "Erholen" },
    ],
    minutes: 3, rounds: 3,
    category: "energie", level: "fortgeschritten",
    tags: ["energie", "muede", "morgen", "sport"],
    caution: "Nicht bei Bluthochdruck, Herzproblemen, in der Schwangerschaft oder bei Schwindel. Nur im Sitzen.",
    intro: "Wir machen den Blasebalg. Kräftig ein und kräftig aus, danach erholen wir uns.",
    art: { from: "#b896ff", to: "#5a2fcf", motif: "flame" },
  },
  {
    id: "energie-runden",
    name: "Energie-Runden",
    short: "30 tiefe Atemzüge, dann ruhig halten.",
    why: "Viele tiefe Atemzüge hintereinander, danach eine Pause mit leerer Lunge. Bekannt aus der Wim-Hof-Methode, viele fühlen sich danach hellwach.",
    how: ["30-mal tief ein und locker aus", "Ausatmen und entspannt halten, solange es angenehm ist", "Tief einatmen, 15 Sekunden halten, loslassen"],
    cycle: [
      { phases: [p("in", 1.6, "Tief ein"), p("out", 1.4, "Locker aus")], repeat: 30, label: "30 Atemzüge" },
      { phases: [p("rest", 30, "Leer halten", "ganz entspannt")], repeat: 1, label: "Halten" },
      { phases: [p("in", 3, "Tief einatmen"), p("hold", 15, "Halten"), p("out", 5, "Loslassen")], repeat: 1, label: "Erholen" },
    ],
    minutes: 5, rounds: 3,
    category: "energie", level: "fortgeschritten",
    tags: ["energie", "morgen", "muede", "sport"],
    caution: "Nur sitzend oder liegend. NIE im Wasser, beim Autofahren oder im Stehen – Ohnmachtsgefahr. Nicht in der Schwangerschaft, bei Herz-Kreislauf-Problemen oder Epilepsie.",
    intro: "Wir machen Energie-Runden. Dreißig tiefe Atemzüge, dann halten wir entspannt. Bleib sitzen oder liegen.",
    art: { from: "#c9a8ff", to: "#5f2ee3", motif: "spiral" },
  },
  {
    id: "loewe",
    name: "Löwen-Atem",
    short: "Zunge raus, laut ausatmen. Löst Gesicht und Ärger.",
    why: "Simhasana sieht albern aus und genau das hilft: Kiefer, Zunge und Gesicht lösen sich, Frust kommt raus.",
    how: ["Durch die Nase einatmen", "Mund weit auf, Zunge raus", "Kräftig mit einem „Haaa“ ausatmen"],
    cycle: simple(p("in", 4, undefined, NOSE), p("out", 3, "Haaa!", "Zunge raus, Mund weit")),
    minutes: 1, rounds: 6,
    category: "energie", level: "leicht",
    tags: ["wut", "verspannt", "kinder", "energie", "kopfschmerz"],
    intro: "Wir machen den Löwen-Atem. Einatmen, dann Mund auf, Zunge raus und Haaa.",
    art: { from: "#a885ff", to: "#4a2a99", motif: "sun" },
  },

  // ——— Balance ———
  {
    id: "kohaerent",
    name: "Kohärentes Atmen",
    short: "5,5 ein · 5,5 aus. Herz und Atem im Takt.",
    why: "Etwa sechs Atemzüge pro Minute bringen Herzschlag und Atem in einen gemeinsamen Rhythmus (Resonanz). Das stärkt die Herzratenvariabilität, ein Zeichen für Erholung.",
    how: ["5,5 Sekunden ein", "5,5 Sekunden aus", "Weich, ohne Pause"],
    cycle: simple(p("in", 5.5, undefined, NOSE), p("out", 5.5, undefined, NOSE)),
    minutes: 5,
    category: "balance", level: "leicht",
    tags: ["balance", "stress", "ruhe", "achtsam", "herzrasen", "sport", "traurig"],
    intro: "Wir atmen kohärent. Etwa sechs Atemzüge pro Minute. Herz und Atem kommen in einen Takt.",
    art: { from: "#9b8fd0", to: "#2c2650", motif: "wave" },
  },
  {
    id: "resonanz-5",
    name: "Resonanz 5 · 5",
    short: "Gleichmäßig fünf ein, fünf aus.",
    why: "Der einfachste Einstieg ins Resonanz-Atmen: sechs Züge pro Minute. Gut für jeden Tag.",
    how: ["5 ein", "5 aus"],
    cycle: simple(p("in", 5), p("out", 5)),
    minutes: 5,
    category: "balance", level: "leicht",
    tags: ["balance", "ruhe", "achtsam", "fokus", "morgen"],
    intro: "Wir atmen gleichmäßig, fünf ein und fünf aus.",
    art: { from: "#857fb0", to: "#25223d", motif: "circle" },
  },
  {
    id: "bauch",
    name: "Bauchatmung",
    short: "Der Bauch hebt sich, die Brust bleibt ruhig.",
    why: "Atmen mit dem Zwerchfell ist tiefer und ruhiger als flaches Brustatmen. Eine Hand auf dem Bauch zeigt dir, ob es klappt.",
    how: ["Eine Hand auf den Bauch, eine auf die Brust", "Einatmen: nur der Bauch hebt sich", "Ausatmen: der Bauch sinkt"],
    cycle: simple(p("in", 4, "Bauch hebt sich", "Hand auf den Bauch"), p("out", 6, "Bauch sinkt")),
    minutes: 3,
    category: "balance", level: "leicht",
    tags: ["kurzatmig", "angst", "stress", "bauch", "kinder", "achtsam"],
    intro: "Wir atmen in den Bauch. Leg eine Hand darauf und spür, wie er sich hebt und senkt.",
    art: { from: "#a497d8", to: "#332b5c", motif: "lungs" },
  },
  {
    id: "dreiteilig",
    name: "Dreiteilige Atmung",
    short: "Bauch, Brust, Schlüsselbein – ganz voll atmen.",
    why: "Dirga Pranayama füllt die Lunge von unten nach oben. Du lernst deinen Atem kennen und atmest danach freier.",
    how: ["Erst in den Bauch", "Dann in die Brust", "Dann bis unters Schlüsselbein", "Lang aus"],
    cycle: simple(p("in", 2, "In den Bauch"), p("in2", 2, "In die Brust"), p("in2", 1.5, "Bis zum Schlüsselbein"), p("out", 7, "Ganz ausatmen")),
    minutes: 3,
    category: "balance", level: "mittel",
    tags: ["kurzatmig", "achtsam", "energie", "balance", "enge"],
    intro: "Wir atmen dreiteilig. Bauch, Brust, Schlüsselbein. Und dann ganz aus.",
    art: { from: "#b0a2e6", to: "#3a3068", motif: "stairs" },
  },
  {
    id: "ozean",
    name: "Ozean-Atmung",
    short: "Leises Rauschen im Hals wie Meeresbrandung.",
    why: "Ujjayi: die Kehle wird leicht eng, der Atem rauscht. Das Geräusch bremst den Atem und gibt dem Kopf etwas zum Hören.",
    how: ["Kehle leicht verengen, als würdest du einen Spiegel anhauchen", "Mund zu, durch die Nase ein und aus", "Dem Rauschen zuhören"],
    cycle: simple(p("in", 5, "Rauschend ein"), p("out", 6, "Rauschend aus")),
    minutes: 4,
    category: "balance", level: "mittel",
    tags: ["achtsam", "fokus", "ruhe", "sport", "balance"],
    intro: "Wir atmen wie der Ozean. Die Kehle leicht eng, der Atem rauscht.",
    art: { from: "#7a8cd6", to: "#1e2552", motif: "wave" },
  },
  {
    id: "sanft-weniger",
    name: "Sanft weniger atmen",
    short: "Leise und klein atmen. Gegen Hyperventilieren.",
    why: "Wer zu viel und zu schnell atmet, bekommt Kribbeln und Schwindel. Bewusst kleiner atmen mit kurzer Pause bringt das Gleichgewicht zurück (nach Buteyko).",
    how: ["Leise durch die Nase ein, nur ein bisschen", "Leise aus", "Kurze Pause, bevor der nächste Atemzug kommt"],
    cycle: simple(p("in", 3, "Klein einatmen", "leise, durch die Nase"), p("out", 3, "Leise aus"), p("rest", 3, "Pause", "warten, bis der Atem kommt")),
    minutes: 3,
    category: "balance", level: "mittel",
    tags: ["kurzatmig", "panik", "angst", "unruhe"],
    caution: "Nicht gegen echte Atemnot. Bei Asthma oder Lungenerkrankung vorher ärztlich abklären.",
    intro: "Wir atmen sanft und etwas weniger. Leise, klein, mit kurzer Pause.",
    art: { from: "#8f88b0", to: "#26233a", motif: "drop" },
  },
  {
    id: "gehen",
    name: "Atmen beim Gehen",
    short: "Vier Schritte ein, vier Schritte aus.",
    why: "Atem und Schritte im selben Takt: eine Gehmeditation. Gut auf dem Weg zur Arbeit, ganz ohne Kopfhörer mit Vibration.",
    how: ["Vier Schritte lang einatmen", "Vier Schritte lang ausatmen", "Später: sechs Schritte aus"],
    cycle: simple(p("in", 4, "Einatmen", "vier Schritte"), p("out", 4, "Ausatmen", "vier Schritte")),
    minutes: 5,
    category: "balance", level: "leicht",
    tags: ["unterwegs", "achtsam", "balance", "grübeln", "energie"],
    intro: "Wir atmen beim Gehen. Vier Schritte ein, vier Schritte aus.",
    art: { from: "#97a07f", to: "#2a2e22", motif: "leaf" },
  },

  // ——— Körper ———
  {
    id: "schultern",
    name: "Schultern lösen",
    short: "Hochziehen beim Einatmen, fallen lassen beim Ausatmen.",
    why: "Stress sitzt oft in Nacken und Schultern. Anspannen und bewusst fallen lassen zeigt dem Körper, wie sich locker anfühlt.",
    how: ["Einatmen und die Schultern zu den Ohren ziehen", "Kurz halten", "Ausatmen und fallen lassen"],
    cycle: simple(p("in", 4, "Schultern hoch"), p("hold", 2, "Halten"), p("out", 6, "Fallen lassen", "mit einem Seufzer")),
    minutes: 2,
    category: "koerper", level: "leicht",
    tags: ["verspannt", "buero", "stress", "kopfschmerz"],
    intro: "Wir lösen deine Schultern. Hoch beim Einatmen, fallen lassen beim Ausatmen.",
    art: { from: "#9a7cf0", to: "#3a2a70", motif: "mountain" },
  },
  {
    id: "kiefer",
    name: "Kiefer und Stirn weich",
    short: "Für Kopfdruck und zusammengebissene Zähne.",
    why: "Viele beißen unter Stress die Zähne zusammen, das spannt bis in die Schläfen. Weiches Ausatmen mit offenem Kiefer kann Spannungskopfschmerz lindern.",
    how: ["Zähne leicht auseinander, Zunge locker", "Ruhig einatmen", "Beim Ausatmen Stirn und Kiefer weich werden lassen"],
    cycle: simple(p("in", 4, undefined, NOSE), p("out", 8, "Ausatmen, Kiefer weich", "Zähne auseinander")),
    minutes: 3,
    category: "koerper", level: "leicht",
    tags: ["kopfschmerz", "verspannt", "stress", "buero", "schlaf"],
    caution: "Bei starken, plötzlichen oder ungewohnten Kopfschmerzen bitte ärztlich abklären.",
    intro: "Wir lassen Kiefer und Stirn weich werden. Zähne leicht auseinander, die Zunge locker.",
    art: { from: "#8a72d8", to: "#2c2156", motif: "circle" },
  },
  {
    id: "schmerz",
    name: "In den Schmerz atmen",
    short: "Hinatmen statt wegdrücken.",
    why: "Wer gegen Schmerz anspannt, verstärkt ihn oft. Langsames Atmen und Weichwerden um die Stelle herum kann ihn erträglicher machen.",
    how: ["Einatmen und freundlich zur Stelle hinspüren", "Ausatmen und den Bereich drumherum weich werden lassen"],
    cycle: simple(p("in", 4, "Hinspüren"), p("out", 8, "Drumherum weich werden")),
    minutes: 4,
    category: "koerper", level: "leicht",
    tags: ["schmerz", "verspannt", "bauch", "kopfschmerz", "achtsam"],
    caution: "Ersetzt keine Behandlung. Bei starken oder neuen Schmerzen bitte ärztlich abklären.",
    intro: "Wir atmen zu der Stelle, die weh tut. Nicht wegdrücken, nur weich werden drumherum.",
    art: { from: "#a27fe0", to: "#3a2466", motif: "heart" },
  },
  {
    id: "bauch-beruhigen",
    name: "Bauch beruhigen",
    short: "Wenn es im Magen flau ist vor Aufregung.",
    why: "Bauch und Gehirn sind eng verbunden. Langsames Atmen in den Bauch mit warmer Hand darauf beruhigt viele bei Aufregung im Magen.",
    how: ["Beide Hände warm auf den Bauch", "Einatmen in die Hände", "Lang ausatmen, Bauch wird weich"],
    cycle: simple(p("in", 4, "In die Hände atmen"), p("out", 7, "Bauch wird weich")),
    minutes: 3,
    category: "koerper", level: "leicht",
    tags: ["bauch", "angst", "pruefung", "unruhe", "auftritt"],
    intro: "Leg beide Hände warm auf deinen Bauch. Wir atmen in deine Hände.",
    art: { from: "#b49cf0", to: "#3f3070", motif: "heart" },
  },
  {
    id: "nach-sport",
    name: "Nach dem Sport",
    short: "Puls runter, schneller erholen.",
    why: "Langes Ausatmen nach dem Training hilft dem Körper, vom Gas auf die Bremse zu wechseln. Puls und Atem kommen schneller runter.",
    how: ["Locker stehen oder liegen", "4 ein", "8 aus"],
    cycle: simple(p("in", 4, undefined, NOSE), p("out", 8, undefined, MOUTH)),
    minutes: 3,
    category: "koerper", level: "leicht",
    tags: ["sport", "herzrasen", "ruhe", "kurzatmig"],
    intro: "Gut gemacht. Jetzt holen wir den Puls runter. Vier ein, acht aus.",
    art: { from: "#8e86c9", to: "#262247", motif: "drop" },
  },

  // ——— Herz, Dankbarkeit, Kinder ———
  {
    id: "herz",
    name: "Herz-Atmung",
    short: "Durchs Herz atmen und an etwas Schönes denken.",
    why: "Ruhiges Atmen mit einem warmen Gefühl (nach HeartMath) bringt Herzschlag und Atem in Einklang und hebt die Stimmung.",
    how: ["Hand aufs Herz", "So atmen, als ginge der Atem durchs Herz", "Ein Gefühl von Dankbarkeit oder Wärme dazunehmen"],
    cycle: simple(p("in", 5, "Durchs Herz ein"), p("out", 5, "Durchs Herz aus")),
    minutes: 3,
    category: "balance", level: "leicht",
    tags: ["traurig", "dankbar", "balance", "angst", "achtsam"],
    roundCues: ["Hand aufs Herz", "Denk an einen Menschen, den du magst", "Spür die Wärme dabei", "Lass sie mit jedem Atemzug größer werden"],
    intro: "Leg eine Hand auf dein Herz. Wir atmen ruhig, als ginge der Atem genau dort hindurch.",
    art: { from: "#b48cff", to: "#46257f", motif: "heart" },
  },
  {
    id: "dankbarkeit",
    name: "Dankbarkeits-Atem",
    short: "Jede Runde etwas, wofür du dankbar bist.",
    why: "Dankbarkeit ist eine der am besten untersuchten Übungen für mehr Wohlbefinden. Mit dem Atem verbunden wird sie spürbar statt nur gedacht.",
    how: ["Einatmen und an etwas Gutes denken", "Ausatmen und Danke sagen, innerlich"],
    cycle: simple(p("in", 5, "Einatmen, erinnern"), p("out", 6, "Ausatmen, danke")),
    minutes: 3, rounds: 6,
    category: "balance", level: "leicht",
    tags: ["dankbar", "traurig", "abend", "stoisch", "achtsam"],
    roundCues: ["Ein Mensch in deinem Leben", "Etwas, das dein Körper heute kann", "Ein kleiner schöner Moment von heute", "Etwas, das du gelernt hast", "Ein Ort, an dem du dich wohlfühlst", "Dieser Atemzug"],
    intro: "Wir atmen Dankbarkeit. Jede Runde ein Gedanke. Er muss nicht groß sein.",
    art: { from: "#c0a3ff", to: "#5631a8", motif: "flower" },
  },
  {
    id: "hand",
    name: "Hand-Atmung",
    short: "Mit dem Finger die Hand entlangfahren.",
    why: "Den Umriss der Hand nachfahren gibt Augen und Händen etwas zu tun. Toll für Kinder und alle, denen Zählen schwerfällt.",
    how: ["Zeigefinger an den Daumen der anderen Hand", "Hochfahren: einatmen", "Runterfahren: ausatmen", "Fünf Finger, zwei Hände"],
    cycle: simple(p("in", 4, "Finger hoch, einatmen"), p("out", 5, "Finger runter, ausatmen")),
    minutes: 2, rounds: 10,
    category: "beruhigen", level: "leicht",
    tags: ["kinder", "angst", "unruhe", "achtsam", "pruefung"],
    intro: "Leg eine Hand offen vor dich. Mit dem Zeigefinger der anderen fährst du die Finger entlang.",
    art: { from: "#a98cf5", to: "#3b2a7a", motif: "hand" },
  },
  {
    id: "kerze",
    name: "Kerze auspusten",
    short: "Blumen riechen, Kerze auspusten. Für Kinder.",
    why: "Bilder helfen Kindern (und Großen), tief und langsam zu atmen: an der Blume riechen, ganz sanft die Kerze auspusten.",
    how: ["An der Blume riechen: einatmen", "Die Kerze langsam auspusten: ausatmen"],
    cycle: simple(p("in", 3, "An der Blume riechen"), p("out", 5, "Kerze auspusten", "ganz langsam")),
    minutes: 2,
    category: "beruhigen", level: "leicht",
    tags: ["kinder", "wut", "unruhe", "angst"],
    intro: "Stell dir eine Blume vor und eine Kerze. Riech an der Blume, dann puste die Kerze ganz langsam aus.",
    art: { from: "#c4a6ff", to: "#5a34b0", motif: "flame" },
  },
  {
    id: "morgen",
    name: "Stoischer Morgen",
    short: "Den Tag vorbereiten: atmen und vornehmen.",
    why: "Marc Aurel bereitete sich jeden Morgen auf den Tag vor. Ruhiges, gleichmäßiges Atmen mit einem Vorsatz pro Runde macht klar, worauf es ankommt.",
    how: ["Gleichmäßig atmen", "Jede Runde einen Gedanken mitnehmen"],
    cycle: simple(p("in", 5), p("hold", 2), p("out", 5)),
    minutes: 3, rounds: 6,
    category: "fokus", level: "leicht",
    tags: ["morgen", "stoisch", "fokus", "energie"],
    roundCues: ["Worauf kommt es heute an?", "Was könnte schwer werden?", "Wie willst du dann reagieren?", "Was liegt in deiner Hand?", "Welche Haltung nimmst du mit?", "Danke für diesen Tag"],
    intro: "Guten Morgen. Wie Marc Aurel bereiten wir den Tag vor. Ein Gedanke pro Atemzug.",
    art: { from: "#a593d6", to: "#2e2654", motif: "sun" },
  },
  {
    id: "abend",
    name: "Stoischer Abend",
    short: "Senecas Rückblick mit dem Atem.",
    why: "Seneca prüfte jeden Abend den Tag, freundlich und ohne Urteil. Mit dem Atem verbunden fällt das Loslassen leichter, dann kommt der Schlaf.",
    how: ["Ruhig und lang ausatmen", "Jede Runde eine Frage an den Tag"],
    cycle: simple(p("in", 4), p("out", 7)),
    minutes: 3, rounds: 6,
    category: "schlafen", level: "leicht",
    tags: ["abend", "stoisch", "schlaf", "grübeln", "dankbar"],
    roundCues: ["Was ist dir heute gelungen?", "Wo bist du hinter dir zurückgeblieben?", "Ohne Urteil, nur hinschauen", "Was machst du morgen besser?", "Wofür bist du dankbar?", "Lass den Tag jetzt los"],
    intro: "Der Tag ist vorbei. Wie Seneca schauen wir freundlich zurück, und dann lassen wir ihn los.",
    art: { from: "#4c4596", to: "#110f2b", motif: "moon" },
  },

  // ——— Situationen ———
  {
    id: "wehen",
    name: "Wehen veratmen",
    short: "Lang und tief ausatmen, die Welle kommen und gehen lassen.",
    why: "Langsames, tiefes Ausatmen während einer Wehe hilft vielen Frauen, sich weniger zu verkrampfen und den Schmerz besser auszuhalten. Kleine Studien zeigen weniger empfundenen Schmerz und mehr Gefühl von Kontrolle.",
    how: ["Ruhig durch die Nase einatmen", "Lang durch den Mund ausatmen, Ton oder Seufzer erlaubt", "Kiefer und Schultern locker lassen"],
    cycle: simple(p("in", 4, undefined, NOSE), p("out", 8, "Lang aus, die Welle ziehen lassen", "Ton erlaubt")),
    minutes: 2,
    category: "koerper", level: "leicht",
    tags: ["geburt", "schwanger", "schmerz", "angst"],
    caution: "Ersetzt keine Hebamme. Sprich deine Atemtechnik für die Geburt mit Hebamme oder Geburtsvorbereitung ab.",
    intro: "Die Welle kommt. Atme ruhig ein, und dann lang aus. Du musst nichts festhalten.",
    evidence: "erste", study: "Yuksel et al., 2017",
    art: { from: "#c58cff", to: "#4a2a99", motif: "wave" },
  },
  {
    id: "wehen-pause",
    name: "Zwischen den Wehen",
    short: "Kurz erholen, Kraft sammeln für die nächste Welle.",
    why: "Zwischen zwei Wehen wieder ruhig und gleichmäßig zu atmen, gibt dem Körper Erholung und hilft, nicht in Anspannung stecken zu bleiben.",
    how: ["Gleichmäßig ein und aus", "Bei jedem Ausatmen schwerer werden", "Hände locker"],
    cycle: simple(p("in", 5, "Ruhig ein"), p("out", 5, "Weich werden")),
    minutes: 2,
    category: "koerper", level: "leicht",
    tags: ["geburt", "schwanger", "erholung", "ruhe"],
    caution: "Ersetzt keine Hebamme. Sprich deine Atemtechnik für die Geburt mit Hebamme oder Geburtsvorbereitung ab.",
    intro: "Die Welle ist vorbei. Lass dich jetzt ganz weich werden und sammle Kraft.",
    art: { from: "#b48cff", to: "#3a2a70", motif: "drop" },
  },
  {
    id: "hitzewallung",
    name: "Gegen Hitzewallungen",
    short: "Sechs Atemzüge pro Minute, wenn die Hitze kommt.",
    why: "Langsames, gleichmäßiges Atmen (Paced Breathing) wurde bei Hitzewallungen in den Wechseljahren untersucht. Bei manchen Frauen wurden sie dadurch seltener oder schwächer.",
    how: ["Beim ersten Anzeichen beginnen", "5 Sekunden ein, 7 Sekunden aus", "Zweimal am Tag 15 Minuten üben hilft am meisten"],
    cycle: simple(p("in", 5, undefined, NOSE), p("out", 7, undefined, MOUTH)),
    minutes: 5,
    category: "koerper", level: "leicht",
    tags: ["hitzewallung", "hitze", "ruhe", "schlaf"],
    intro: "Lass uns die Hitze zusammen ausatmen. Langsam ein, noch langsamer aus.",
    evidence: "erste", study: "Freedman & Woodward, 1992",
    art: { from: "#9a7cf0", to: "#33246a", motif: "flame" },
  },
  {
    id: "verlangen",
    name: "Verlangen aussitzen",
    short: "Für Rauchverlangen, Heißhunger, Handy: die Welle vorbeiziehen lassen.",
    why: "Verlangen kommt wie eine Welle, steigt an und flacht nach einigen Minuten wieder ab. Bewusst zu atmen und das Verlangen nur zu beobachten („Urge Surfing“) hilft, nicht automatisch nachzugeben.",
    how: ["Ruhig atmen", "Das Verlangen im Körper suchen und benennen", "Nicht dagegen kämpfen, nur zusehen, wie es schwächer wird"],
    cycle: simple(p("in", 4, undefined, NOSE), p("out", 6)),
    minutes: 3, rounds: 12,
    category: "beruhigen", level: "leicht",
    tags: ["verlangen", "unruhe", "stress", "achtsam"],
    roundCues: ["Spür das Verlangen", "Wo sitzt es im Körper?", "Es ist eine Welle", "Sie steigt vielleicht noch", "Du musst nichts tun", "Nur zusehen", "Sie wird schwächer", "Du bist stärker als sie", "Atme weiter", "Fast vorbei", "Du hast entschieden", "Gut gemacht"],
    intro: "Das Verlangen ist da. Du musst ihm nicht folgen. Wir sehen ihm zu, bis es vorbeizieht.",
    evidence: "erste", study: "Bowen & Marlatt, 2009",
    art: { from: "#8a86c9", to: "#262247", motif: "wave" },
  },
  {
    id: "spritze",
    name: "Bei Spritze & Blutabnahme",
    short: "Lang ausatmen, genau wenn es piekst.",
    why: "Beim langen Ausatmen entspannen sich die Muskeln und der Körper schaltet auf Ruhe. Viele empfinden den Stich so als weniger schlimm, wenn er in ein Ausatmen fällt.",
    how: ["Ruhig einatmen", "Beim Stich lang und langsam ausatmen", "Schultern locker, Blick woanders hin"],
    cycle: simple(p("in", 3, undefined, NOSE), p("out", 6, "Lang aus, Schultern weich", MOUTH)),
    minutes: 1, rounds: 8,
    category: "akut", level: "leicht",
    tags: ["spritze", "arzt", "angst", "schmerz", "kinder"],
    caution: "Wird dir oft schwarz vor Augen bei Spritzen, sag es vorher und lass dich hinlegen.",
    intro: "Gleich ist es vorbei. Atme ruhig ein, und beim Piks ganz lang aus.",
    evidence: "erste", study: "Bartlett et al., 2019",
    art: { from: "#7f6ad6", to: "#2a2156", motif: "drop" },
  },
  {
    id: "nachts-wach",
    name: "Nachts wieder einschlafen",
    short: "Wenn du um 3 Uhr wach liegst und der Kopf anspringt.",
    why: "Langes Ausatmen bremst den Körper, das Zählen beschäftigt den Kopf, sodass Grübeln weniger Raum bekommt. Licht und Handy bleiben dabei aus, nur die Stimme oder Vibration führt.",
    how: ["Auf dem Rücken oder auf der Seite liegen", "4 ein, 7 aus", "Beim Ausatmen innerlich zählen"],
    cycle: simple(p("in", 4), p("out", 7)),
    count: true,
    minutes: 5,
    category: "schlafen", level: "leicht",
    tags: ["nachts", "albtraum", "schlaf", "grübeln", "angst"],
    intro: "Du liegst wach, das ist okay. Wir atmen lang aus und zählen. Du musst nicht schlafen, nur ruhig werden.",
    art: { from: "#2f3478", to: "#0b0c22", motif: "moon" },
  },
  {
    id: "nach-streit",
    name: "Nach einem Streit",
    short: "Erst runterfahren, dann klar reden.",
    why: "Nach einem Streit ist der Körper im Kampfmodus. Zwei Seufzer holen dich schnell runter, danach beruhigt längeres Ausatmen, bevor du antwortest.",
    how: ["Erst dreimal den doppelten Seufzer", "Dann ruhig länger aus als ein", "Erst danach antworten"],
    cycle: [
      { phases: [p("in", 2.5), p("in2", 1, "Noch ein Schluck"), p("out", 6, "Lang aus")], repeat: 3, label: "Runterfahren" },
      { phases: [p("in", 4), p("out", 6)], repeat: 9, label: "Ruhig werden" },
    ],
    minutes: 2, rounds: 1,
    category: "beruhigen", level: "leicht",
    tags: ["streit", "wut", "stress", "eltern", "herzrasen"],
    intro: "Das war viel. Bevor du etwas sagst, holen wir deinen Körper runter.",
    art: { from: "#7b5cff", to: "#341a5e", motif: "flame" },
  },
];

/* Mehr Wege zur selben Übung: Suchwörter und Situationen, unter denen eine Übung auch erscheinen soll */
const ALSO: Record<string, string[]> = {
  seufzer: ["streit", "arzt", "zittern", "aufgeregt", "auto", "eltern", "spritze"],
  "erden-54321": ["albtraum", "schwindel", "einsam", "trauer"],
  "buero-reset": ["nacken", "ungeduld", "auto", "aufgeregt"],
  lippenbremse: ["schwindel", "zittern", "schwanger"],
  "laenger-aus": ["blutdruck", "aufgeregt", "eltern", "arzt", "schwanger", "regel"],
  "478": ["albtraum", "nachts", "arzt"],
  bienen: ["eltern", "trauer", "ausgebrannt"],
  dreieck: ["ungeduld"],
  "eins-zu-zwei": ["blutdruck", "schwanger", "arzt"],
  "wut-abkuehlen": ["streit", "eltern", "ungeduld"],
  kuehlen: ["hitzewallung", "streit"],
  mond: ["hitzewallung", "nachts"],
  flugangst: ["auto", "arzt", "zittern", "uebelkeit"],
  "schlaf-48": ["nachts", "albtraum", "trauer"],
  "einschlaf-leiter": ["nachts", "ausgebrannt"],
  "body-scan": ["nacken", "ruecken", "regel", "ausgebrannt", "erholung"],
  zaehlen: ["nachts"],
  box: ["aufgeregt", "ungeduld", "zittern"],
  "mini-box": ["auto", "eltern"],
  auftritt: ["aufgeregt", "zittern", "arzt"],
  stoisch: ["streit", "ausgebrannt", "verlangen"],
  "gedanken-parken": ["nachts", "trauer", "verlangen"],
  "wach-werden": ["ausgebrannt"],
  kohaerent: ["blutdruck", "erholung", "trauer", "einsam", "ausgebrannt"],
  "resonanz-5": ["blutdruck", "erholung"],
  bauch: ["uebelkeit", "regel", "schwanger", "geburt", "ruecken"],
  ozean: ["erholung"],
  "sanft-weniger": ["schwindel", "zittern"],
  schultern: ["nacken", "ruecken"],
  kiefer: ["nacken"],
  schmerz: ["ruecken", "regel", "nacken", "geburt", "spritze"],
  "bauch-beruhigen": ["uebelkeit", "regel", "arzt"],
  "nach-sport": ["blutdruck", "erholung"],
  herz: ["einsam", "trauer"],
  dankbarkeit: ["einsam", "ausgebrannt"],
  hand: ["spritze", "arzt", "eltern"],
  kerze: ["eltern", "spritze"],
  abend: ["ausgebrannt"],
};
for (const e of EXERCISES) for (const t of ALSO[e.id] ?? []) if (!e.tags.includes(t)) e.tags.push(t);

/* Wie gut erforscht (vorsichtig eingestuft; ohne Angabe = Erfahrung und Tradition) */
const EVIDENCE: Record<string, [Evidence, string]> = {
  seufzer: ["gut", "Balban et al., 2023 (Stanford)"],
  kohaerent: ["stark", "Lehrer et al., 2020 (Übersicht HRV-Biofeedback)"],
  "resonanz-5": ["stark", "Lehrer et al., 2020 (Übersicht HRV-Biofeedback)"],
  "laenger-aus": ["gut", "Zaccaro et al., 2018 (Übersicht langsames Atmen)"],
  "eins-zu-zwei": ["gut", "Zaccaro et al., 2018 (Übersicht langsames Atmen)"],
  lippenbremse: ["stark", "Bei Atemnot (COPD) gut untersucht"],
  bauch: ["gut", "Ma et al., 2017"],
  wechsel: ["gut", "Mehrere kleine Studien, z. B. Telles et al., 2017"],
  "energie-runden": ["gut", "Kox et al., 2014 (PNAS)"],
  "body-scan": ["gut", "Achtsamkeitsprogramme (MBSR), Übersichten"],
  dankbarkeit: ["gut", "Emmons & McCullough, 2003"],
  "478": ["erste", "Erste kleine Studien"],
  box: ["erste", "Erste kleine Studien"],
  bienen: ["erste", "Erste kleine Studien"],
  kapalabhati: ["erste", "Erste kleine Studien"],
  zaehlen: ["erste", "Achtsamkeitsforschung"],
  "sanft-weniger": ["erste", "Buteyko bei Asthma, Cochrane-Übersicht"],
  "schlaf-48": ["erste", "Erste kleine Studien"],
  "nach-sport": ["erste", "Erste kleine Studien"],
};
for (const e of EXERCISES) { const v = EVIDENCE[e.id]; if (v && !e.evidence) { e.evidence = v[0]; e.study = v[1]; } }

export const exerciseById = (id: string | undefined) => EXERCISES.find((e) => e.id === id);

/* ---------- Zeit ---------- */

export const blockSec = (b: Block) => b.phases.reduce((n, x) => n + x.s, 0) * b.repeat;
export const cycleSec = (e: Pick<Exercise, "cycle">) => e.cycle.reduce((n, b) => n + blockSec(b), 0);
/** Runden für die gewünschte Dauer (feste Runden gehen vor), mindestens 1 */
export function roundsFor(e: Exercise, minutes = e.minutes): number {
  if (e.rounds) return e.rounds;
  return Math.max(1, Math.round((minutes * 60) / cycleSec(e)));
}
/** Dauer in Sekunden für die gewählte Länge */
export const totalSec = (e: Exercise, minutes = e.minutes) => cycleSec(e) * roundsFor(e, minutes);
/** „3 Min.“ bzw. „45 Sek.“ */
export function durationLabel(sec: number) {
  if (sec < 60) return `${Math.round(sec)} Sek.`;
  return `${Math.round(sec / 60)} Min.`;
}
/** kann man die Länge wählen? (feste Runden = nein) */
export const flexible = (e: Exercise) => !e.rounds;

/** Rhythmus kurz, z. B. „4 · 7 · 8“ (bei Programmen der Name des ersten Blocks) */
export function rhythmLabel(e: Exercise): string {
  if (e.cycle.length > 1) return e.cycle.map((b) => b.label ?? "").filter(Boolean).join(" → ");
  const ph = e.cycle[0].phases;
  return ph.map((x) => String(x.s).replace(".", ",")).join(" · ");
}

/* ---------- Ablauf: eine flache Liste der Schritte ---------- */

export type Step = { kind: PhaseKind; s: number; word: string; hint?: string; round: number; block: number; blockLabel?: string; /** Gedanke dieser Runde */ thought?: string; /** Start in Sekunden */ at: number };

export const PHASE_WORD: Record<PhaseKind, string> = { in: "Einatmen", in2: "Nachatmen", hold: "Halten", out: "Ausatmen", rest: "Halten" };
const COUNT = ["Eins", "Zwei", "Drei", "Vier", "Fünf", "Sechs", "Sieben", "Acht", "Neun", "Zehn"];

/**
 * Alle Schritte der Übung nacheinander (Runde · Block · Wiederholung · Phase), mit Startzeit. Gedanken der Runde
 * (`roundCues`) wandern je Atemzug weiter; beim Zählen wird das Ausatmen zur Zahl.
 */
export function steps(e: Exercise, minutes = e.minutes): Step[] {
  const out: Step[] = [];
  const rounds = roundsFor(e, minutes);
  let at = 0, breath = 0;
  for (let r = 0; r < rounds; r++) {
    e.cycle.forEach((b, bi) => {
      for (let k = 0; k < b.repeat; k++) {
        const thought = e.roundCues ? e.roundCues[breath % e.roundCues.length] : undefined;
        for (const ph of b.phases) {
          const word = e.count && ph.kind === "out" ? COUNT[breath % 10] : ph.cue ?? PHASE_WORD[ph.kind];
          out.push({ kind: ph.kind, s: ph.s, word, hint: ph.hint, round: r + 1, block: bi, blockLabel: b.label, thought, at });
          at += ph.s;
        }
        breath++;
      }
    });
  }
  return out;
}

/** wie weit das Bild offen ist (0 zu – 1 offen): ein = geht auf, aus = schließt, halten = bleibt */
export function openAfter(kind: PhaseKind, before: number): number {
  if (kind === "in") return 1;
  if (kind === "in2") return 1;
  if (kind === "out") return 0;
  return before;
}

/* ---------- Suche und Filter ---------- */

const fold = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

/** Schlagwörter, die zu einem Suchtext passen (über Label und Suchwörter) */
export function tagsFor(query: string): string[] {
  const q = fold(query);
  if (!q) return [];
  return TAGS.filter((t) => fold(t.label).includes(q) || t.words.some((w) => { const fw = fold(w); return fw.includes(q) || (q.length >= 4 && q.includes(fw)); })).map((t) => t.id);
}

/**
 * Suche: Name, Kurzbeschreibung und Schlagwörter (auch Synonyme: „Herzklopfen“ findet „Herzrasen“). Treffer im Namen
 * zuerst, dann über Schlagwörter. Filter (`tags`) müssen alle passen.
 */
export function search(query: string, filter: { tags?: string[]; category?: Category; evidence?: boolean } = {}): Exercise[] {
  const q = fold(query);
  const qTags = tagsFor(query);
  const scored = EXERCISES.map((e) => {
    if (filter.category && e.category !== filter.category) return { e, s: -1 };
    if (filter.evidence && e.evidence !== "stark" && e.evidence !== "gut") return { e, s: -1 };
    if (filter.tags?.length && !filter.tags.every((t) => e.tags.includes(t))) return { e, s: -1 };
    if (!q) return { e, s: 1 };
    let s = 0;
    const name = fold(e.name);
    if (name.startsWith(q)) s += 10;
    else if (name.includes(q)) s += 7;
    if (fold(e.short).includes(q)) s += 3;
    if (fold(e.why).includes(q)) s += 1;
    const hit = qTags.filter((t) => e.tags.includes(t));
    // früh genannte Schlagwörter zählen mehr (die Reihenfolge der Tags ist die Wichtigkeit)
    for (const t of hit) s += 6 - Math.min(4, e.tags.indexOf(t));
    return { e, s };
  });
  return scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.e);
}

/** „4 Sek. ein · 7 halten · 8 aus“ (Programme: die Abschnitte) – für die Zusammenfassung vor dem Start */
export function rhythmWords(e: Exercise): string {
  if (e.cycle.length > 1) return e.cycle.map((b) => b.label ?? "").filter(Boolean).join(" → ");
  const W: Record<PhaseKind, string> = { in: "ein", in2: "nachatmen", hold: "halten", out: "aus", rest: "halten" };
  return e.cycle[0].phases.map((p, i) => `${String(p.s).replace(".", ",")}${i === 0 ? " Sek." : ""} ${W[p.kind]}`).join(" · ");
}
/** was man davon hat: der erste Satz aus „warum“ */
export const gainOf = (e: Exercise) => (e.why.match(/^.*?[.!?](\s|$)/)?.[0] ?? e.why).trim();
