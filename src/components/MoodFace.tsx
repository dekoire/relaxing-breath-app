/**
 * Laune als schlichtes Linien-Symbol (Variante B, Nov. 2026; vorher gefüllt) (statt der lebenden Nova): dieselbe leicht unrunde Kugel wie `NovaIcon` im Menü, gefüllt
 * EINE flache Farbe (gedeckt wie die App, `MOOD_FLAT`), weiße Kapsel-Augen wie Nova, der Mund trägt den Ausdruck (−1 traurig … 1 breites Lächeln).
 * Ruhig und klar erkennbar; beim Darüberfahren/Antippen ein kleiner Hüpfer (`.mood-face`). `mono` = grau.
 */
/** EINE Farbe je Laune, gedeckt wie die Farben der App (Markenrot, Ziel-Grün), flach ohne Verlauf; auch für Säulen und Texte */
/** Atem: Stimmung in Grau → Lila (keine Ampelfarben, passend zur App) */
export const MOOD_FLAT: Record<number, string> = { 1: "#5d5a6e", 2: "#7a7394", 3: "#9089b4", 4: "#8b6bff", 5: "#6d4aff" };
const MOUTH: Record<number, number> = { 1: -1, 2: -0.5, 3: 0, 4: 0.55, 5: 1 };

export function MoodFace({ mood, size = 40, mono = false, label, className = "" }: { mood: number; size?: number; mono?: boolean; label?: string; className?: string }) {
  const m = Math.min(5, Math.max(1, Math.round(mood)));
  // Variante B (Nutzerwahl): weiß, nur Umriss, Punkt-Augen, Mund trägt den Ausdruck; keine Füllung, keine Farbe
  const ink = mono ? "#8a8c94" : "currentColor";
  const k = MOUTH[m];
  const y = 16.2 - k * 0.5;
  const mouth = `M8.9 ${y} Q12 ${y + k * 2.6} 15.1 ${y}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={`mood-face shrink-0 ${className}`}>
      <path d="M12.2 1.9c5.5.1 9.9 4.4 10 10 .1 5.7-4.3 10.4-10.2 10.5C6.2 22.5 1.6 18.2 1.5 12.5 1.4 6.6 6.3 1.8 12.2 1.9z" fill="none" stroke={ink} strokeWidth="1.4" />
      <circle cx="9.6" cy="10" r="1.25" fill={ink} />
      <circle cx="14.4" cy="10" r="1.25" fill={ink} />
      <path d={mouth} fill="none" stroke={ink} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
