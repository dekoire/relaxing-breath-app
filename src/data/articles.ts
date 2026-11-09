/**
 * Kurze Artikel für die Startseite („Wissen“): je ein Bild, ein Satz, Lesezeit, ein paar Absätze und passende Übungen.
 * Sachlich, mit Quelle, ohne Heilversprechen. Neuer Artikel = Eintrag in `ARTICLES`.
 */
import { photoUrl, type Photo } from "@/data/photos";

export type Article = {
  id: string;
  title: string;
  teaser: string;
  minutes: number;
  photo: Photo;
  /** Absätze; „**Fett:** Rest“ als fette Zwischenzeile */
  body: string[];
  exercises: string[];
  source?: string;
};

const P = (id: string, by: string): Photo => ({ id, by });

export const ARTICLES: Article[] = [
  {
    id: "ausatmen",
    title: "Warum langes Ausatmen beruhigt",
    teaser: "Der einfachste Trick gegen Stress steckt in jedem Atemzug.",
    minutes: 2,
    photo: P("1501436513145-30f24e19fcc8", "Linus Nylund"),
    body: [
      "Wenn du einatmest, schlägt dein Herz ein klein wenig schneller. Wenn du ausatmest, wird es wieder langsamer. Das ist ganz normal und heißt Herzratenvariabilität.",
      "**Der Trick:** Atmest du länger aus als ein, überwiegt die bremsende Seite deines Nervensystems. Puls und Anspannung gehen nach unten, meist schon nach wenigen Atemzügen.",
      "Eine Übersicht über viele Studien (Zaccaro et al., 2018) fand: langsames Atmen mit etwa sechs Atemzügen pro Minute geht mit mehr Ruhe und weniger Angst einher.",
      "**So probierst du es:** 4 Sekunden ein, 6 Sekunden aus. Drei Minuten reichen für den Anfang.",
    ],
    exercises: ["laenger-aus", "kohaerent", "seufzer"],
    source: "Zaccaro et al., 2018, Frontiers in Human Neuroscience",
  },
  {
    id: "seufzer",
    title: "In 30 Sekunden ruhiger",
    teaser: "Was der physiologische Seufzer mit deinem Körper macht.",
    minutes: 2,
    photo: P("1572994384812-d66fea58513f", "Alessio Soggetti"),
    body: [
      "Der physiologische Seufzer ist ein doppeltes Einatmen, gefolgt von einem langen Ausatmen. Du machst ihn ganz von selbst, kurz bevor du einschläfst oder nach dem Weinen.",
      "**Warum es wirkt:** Das zweite, kleine Einatmen öffnet zusammengefallene Lungenbläschen. Das lange Ausatmen danach gibt mehr Kohlendioxid ab und bremst den Puls.",
      "In einer Studie der Universität Stanford (Balban et al., 2023) verbesserte schon fünf Minuten Seufzen am Tag die Stimmung stärker als Achtsamkeitsmeditation.",
      "**Wann es hilft:** vor einem schwierigen Gespräch, im Stau, wenn das Herz rast.",
    ],
    exercises: ["seufzer", "nach-streit", "buero-reset"],
    source: "Balban et al., 2023, Cell Reports Medicine",
  },
  {
    id: "stoiker",
    title: "Was die Stoiker über Gelassenheit wussten",
    teaser: "Was liegt in deiner Hand, und was darfst du loslassen?",
    minutes: 3,
    photo: P("1601850141256-e326878aeec3", "Mor Shani"),
    body: [
      "Epiktet war ein Sklave, später ein berühmter Lehrer. Sein wichtigster Gedanke: Manche Dinge liegen in unserer Hand, andere nicht.",
      "**In deiner Hand:** was du denkst, wie du reagierst, was du als Nächstes tust. **Nicht in deiner Hand:** das Wetter, die Meinung anderer, was gestern passiert ist.",
      "Seneca prüfte jeden Abend freundlich seinen Tag: Was ist mir gelungen? Wo bin ich hinter mir zurückgeblieben? Was mache ich morgen besser? Marc Aurel bereitete sich jeden Morgen auf den Tag vor.",
      "**Im Check-in** fragt dich die App genau das. Und die stoische Atmung verbindet es mit dem Atem: einatmen, was du ändern kannst, ausatmen, was du lässt.",
    ],
    exercises: ["stoisch", "morgen", "abend"],
    source: "Epiktet, Handbüchlein der Moral",
  },
  {
    id: "nachts",
    title: "Nachts wach? So kommt der Schlaf zurück",
    teaser: "Warum Grübeln um 3 Uhr normal ist, und was hilft.",
    minutes: 3,
    photo: P("1507502707541-f369a3b18502", "Sander Dewerte"),
    body: [
      "Fast jeder wacht nachts ein paar Mal kurz auf. Schwierig wird es erst, wenn der Kopf anspringt und Probleme größer wirken als am Tag.",
      "**Nicht aufs Handy schauen:** Licht und Nachrichten machen wacher. Lass den Bildschirm aus, die Übung führt dich mit Stimme oder Vibration.",
      "**Lang ausatmen und zählen:** Das lange Ausatmen bremst den Körper, das Zählen beschäftigt den Kopf. Du musst nicht schlafen wollen, ruhig werden reicht.",
      "Klappt es nach 20 Minuten nicht, steh kurz auf, lies etwas Ruhiges bei schwachem Licht und leg dich wieder hin.",
    ],
    exercises: ["nachts-wach", "478", "einschlaf-leiter"],
  },
  {
    id: "benennen",
    title: "Gefühle benennen nimmt ihnen die Wucht",
    teaser: "Warum der Check-in nach dem genauen Wort fragt.",
    minutes: 2,
    photo: P("1716116058168-c3c7c190a9ec", "Serhii Kabakov"),
    body: [
      "Forscher der Universität Kalifornien (Lieberman et al., 2007) zeigten: Wer ein Gefühl in Worte fasst, beruhigt damit messbar den Teil des Gehirns, der für Alarm zuständig ist.",
      "**Genauer ist besser:** „Mir geht's schlecht“ hilft wenig. „Ich bin enttäuscht“ oder „ich bin überfordert“ hilft mehr, weil du dann weißt, was du brauchst.",
      "Darum fragt dich der Check-in erst nach Stimmung und Energie und dann nach dem passenden Wort. Daraus sucht die App die Atemübung, die dazu passt.",
    ],
    exercises: ["erden-54321", "gedanken-parken"],
    source: "Lieberman et al., 2007, Psychological Science",
  },
  {
    id: "vibration",
    title: "Atmen ohne Kopfhörer",
    teaser: "Wie die Vibration dich im Büro oder in der Tasche führt.",
    minutes: 1,
    photo: P("1581713872605-b9dfbc84eaa4", "Sami Matias Breilin"),
    body: [
      "Nicht immer kann man Kopfhörer tragen. Darum spricht die App auch über Vibration, ähnlich wie die Atem-App der Apple Watch.",
      "**Einatmen:** das Klopfen wird schneller und kräftiger. **Halten:** ein weicher Doppel-Tipper. **Ausatmen:** das Klopfen wird langsamer und leiser.",
      "Nach zwei, drei Runden spürst du den Takt, ohne hinzusehen. Ideal im Meeting, in der Bahn oder vor dem Einschlafen.",
    ],
    exercises: ["buero-reset", "gehen"],
  },
];

export const articleById = (id: string | undefined) => ARTICLES.find((a) => a.id === id);
export const articleImage = (a: Article, w = 900) => photoUrl(a.photo, w);
