import { Link, useNavigate } from "react-router";
import { ChevronRight, Compass, Heart, LayoutGrid, List, Play, Share2 } from "lucide-react";
import { MoreButton, type SheetItem } from "@/components/primitives";
import type { Exercise, Motif } from "@/data/exercises";
import { categoryOf, durationLabel, totalSec } from "@/data/exercises";
import { toggleFavorite, usePrefs, type Layout } from "@/lib/prefs";
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

/** Was hinter „⋯“ einer Übung steht: Starten, Favorit, Ähnliche, Teilen (überall gleich) */
export function useExerciseMenu(e: Exercise): SheetItem[] {
  const nav = useNavigate();
  const [prefs] = usePrefs();
  const fav = prefs.favorites.includes(e.id);
  return [
    { label: "Jetzt starten", icon: <Play />, onClick: () => nav(`/atmen/${e.id}`) },
    { label: fav ? "Aus Favoriten entfernen" : "Zu Favoriten", icon: <Heart />, onClick: () => toggleFavorite(e.id) },
    { label: "Ähnliche Übungen", icon: <Compass />, sub: categoryOf(e.category).label, onClick: () => nav(`/entdecken?kat=${e.category}`) },
    { label: "Teilen", icon: <Share2 />, onClick: () => { const url = `${location.origin}/uebung/${e.id}`; if (navigator.share) void navigator.share({ title: e.name, text: e.short, url }).catch(() => undefined); else void navigator.clipboard?.writeText(url); } },
  ];
}

/** Karte wie bei Pinterest: großes Bild, darunter Name mit „⋯“ und eine Zeile; Höhe wechselt für das Mauerwerk */
export function ExerciseCard({ e, tall, minutes }: { e: Exercise; tall?: boolean; minutes?: number }) {
  const [prefs] = usePrefs();
  const fav = prefs.favorites.includes(e.id);
  const menu = useExerciseMenu(e);
  return (
    <div className="group relative">
      <Link to={`/uebung/${e.id}`} className="press block">
        <div className="relative overflow-hidden rounded-[22px]" style={{ background: artBg(e), aspectRatio: tall ? "3 / 4" : "1 / 1" }}>
          <Photo e={e} className="transition-transform duration-500 group-hover:scale-[1.03]" />
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/35 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur">{durationLabel(totalSec(e, minutes ?? e.minutes))}</span>
        </div>
      </Link>
      <div className="flex items-start gap-1 pt-2 pl-1">
        <Link to={`/uebung/${e.id}`} className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[15px] leading-5 font-semibold"><span className="min-w-0 truncate">{e.name}</span>{fav && <Heart size={13} fill="currentColor" className="shrink-0 text-brand-400" aria-label="Favorit" />}</p>
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-[18px] text-muted">{e.short}</p>
        </Link>
        <MoreButton items={menu} title={e.name} className="-mt-1.5" />
      </div>
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

/**
 * Längliche Kachel (Liste): links das Bild, das nach rechts weich in die Kartenfläche ausläuft, rechts Name, eine Zeile
 * und Dauer. Gleiche Höhe für alle, damit die Liste ruhig wirkt. Für Übungen und Kategorien.
 */
/** Bild läuft nach rechts in die Karte aus (Maske, passt zu jeder Kartenfarbe) */
const FADE = "linear-gradient(90deg, #000 22%, rgba(0,0,0,.6) 52%, rgba(0,0,0,.18) 78%, transparent 100%)";
export function LongTile({ to, img, bg, title, sub, meta, right }: { to: string; img: string; bg: string; title: string; sub: string; meta?: string; right?: React.ReactNode }) {
  return (
    <div className="group relative">
      <Link to={to} className="press relative flex min-h-[124px] items-stretch overflow-hidden rounded-[22px] border border-card-line bg-surface">
        <span aria-hidden className="absolute inset-y-0 left-0 w-[58%] max-w-[260px] overflow-hidden" style={{ background: bg, WebkitMaskImage: FADE, maskImage: FADE }}>
          <img src={img} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        </span>
        <span className="relative ml-[40%] flex min-w-0 flex-1 flex-col justify-center py-4 pr-12 pl-2 sm:ml-[180px]">
          <span className="line-clamp-2 text-[16px] leading-[21px] font-semibold">{title}</span>
          <span className="mt-1 line-clamp-2 text-[13.5px] leading-[19px] text-muted/90">{sub}</span>
          {meta && <span className="mt-1.5 text-caption font-semibold text-soft tabular-nums">{meta}</span>}
        </span>
        {!right && <ChevronRight size={18} className="absolute top-1/2 right-4 -translate-y-1/2 text-muted" />}
      </Link>
      {right}
    </div>
  );
}

/** in der Liste nur der erste Satz, damit es ruhig bleibt */
const firstSentence = (t: string) => (/^[^.!?]{12,}[.!?]/.exec(t)?.[0] ?? t);

export function ExerciseLong({ e }: { e: Exercise }) {
  const [prefs] = usePrefs();
  const fav = prefs.favorites.includes(e.id);
  const menu = useExerciseMenu(e);
  return (
    <LongTile to={`/uebung/${e.id}`} img={imageOf(e, 400)} bg={artBg(e)} title={fav ? `${e.name} ♥` : e.name} sub={firstSentence(e.short)} meta={durationLabel(totalSec(e, prefs.minutes[e.id] ?? e.minutes))}
      right={<MoreButton items={menu} title={e.name} className="absolute top-1/2 right-2 -translate-y-1/2" />} />
  );
}

/** Übungen als Mauerwerk oder Liste, je nach Einstellung */
export function ExerciseGrid({ list }: { list: Exercise[] }) {
  const [prefs] = usePrefs();
  if (prefs.layout === "list") return <div className="grid gap-2.5 lg:grid-cols-2">{list.map((e) => <ExerciseLong key={e.id} e={e} />)}</div>;
  return <div className="masonry">{list.map((e, k) => <ExerciseCard key={e.id} e={e} tall={k % 3 === 0} />)}</div>;
}

/** kleiner Schalter Kacheln | Liste (Symbole), gleiche Einstellung wie in den Einstellungen */
export function LayoutSwitch() {
  const [prefs, setPrefs] = usePrefs();
  const opt = (id: Layout, I: typeof List, label: string) => (
    <button type="button" role="radio" aria-checked={prefs.layout === id} aria-label={label} title={label} onClick={() => setPrefs({ layout: id })}
      className={`grid h-9 w-10 place-items-center rounded-full transition-colors ${prefs.layout === id ? "bg-fg text-canvas" : "text-muted hover:text-fg"}`}><I size={17} /></button>
  );
  return <div role="radiogroup" aria-label="Ansicht" className="inline-flex rounded-full bg-fg/[0.07] p-0.5">{opt("tiles", LayoutGrid, "Kacheln")}{opt("list", List, "Liste")}</div>;
}

export const categoryLabel = (e: Exercise) => categoryOf(e.category).label;
