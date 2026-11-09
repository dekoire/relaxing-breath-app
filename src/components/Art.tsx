import { Link } from "react-router";
import { Heart } from "lucide-react";
import type { Exercise, Motif } from "@/data/exercises";
import { categoryOf, durationLabel, totalSec } from "@/data/exercises";
import { toggleFavorite, usePrefs } from "@/lib/prefs";
import { imageOf } from "@/data/photos";

/** Produktname an genau einer Stelle (Arbeitsname). */
export const APP_NAME = "Atem";

export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return <img src="/logo.svg" width={size} height={size} alt="" aria-hidden draggable={false} className={`shrink-0 select-none ${className}`} />;
}
export function Logo({ size = 36 }: { size?: number }) {
  return <span className="inline-flex items-center gap-2.5 text-fg"><LogoMark size={size} /><span className="text-title leading-none font-semibold tracking-tight">{APP_NAME}</span></span>;
}

/**
 * Bild einer Übung, bis es echte Fotos gibt (`image`): Verlauf in Lila/Grau/Schwarz mit großem, ruhigem Motiv in Weiß.
 * Groß wie bei Pinterest – die Karten haben je nach Übung unterschiedliche Höhen.
 */
export function MotifSvg({ motif, className = "" }: { motif: Motif; className?: string }) {
  const s = { fill: "none", stroke: "white", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const g = (() => {
    switch (motif) {
      case "flower": return <g opacity=".85">{Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="50" cy="30" rx="10" ry="20" fill="white" fillOpacity=".18" stroke="white" strokeOpacity=".5" transform={`rotate(${i * 45} 50 50)`} />)}<circle cx="50" cy="50" r="5" fill="white" /></g>;
      case "wave": return <g {...s} strokeOpacity=".7">{[0, 14, 28].map((y) => <path key={y} d={`M5 ${40 + y} q11 -12 22 0 t22 0 t22 0 t22 0`} />)}</g>;
      case "moon": return <g><path d="M62 24 A28 28 0 1 0 76 62 A24 24 0 1 1 62 24 Z" fill="white" fillOpacity=".9" />{[[20, 22], [80, 78], [78, 20]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.6" fill="white" />)}</g>;
      case "sun": return <g><circle cx="50" cy="50" r="17" fill="white" fillOpacity=".9" />{Array.from({ length: 12 }, (_, i) => <line key={i} x1="50" y1="20" x2="50" y2="10" {...s} strokeOpacity=".7" transform={`rotate(${i * 30} 50 50)`} />)}</g>;
      case "square": return <g {...s}><rect x="24" y="24" width="52" height="52" rx="6" strokeOpacity=".85" /><rect x="34" y="34" width="32" height="32" rx="4" strokeOpacity=".4" /><circle cx="24" cy="24" r="3.5" fill="white" /></g>;
      case "triangle": return <g {...s}><path d="M50 18 L82 76 H18 Z" strokeOpacity=".85" /><circle cx="50" cy="18" r="3.5" fill="white" /></g>;
      case "circle": return <g {...s}><circle cx="50" cy="50" r="30" strokeOpacity=".85" /><circle cx="50" cy="50" r="18" strokeOpacity=".45" /><circle cx="50" cy="50" r="6" fill="white" fillOpacity=".9" /></g>;
      case "drop": return <g {...s}><path d="M50 16 C 64 36 72 48 72 60 a22 22 0 0 1 -44 0 c0 -12 8 -24 22 -44z" fill="white" fillOpacity=".15" strokeOpacity=".85" /></g>;
      case "leaf": return <g {...s}><path d="M22 78 C 22 40 50 20 80 20 C 80 52 60 78 22 78 Z" fill="white" fillOpacity=".14" strokeOpacity=".85" /><path d="M24 76 L 66 34" strokeOpacity=".6" /></g>;
      case "flame": return <g {...s}><path d="M50 14 C 62 32 72 42 72 58 a22 22 0 0 1 -44 0 c0 -10 6 -16 10 -22 c2 8 6 12 10 12 c-2 -12 0 -22 2 -34z" fill="white" fillOpacity=".16" strokeOpacity=".85" /></g>;
      case "mountain": return <g {...s}><path d="M8 78 L38 34 L52 52 L64 38 L92 78 Z" fill="white" fillOpacity=".14" strokeOpacity=".85" /><circle cx="72" cy="22" r="6" fill="white" fillOpacity=".8" stroke="none" /></g>;
      case "spiral": return <g {...s} strokeOpacity=".8"><path d="M50 50 m0 -4 a4 4 0 1 1 -4 4 a8 8 0 1 1 8 8 a12 12 0 1 1 -12 -12 a18 18 0 1 1 18 18 a26 26 0 1 1 -26 -26" /></g>;
      case "heart": return <g {...s}><path d="M50 78 C 20 58 18 40 26 30 c8 -10 20 -8 24 2 c4 -10 16 -12 24 -2 c8 10 6 28 -24 48z" fill="white" fillOpacity=".16" strokeOpacity=".85" /></g>;
      case "bee": return <g {...s} strokeOpacity=".8">{[14, 24, 34].map((r) => <path key={r} d={`M${50 - r} 50 a${r} ${r} 0 0 1 ${r * 2} 0`} />)}<circle cx="50" cy="54" r="5" fill="white" stroke="none" /></g>;
      case "lungs": return <g {...s}><path d="M50 18 V46 M50 46 c-4 4 -10 4 -12 0 M50 46 c4 4 10 4 12 0" strokeOpacity=".7" /><path d="M40 34 C 26 34 18 52 20 70 c1 8 12 8 18 2 c4 -4 4 -14 4 -24 z" fill="white" fillOpacity=".16" strokeOpacity=".85" /><path d="M60 34 C 74 34 82 52 80 70 c-1 8 -12 8 -18 2 c-4 -4 -4 -14 -4 -24 z" fill="white" fillOpacity=".16" strokeOpacity=".85" /></g>;
      case "hand": return <g {...s} strokeOpacity=".85"><path d="M34 84 C 26 70 22 60 24 52 c2 -4 8 -4 10 2 l2 6 V22 a4 4 0 0 1 8 0 v26 V16 a4 4 0 0 1 8 0 v32 V20 a4 4 0 0 1 8 0 v30 V30 a4 4 0 0 1 8 0 v30 c0 12 -6 20 -12 24" fill="white" fillOpacity=".12" /></g>;
      case "stairs": return <g {...s}><path d="M14 80 H32 V64 H50 V48 H68 V32 H86" strokeOpacity=".85" /><circle cx="86" cy="32" r="3.5" fill="white" /></g>;
    }
  })();
  return <svg viewBox="0 0 100 100" className={className} aria-hidden>{g}</svg>;
}

/** flacher Verlauf von oben links nach unten rechts: die Farbe der Übung, stark ins Blau-Grau gemischt (Nutzerwunsch: keine runden, starken Verläufe) */
export const flatBg = (from: string, to: string) => `linear-gradient(135deg, color-mix(in srgb, ${from} 42%, #4a5162) 0%, color-mix(in srgb, ${to} 42%, #20242d) 100%)`;
export const artBg = (e: Pick<Exercise, "art">) => flatBg(e.art.from, e.art.to);

/** Foto der Übung, leicht ins Blau-Grau getönt (flacher Schleier von oben links nach unten rechts), damit alle Bilder zusammenpassen */
export function Photo({ e, w = 600, className = "" }: { e: Exercise; w?: number; className?: string }) {
  return (
    <>
      <img src={imageOf(e, w)} alt="" loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover ${className}`} />
      <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(42,47,59,.18) 0%, rgba(29,33,41,.42) 100%)" }} />
    </>
  );
}

/** Karte wie bei Pinterest: großes Bild, darunter Name und eine Zeile; Höhe wechselt für das Mauerwerk */
export function ExerciseCard({ e, tall, minutes }: { e: Exercise; tall?: boolean; minutes?: number }) {
  const [prefs] = usePrefs();
  const fav = prefs.favorites.includes(e.id);
  return (
    <div className="group relative">
      <Link to={`/uebung/${e.id}`} className="press block">
        <div className="relative overflow-hidden rounded-[22px]" style={{ background: artBg(e), aspectRatio: tall ? "3 / 4" : "1 / 1" }}>
          <Photo e={e} className="transition-transform duration-500 group-hover:scale-[1.03]" />
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/35 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur">{durationLabel(totalSec(e, minutes ?? e.minutes))}</span>
        </div>
        <div className="px-1 pt-2">
          <p className="text-[15px] leading-5 font-semibold">{e.name}</p>
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-[18px] text-muted">{e.short}</p>
        </div>
      </Link>
      <button type="button" onClick={() => toggleFavorite(e.id)} aria-pressed={fav} aria-label={fav ? "Aus Favoriten entfernen" : "Zu Favoriten"} className="absolute top-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur transition active:scale-90">
        <Heart size={17} fill={fav ? "currentColor" : "none"} />
      </button>
    </div>
  );
}

/** breite Zeile (Empfehlung, Liste) */
export function ExerciseRow({ e, sub, onClick, to }: { e: Exercise; sub?: string; onClick?: () => void; to?: string }) {
  const inner = (
    <>
      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl" style={{ background: artBg(e) }}><Photo e={e} w={160} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-semibold">{e.name}</span>
        <span className="mt-0.5 line-clamp-2 block text-[13.5px] leading-[19px] text-muted">{sub ?? e.short}</span>
      </span>
      <span className="shrink-0 text-small text-muted tabular-nums">{durationLabel(totalSec(e))}</span>
    </>
  );
  const cls = "press flex w-full items-center gap-3.5 rounded-2xl p-2 text-left hover:bg-fg/[0.04]";
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

export const categoryLabel = (e: Exercise) => categoryOf(e.category).label;
