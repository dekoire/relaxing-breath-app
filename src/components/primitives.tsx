import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, MoreHorizontal, type LucideIcon } from "lucide-react";

/**
 * Basis-Bausteine 1:1 aus Notara (src/components/primitives.tsx, dort aus Finastry). Seiten setzen sich nur aus
 * diesen zusammen. Weggelassen: alles, was Notara-Daten braucht (Farbwahl, Datumskachel, Kennzahl-Verläufe).
 */
type ButtonVariant = "primary" | "secondary" | "outline" | "tertiary" | "destructive";
const BUTTON: Record<ButtonVariant, string> = {
  primary: "bg-brand-500 text-on-primary hover:bg-brand-600 active:brightness-95",
  secondary: "bg-fg/[0.08] text-fg hover:bg-fg/[0.13]",
  outline: "bg-transparent text-fg shadow-[inset_0_0_0_1px_var(--color-card-line)] hover:bg-fg/[0.05]",
  tertiary: "text-brand-400 hover:bg-lavender",
  destructive: "bg-negative-text text-white hover:brightness-95",
};
/** Atem: große Knöpfe (Apple-Gefühl) – md 48, lg 56 */
const BUTTON_SIZE = { sm: "h-9 px-4 text-small", md: "h-12 px-5 text-body", lg: "h-14 px-6 text-[17px]" } as const;

export function Spinner({ size = 20 }: { size?: number }) {
  return <span role="progressbar" aria-label="Lädt" className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent opacity-80" style={{ width: size, height: size }} />;
}

