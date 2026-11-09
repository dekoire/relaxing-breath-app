import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Award, Flame, Lock, Sparkles, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { badges, bestStreak, levelOf, points, type Badge } from "@/lib/progress";
import { streak } from "@/lib/stats";

/** Fortschritt aus den Daten (Punkte, Stufe, Serie, Abzeichen) – ein Hook für alle Stellen */
export function useProgress() {
  const { checkins, sessions } = useStore();
  return useMemo(() => {
    const p = points(checkins, sessions);
    return { points: p, level: levelOf(p), streak: streak(checkins, sessions), best: bestStreak(checkins, sessions), badges: badges(checkins, sessions) };
  }, [checkins, sessions]);
}

/** Karte „Dein Weg“: Stufe mit Balken bis zur nächsten, Punkte, Serie jetzt und beste */
export function ProgressCard({ link }: { link?: boolean }) {
  const g = useProgress();
  const body = (
    <div className="rounded-[28px] border border-card-line bg-surface p-5">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-500 text-[20px] font-bold text-white tabular-nums">{g.level.n}</span>
        <div className="min-w-0 flex-1">
          <p className="text-small font-semibold text-muted">Stufe {g.level.n}</p>
          <p className="truncate text-[20px] leading-7 font-semibold">{g.level.name}</p>
        </div>
        <p className="text-right"><span className="block text-[22px] leading-7 font-bold tabular-nums">{g.points}</span><span className="text-caption text-muted">Punkte</span></p>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-fg/[0.08]"><span className="block h-full rounded-full bg-brand-500 transition-all" style={{ width: `${Math.round(g.level.share * 100)}%` }} /></div>
      <p className="mt-2 text-small text-muted">{g.level.next ? `Noch ${g.level.toNext} Punkte bis Stufe ${g.level.n + 1}` : "Höchste Stufe erreicht"}</p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <p className="flex items-center gap-2.5 rounded-full bg-fg/[0.05] py-2 pr-4 pl-2"><span className="accent-chip grid h-9 w-9 place-items-center rounded-full"><Flame size={17} /></span><span><b className="block text-[15px] leading-5">{g.streak} {g.streak === 1 ? "Tag" : "Tage"}</b><span className="text-caption text-muted">in Folge</span></span></p>
        <p className="flex items-center gap-2.5 rounded-full bg-fg/[0.05] py-2 pr-4 pl-2"><span className="accent-chip grid h-9 w-9 place-items-center rounded-full"><Award size={17} /></span><span><b className="block text-[15px] leading-5">{g.badges.filter((b) => b.earned).length} von {g.badges.length}</b><span className="text-caption text-muted">Abzeichen</span></span></p>
      </div>
    </div>
  );
  return link ? <Link to="/rueckblick" className="press block">{body}</Link> : body;
}

/** Abzeichen als Raster: verdiente hell, offene blass mit Fortschritt */
export function BadgeGrid({ list }: { list: Badge[] }) {
  return (
    <div className="grid auto-rows-fr grid-cols-2 gap-2.5 sm:grid-cols-3">
      {list.map((b) => (
        <div key={b.id} className={`flex flex-col rounded-[22px] border border-card-line p-4 ${b.earned ? "bg-surface" : "bg-surface/50"}`}>
          <span className={`grid h-11 w-11 place-items-center rounded-full ${b.earned ? "bg-brand-500 text-white" : "bg-fg/[0.07] text-muted"}`}>{b.earned ? <Award size={20} /> : <Lock size={17} />}</span>
          <p className={`mt-3 text-[15px] leading-5 font-semibold ${b.earned ? "" : "text-soft"}`}>{b.title}</p>
          <p className="mt-0.5 line-clamp-2 text-caption leading-4 text-muted">{b.text}</p>
          {/* Fuß bei allen gleich, damit jede Kachel gleich hoch ist */}
          <div className="mt-auto pt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-fg/[0.08]"><span className={`block h-full rounded-full ${b.earned ? "bg-brand-500" : "bg-fg/40"}`} style={{ width: `${(b.now / b.goal) * 100}%` }} /></div>
            <p className="mt-1 text-label text-muted tabular-nums">{b.earned ? "Geschafft" : b.goal > 1 ? `${b.now} von ${b.goal}` : "Noch offen"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Zeigt kurz unten eine Meldung, wenn ein neues Abzeichen dazukommt. Beim allerersten Start werden alle schon
 * verdienten still gemerkt (`atem:badges-seen`), damit niemand mit Meldungen überschüttet wird.
 */
export function BadgeWatcher() {
  const g = useProgress();
  const [show, setShow] = useState<Badge>();
  const earned = g.badges.filter((b) => b.earned).map((b) => b.id).join(",");
  useEffect(() => {
    let seen: string[] | undefined;
    try { const v = localStorage.getItem("atem:badges-seen"); seen = v ? JSON.parse(v) : undefined; } catch { /* egal */ }
    const now = earned ? earned.split(",") : [];
    if (!seen) { try { localStorage.setItem("atem:badges-seen", JSON.stringify(now)); } catch { /* egal */ } return; }
    const fresh = now.filter((id) => !seen!.includes(id));
    if (!fresh.length) return;
    try { localStorage.setItem("atem:badges-seen", JSON.stringify(now)); } catch { /* egal */ }
    setShow(g.badges.find((b) => b.id === fresh[0]));
  }, [earned]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!show) return; const t = window.setTimeout(() => setShow(undefined), 6000); return () => window.clearTimeout(t); }, [show]);
  if (!show) return null;
  return (
    <div role="status" className="reveal-up fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+104px)] z-[400] mx-auto max-w-md">
      <div className="flex items-center gap-3.5 rounded-full border border-card-line bg-surface-2 py-2.5 pr-3 pl-2.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,.55)]">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-500 text-white"><Sparkles size={21} /></span>
        <span className="min-w-0 flex-1"><span className="block text-caption font-semibold text-muted">Neues Abzeichen</span><span className="block truncate text-[16px] font-semibold">{show.title}</span></span>
        <button type="button" onClick={() => setShow(undefined)} aria-label="Schließen" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted hover:bg-fg/[0.06]"><X size={17} /></button>
      </div>
    </div>
  );
}
