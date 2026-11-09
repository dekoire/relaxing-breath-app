import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { BarChart3, Compass, Plus, Settings, Sun, type LucideIcon } from "lucide-react";

/**
 * Rahmen wie in Notara: Seite auf grauem Grund, unten am Handy eine schwebende, runde Leiste (gewählter Punkt nur mit
 * weichem Licht vom unteren Rand). Fünf Plätze: Heute · Entdecken · Check-in (Mitte, groß) · Rückblick · Einstellungen.
 * Mobil zuerst; am Rechner bleibt die Leiste unten und der Inhalt schmal in der Mitte (wie eine App).
 */
type Nav = { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean };
const NAV: Nav[] = [
  { href: "/", label: "Heute", icon: Sun, match: (p) => p === "/" },
  { href: "/entdecken", label: "Entdecken", icon: Compass, match: (p) => p.startsWith("/entdecken") || p.startsWith("/uebung") },
  { href: "/rueckblick", label: "Rückblick", icon: BarChart3, match: (p) => p.startsWith("/rueckblick") },
  { href: "/einstellungen", label: "Profil", icon: Settings, match: (p) => p.startsWith("/einstellungen") },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = useLocation().pathname;
  useEffect(() => { window.scrollTo(0, 0); }, [path]);
  return (
    <div className="min-h-dvh bg-page">
      <main className="pt-safe mx-auto w-full max-w-3xl px-4 pt-4 pb-[calc(var(--bottom-nav-height)+2.5rem)] md:px-6 md:pt-8">
        {children}
      </main>
      <div aria-hidden className="nav-shade pointer-events-none fixed inset-x-0 bottom-0 z-[29] h-24" />
      <nav aria-label="Navigation" className="nav-bar fixed inset-x-2.5 bottom-[max(10px,env(safe-area-inset-bottom)-8px)] z-30 mx-auto max-w-md rounded-full backdrop-blur-2xl backdrop-saturate-150">
        <div className="grid h-[76px] grid-cols-5 items-center overflow-hidden rounded-full px-2">
          <Tab n={NAV[0]} on={NAV[0].match(path)} />
          <Tab n={NAV[1]} on={NAV[1].match(path)} />
          <Link to="/checkin" aria-label="Check-in: Wie geht's dir?" className="relative flex h-full flex-col items-center justify-center gap-1 pt-1 text-label font-semibold text-fg active:scale-95">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-500 text-white shadow-[0_8px_20px_-6px_rgb(var(--brand-rgb)/.7)]"><Plus size={24} strokeWidth={2.4} /></span>
          </Link>
          <Tab n={NAV[2]} on={NAV[2].match(path)} />
          <Tab n={NAV[3]} on={NAV[3].match(path)} />
        </div>
      </nav>
    </div>
  );
}

function Tab({ n, on }: { n: Nav; on: boolean }) {
  const Icon = n.icon;
  return (
    <Link to={n.href} aria-current={on ? "page" : undefined} className={`relative flex h-full flex-col items-center justify-center gap-1 pt-1 text-label font-semibold transition-colors ${on ? "text-fg" : "text-muted hover:text-soft"}`}>
      {on && <span aria-hidden className="nav-glow pointer-events-none absolute inset-x-0 bottom-0 h-full" />}
      <Icon size={22} strokeWidth={on ? 2.2 : 1.8} className={`relative ${on ? "nav-rise" : ""}`} />
      <span className="relative">{n.label}</span>
    </Link>
  );
}
