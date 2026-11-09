import { useNavigate, useParams, useSearchParams } from "react-router";
import { ChevronLeft, FlaskConical, Heart, Play, TriangleAlert } from "lucide-react";
import { EVIDENCE_LABEL, categoryOf, durationLabel, exerciseById, rhythmLabel, tagOf, totalSec } from "@/data/exercises";
import { Photo, artBg } from "@/components/Art";
import { photoOf } from "@/data/photos";
import { BreatheView } from "@/components/Breathe";
import { Badge, EmptyState } from "@/components/primitives";
import { toggleFavorite, usePrefs } from "@/lib/prefs";
import { useStore } from "@/lib/store";
import { newId, todayIso } from "@/lib/types";
import { Wind } from "lucide-react";

/** Übung im Detail: großes Bild, Start, warum es wirkt, so geht's, Schlagwörter (führen in die Suche) */
export default function ExercisePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const e = exerciseById(id);
  const [prefs] = usePrefs();
  if (!e) return <EmptyState icon={<Wind />} title="Übung nicht gefunden" text="Vielleicht wurde sie umbenannt." />;
  const fav = prefs.favorites.includes(e.id);
  const total = totalSec(e, prefs.minutes[e.id] ?? e.minutes);
  return (
    <div>
      <div className="relative -mx-5 -mt-5 overflow-hidden md:mx-0 md:mt-0 md:rounded-[28px]" style={{ background: artBg(e) }}>
        <Photo e={e} w={1080} />
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(29,33,41,0) 35%, rgba(29,33,41,.85) 100%)" }} />
        <div className="top-safe relative flex items-center justify-between px-5">
          <button type="button" onClick={() => nav(-1)} aria-label="Zurück" className="grid h-11 w-11 place-items-center rounded-full bg-black/25 text-white backdrop-blur"><ChevronLeft size={21} /></button>
          <button type="button" onClick={() => toggleFavorite(e.id)} aria-pressed={fav} aria-label={fav ? "Aus Favoriten entfernen" : "Zu Favoriten"} className="grid h-11 w-11 place-items-center rounded-full bg-black/25 text-white backdrop-blur"><Heart size={19} fill={fav ? "currentColor" : "none"} /></button>
        </div>
        <div className="h-56" />
        <div className="relative px-5 pb-6 text-white">
          <p className="text-small font-semibold text-white/70">{categoryOf(e.category).label} · {e.level}</p>
          <h1 className="mt-1 text-[32px] leading-[38px] font-bold tracking-tight">{e.name}</h1>
          <p className="mt-2 text-body leading-6 text-white/85">{e.short}</p>
        </div>
      </div>

      <button type="button" onClick={() => nav(`/atmen/${e.id}`)} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-500 text-[17px] font-semibold text-white"><Play size={18} fill="currentColor" /> Starten · {durationLabel(total)}</button>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <Fact label="Rhythmus" value={e.cycle.length > 1 ? `${e.cycle.length} Teile` : rhythmLabel(e)} />
        <Fact label="Dauer" value={durationLabel(total)} />
        <Fact label="Niveau" value={e.level} />
      </div>

      {e.caution && <p className="mt-5 flex gap-3 rounded-2xl bg-fg/[0.05] px-4 py-3.5 text-small leading-[21px] text-soft"><TriangleAlert size={19} className="shrink-0 text-brand-400" />{e.caution}</p>}

      <h2 className="mt-8 text-[22px] font-bold tracking-tight">Warum es hilft</h2>
      <p className="mt-2 text-body leading-7 text-soft">{e.why}</p>
      {e.evidence && (
        <button type="button" onClick={() => nav("/entdecken?gut=1")} className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-fg/[0.05] px-4 py-3 text-left">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-tile bg-lavender text-brand-400"><FlaskConical size={17} /></span>
          <span className="min-w-0"><span className="block text-small font-semibold">{EVIDENCE_LABEL[e.evidence]}</span>{e.study && <span className="block truncate text-caption text-muted">{e.study}</span>}</span>
        </button>
      )}

      <h2 className="mt-8 text-[22px] font-bold tracking-tight">So geht's</h2>
      <ol className="mt-3 grid gap-2.5">
        {e.how.map((h, k) => <li key={h} className="flex gap-3 rounded-2xl border border-card-line bg-surface px-4 py-3.5"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lavender text-small font-bold text-brand-400">{k + 1}</span><span className="text-body leading-6">{h}</span></li>)}
      </ol>
      {e.cycle.length > 1 && (
        <div className="mt-3 grid gap-2">
          {e.cycle.map((b) => <p key={b.label} className="flex justify-between rounded-2xl bg-fg/[0.05] px-4 py-3 text-small"><span className="font-semibold">{b.label}</span><span className="text-muted">{b.phases.map((p) => String(p.s).replace(".", ",")).join(" · ")} s{b.repeat > 1 ? ` × ${b.repeat}` : ""}</span></p>)}
        </div>
      )}

      <h2 className="mt-8 text-[22px] font-bold tracking-tight">Hilft bei</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {e.tags.map((t) => <button key={t} type="button" onClick={() => nav(`/entdecken?tag=${t}`)}><Badge>{tagOf(t)?.label ?? t}</Badge></button>)}
      </div>
      <p className="mt-8 text-caption leading-5 text-muted">Foto: {e.image ? "eigenes Bild" : `${photoOf(e).by} · Unsplash`}. Atemübungen ersetzen keine ärztliche oder psychotherapeutische Behandlung.</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-card-line bg-surface px-2 py-3"><p className="text-caption text-muted">{label}</p><p className="mt-0.5 truncate text-[15px] font-semibold capitalize">{value}</p></div>;
}

/** /atmen/:id – die Übung im Vollbild; speichert danach die Sitzung und (aus dem Check-in) die Stimmung danach */
export function BreathePage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { saveSession, saveCheckin, checkins } = useStore();
  const e = exerciseById(id);
  if (!e) return null;
  const ck = params.get("checkin") ?? undefined;
  const leave = () => (ck ? nav("/", { replace: true }) : nav(-1));
  return (
    <BreatheView
      exercise={e}
      onClose={leave}
      onDone={(r) => {
        if (r.seconds > 5) saveSession({ id: newId("s"), createdAt: new Date().toISOString(), date: todayIso(), exerciseId: e.id, seconds: r.seconds, completed: r.completed, checkinKey: ck, moodAfter: r.moodAfter });
        const c = ck ? checkins.find((x) => x.id === ck) : undefined;
        if (c && r.moodAfter) saveCheckin({ ...c, moodAfter: r.moodAfter });
        leave();
      }}
    />
  );
}
