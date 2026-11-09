import {
  Activity, AlarmClock, Baby, Bed, Brain, Briefcase, Car, CloudLightning, Coffee, Compass, Dumbbell, Flame, Footprints, GraduationCap,
  Heart, HeartPulse, Leaf, Mic, Moon, MoonStar, Mountain, Scale, Snowflake, Sparkles, Stethoscope, Sun, Sunrise, Sunset, Syringe,
  Thermometer, Users, Wind, Zap, type LucideIcon,
} from "lucide-react";

/**
 * Wie ein Schlagwort aussieht (Entdecken, Filter): Gefühle mit farbigem Punkt, Körper/Ziel/Situation mit Symbol in
 * der Farbe der Gruppe. Farben gedämpft, damit es bunt, aber ruhig wirkt (Nutzerwunsch).
 */
const FEEL: Record<string, string> = {
  stress: "#f28b5b", angst: "#b38cff", panik: "#ff6b7a", unruhe: "#f5b545", wut: "#ef5a4f", traurig: "#6aa3ff", ueberfordert: "#e88bd0",
  "grübeln": "#8d9bff", muede: "#9aa3b5", einsam: "#7fb7d9", trauer: "#7c8ad9", ausgebrannt: "#c98a5a", aufgeregt: "#ffcf5a", ungeduld: "#f39c6b", dankbar: "#5fd39a",
};
const ICON: Record<string, LucideIcon> = {
  herzrasen: HeartPulse, enge: Wind, kurzatmig: Wind, verspannt: Activity, kopfschmerz: Brain, bauch: Leaf, hitze: Thermometer, schmerz: Zap,
  nacken: Activity, ruecken: Activity, uebelkeit: CloudLightning, schwindel: Compass, zittern: Snowflake, hitzewallung: Flame, blutdruck: Heart, regel: Moon,
  schlaf: MoonStar, fokus: Sparkles, energie: Zap, ruhe: Leaf, balance: Scale, achtsam: Heart, erholung: Coffee, stoisch: Mountain,
  pruefung: GraduationCap, auftritt: Mic, buero: Briefcase, morgen: Sunrise, abend: Sunset, sport: Dumbbell, unterwegs: Footprints,
  geburt: Baby, schwanger: Baby, arzt: Stethoscope, spritze: Syringe, streit: CloudLightning, albtraum: Moon, nachts: Bed, auto: Car,
  verlangen: Flame, eltern: Users, kinder: Sun,
};
const GROUP_COLOR: Record<string, string> = { koerper: "#ff8f8f", ziel: "#8fb4ff", situation: "#7fd6b4" };

export function TagMark({ id, group }: { id: string; group: string }) {
  if (group === "gefuehl") return <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: FEEL[id] ?? "#9aa3b5" }} />;
  const I = ICON[id] ?? AlarmClock;
  return <I aria-hidden size={16} className="shrink-0" style={{ color: GROUP_COLOR[group] }} />;
}
export const GROUP_ICON: Record<string, LucideIcon> = { gefuehl: Heart, koerper: HeartPulse, ziel: Compass, situation: Briefcase };