/** EINE Pille (Antworten, Filter, Auswahl): normal grau, gewählt weiß bzw. schwarz gefüllt */
export function Pill({ on = false, icon, className = "", children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean; icon?: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-small font-semibold whitespace-nowrap transition-colors active:scale-95 ${on ? "bg-fg text-canvas" : "bg-fg/[0.08] text-fg hover:bg-fg/[0.13]"} ${className}`} {...rest}>
      {icon}{children}
    </button>
  );
}

export function Button({ variant = "primary", loading, icon, href, className = "", children, size = "md", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; loading?: boolean; icon?: React.ReactNode; href?: string; size?: keyof typeof BUTTON_SIZE }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-[120ms] disabled:cursor-not-allowed disabled:opacity-45 active:scale-[.98] ${BUTTON_SIZE[size]} ${BUTTON[variant]} ${className}`;
  const content = <>{loading ? <Spinner /> : icon}{children}</>;
  if (href) return <Link to={href} className={cls}>{content}</Link>;
  return <button className={cls} disabled={loading || rest.disabled} aria-busy={loading || undefined} {...rest}>{content}</button>;
}

/** EINE Karte (Radius 16 → bei Atem 24, Rand, Fläche) */
export const CARD = "rounded-3xl border border-card-line bg-surface";

export function SurfaceCard({ title, action, children, className = "" }: { title?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`${CARD} p-5 md:p-6 ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="min-w-0 text-title leading-[26px] font-semibold">{title}</h3>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** Kopf für Karten: Symbol-Kachel, Titel, rechts optional Zahl und › */
export function CardHeader({ icon: I, color, title, to, onClick, count, className = "" }: { icon?: LucideIcon; color?: string; title: React.ReactNode; to?: string; onClick?: () => void; count?: React.ReactNode; className?: string }) {
  const body = (
    <>
      {I && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-tile text-white" style={{ background: color ?? "var(--color-brand-500)" }}><I size={18} strokeWidth={2.2} /></span>}
      <span className="min-w-0 flex-1 truncate text-heading font-semibold">{title}</span>
      {count != null && <span className="shrink-0 text-small text-muted tabular-nums">{count}</span>}
      {(to || onClick) && <ChevronRight size={17} strokeWidth={2.4} className="-ml-0.5 shrink-0 text-muted" />}
    </>
  );
  const cls = `flex min-w-0 items-center gap-3 ${className}`;
  if (to) return <Link to={to} className={`${cls} transition-opacity hover:opacity-80`}>{body}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={`${cls} w-full text-left transition-opacity hover:opacity-80`}>{body}</button>;
  return <div className={cls}>{body}</div>;
}

export function EmptyState({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-card-line bg-surface px-6 py-10 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-fg/[0.07] text-fg [&_svg]:size-6">{icon}</span>
      <h3 className="mt-5 text-title leading-[26px] font-semibold">{title}</h3>
      <p className="mt-1 line-clamp-2 max-w-xs text-body leading-[22px] text-muted">{text}</p>
      {action && <div className="mt-6 flex h-12 items-center">{action}</div>}
    </div>
  );
}

/** Hinweis – überall gleich: grau, Symbol vorne, kurze Zeile */
export function Hint({ icon, children, action, className = "" }: { icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={`relative flex items-center gap-3 overflow-hidden rounded-2xl bg-fg/[0.05] px-4 py-3.5 text-small leading-[21px] text-soft [&_b]:font-semibold [&_b]:text-fg ${className}`}>
      <span className="grid shrink-0 place-items-center text-muted [&>svg]:size-[20px]">{icon}</span>
      <span className="min-w-0 flex-1">{children}</span>
      {action && <span className="flex shrink-0 flex-wrap gap-3 font-semibold">{action}</span>}
    </div>
  );
}

/** Reiter: graue Pills, der aktive Reiter schwarz (hell) bzw. weiß (dunkel); die Markierung gleitet */
export function Segmented<T extends string>({ label, options, value, onChange, joined = false }: { label: string; options: { id: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; joined?: boolean }) {
  const active = useRef<HTMLButtonElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number }>();
  useLayoutEffect(() => {
    const measure = () => { const el = active.current; setThumb(el && el.offsetWidth ? { x: el.offsetLeft, w: el.offsetWidth } : undefined); };
    measure();
    const ro = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    if (group.current) ro?.observe(group.current);
    return () => ro?.disconnect();
  }, [value, options.length]);
  return (
    <div className={`no-scrollbar max-w-full overflow-x-auto overscroll-x-contain ${joined ? "w-full" : ""}`}>
      <div ref={group} role="radiogroup" aria-label={label} className={joined ? "relative flex w-full rounded-full bg-fg/[0.07] p-1" : "relative inline-flex w-max gap-2"}>
        {thumb && <span aria-hidden className={`pointer-events-none absolute left-0 h-10 rounded-full bg-fg transition-[transform,width] duration-300 ${joined ? "top-1" : "top-0"}`} style={{ width: thumb.w, transform: `translateX(${thumb.x}px)` }} />}
        {options.map(({ id, label: l, count }) => (
          <button key={id} ref={value === id ? active : undefined} type="button" role="radio" aria-checked={value === id} onClick={() => onChange(id)} className={`relative inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${joined ? "flex-1" : ""} ${value === id ? `${thumb ? "" : "bg-fg"} text-canvas` : joined ? "text-muted hover:text-fg" : "chip-idle text-fg"}`}>
            {l}
            {count !== undefined && count > 0 && <span className={`tnum grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-label leading-none ${value === id ? "bg-canvas/15" : "bg-fg/10"}`}>{count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Badge({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-surface-3 px-2.5 text-caption leading-none font-semibold whitespace-nowrap text-soft [&_svg]:size-3.5">{icon}{children}</span>;
}

/** EIN Zurück-Knopf für alle Seiten */
export function BackLink({ to, onClick, label = "Zurück", className = "" }: { to?: string; onClick?: () => void; label?: string; className?: string }) {
  const cls = `-ml-2 inline-flex h-10 items-center gap-0.5 rounded-full pr-3 pl-1 text-body font-semibold text-soft transition hover:bg-fg/[0.06] hover:text-fg ${className}`;
  const inner = <><ChevronLeft size={22} aria-hidden />{label}</>;
  return to ? <Link to={to} className={cls}>{inner}</Link> : <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

/** Seitentitel groß wie iOS („Large Title“) */
export function PageTitle({ title, sub, right }: { title: React.ReactNode; sub?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <header className="mb-6 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {sub && <p className="text-small font-semibold text-muted">{sub}</p>}
        <h1 className="text-[34px] leading-[40px] font-bold tracking-tight">{title}</h1>
      </div>
      {right}
    </header>
  );
}

/** Abschnitts-Überschrift */
export function Section({ title, action, children, className = "" }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`mt-9 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-[22px] leading-7 font-bold tracking-tight">{title}</h2>{action}</div>
      {children}
    </section>
  );
}

/**
 * „⋯“-Knopf mit Blatt von unten (wie Pinterest): Nebensachen hinter drei Punkten, vorne bleibt nur das Wichtige.
 * Einträge ganz rund; `danger` rot. Escape oder Tippen daneben schließt.
 */
export type SheetItem = { label: string; icon?: React.ReactNode; onClick: () => void; sub?: string };
export function MoreButton({ items, title, className = "", light, children, label }: { items: SheetItem[]; title?: string; className?: string; light?: boolean; children?: React.ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <>
      {children ? (
        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }} aria-label={label} aria-haspopup="dialog" className={className}>{children}</button>
      ) : (
        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }} aria-label="Mehr" aria-haspopup="dialog"
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${light ? "bg-black/30 text-white backdrop-blur hover:bg-black/40" : "text-muted hover:bg-fg/[0.07] hover:text-fg"} ${className}`}>
          <MoreHorizontal size={19} />
        </button>
      )}
      {open && createPortal(
        <div className="fixed inset-0 z-[500] flex items-end justify-center bg-black/45 sm:items-center" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal aria-label={title ?? "Mehr"} onClick={(e) => e.stopPropagation()} className="reveal-up w-full max-w-md rounded-t-[28px] bg-surface p-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:rounded-[28px]">
            <span aria-hidden className="mx-auto mb-2 block h-1 w-10 rounded-full bg-fg/15 sm:hidden" />
            {title && <p className="truncate px-3 pt-1 pb-2 text-small font-semibold text-muted">{title}</p>}
            {items.map((it) => (
              <button key={it.label} type="button" onClick={() => { setOpen(false); it.onClick(); }} className="flex min-h-[54px] w-full items-center gap-3.5 rounded-full px-3 text-left hover:bg-fg/[0.06]">
                {it.icon && <span className="accent-chip grid h-9 w-9 shrink-0 place-items-center rounded-full [&>svg]:size-[17px]">{it.icon}</span>}
                <span className="min-w-0"><span className="block text-[16px] font-medium">{it.label}</span>{it.sub && <span className="block truncate text-caption text-muted">{it.sub}</span>}</span>
              </button>
            ))}
            <button type="button" onClick={() => setOpen(false)} className="mt-1 h-12 w-full rounded-full bg-fg/[0.07] text-[15px] font-semibold">Schließen</button>
          </div>
        </div>, document.body)}
    </>
  );
}

/**
 * Liste gleich großer Karten (Nutzerregel: in einer Gruppe sehen alle Karten gleich aus). Alle so hoch wie die
 * höchste; Rundung für alle gleich: bis zwei Zeilen Text ganz rund, ab drei Zeilen normal (22 px).
 * `lead` = Kreis links (Nummer oder Symbol).
 */
export function EqualList({ items, className = "" }: { items: { key: string; lead: React.ReactNode; text: React.ReactNode }[]; className?: string }) {
  const box = useRef<HTMLOListElement>(null);
  const [round, setRound] = useState(true);
  useLayoutEffect(() => {
    const measure = () => {
      const texts = [...(box.current?.querySelectorAll<HTMLElement>("[data-eq-text]") ?? [])];
      const lh = texts[0] ? parseFloat(getComputedStyle(texts[0]).lineHeight) || 24 : 24;
      setRound(Math.max(0, ...texts.map((t) => Math.round(t.scrollHeight / lh))) <= 2);
    };
    measure();
    const ro = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    if (box.current) ro?.observe(box.current);
    return () => ro?.disconnect();
  }, [items.length]);
  return (
    <ol ref={box} className={`grid auto-rows-fr gap-2.5 ${className}`}>
      {items.map((it) => (
        <li key={it.key} className={`flex items-center gap-3.5 bg-fg/[0.05] ${round ? "rounded-full py-2 pr-6 pl-2" : "rounded-[22px] py-3 pr-5 pl-3"}`}>
          <span className="accent-chip grid h-9 w-9 shrink-0 place-items-center rounded-full text-small font-bold [&>svg]:size-[17px]">{it.lead}</span>
          <span data-eq-text className="min-w-0 text-body leading-6">{it.text}</span>
        </li>
      ))}
    </ol>
  );
}
