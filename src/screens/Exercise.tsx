import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ChevronDown, ChevronLeft, FlaskConical, Heart, Play, TriangleAlert } from "lucide-react";
import { EVIDENCE_LABEL, durationLabel, exerciseById, rhythmWords, tagOf, totalSec } from "@/data/exercises";
import { Photo, artBg, useExerciseMenu } from "@/components/Art";
import { photoOf } from "@/data/photos";
import { BreatheView } from "@/components/Breathe";
import { Badge, EmptyState, EqualList, MoreButton } from "@/components/primitives";
import { usePrefs } from "@/lib/prefs";
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
  return <Detail e={e} total={totalSec(e, prefs.minutes[e.id] ?? e.minutes)} fav={prefs.favorites.includes(e.id)} nav={nav} />;
}

/**
 * Wie bei Pinterest: vorne nur Bild, Name, ein Satz und „Starten“. Darunter knapp, wie es geht.
 * Alles Weitere (warum, Studie, wobei es hilft) zum Aufklappen, Favorit/Teilen/Ähnliche hinter „⋯“.
 */
function Detail({ e, total, fav, nav }: { e: NonNullable<ReturnType<typeof exerciseById>>; total: number; fav: boolean; nav: ReturnType<typeof useNavigate> }) {
  const menu = useExerciseMenu(e);
  const [more, setMore] = useState(false);
  return (
    <div>
      <div className="relative -mx-6 -mt-5 overflow-hidden md:mx-0 md:mt-0 md:rounded-[28px]" style={{ background: artBg(e) }}>
        <Photo e={e} w={1080} />
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(29,33,41,0) 40%, rgba(29,33,41,.85) 100%)" }} />
        <div className="top-safe relative flex items-center justify-between px-6">
          <button type="button" onClick={() => nav(-1)} aria-label="Zurück" className="grid h-11 w-11 place-items-center rounded-full bg-black/25 text-white backdrop-blur"><ChevronLeft size={21} /></button>
          <MoreButton items={menu} title={e.name} light className="h-11 w-11" />
        </div>
        <div className="h-64" />
        <div className="relative px-6 pb-7 text-white">
          <h1 className="flex items-center gap-2 text-[32px] leading-[38px] font-bold tracking-tight">{e.name}{fav && <Heart size={20} fill="currentColor" className="shrink-0 text-white/80" aria-label="Favorit" />}</h1>
          <p className="mt-2 text-body leading-6 text-white/85">{e.short}</p>
        </div>
      </div>

      <button type="button" onClick={() => nav(`/atmen/${e.id}`)} className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-500 text-[17px] font-semibold text-white"><Play size={18} fill="currentColor" /> Starten · {durationLabel(total)}</button>
      <p className="mt-3 text-center text-small text-muted">{e.cycle.length > 1 ? `${e.cycle.length} Teile` : rhythmWords(e)} · <span className="capitalize">{e.level}</span></p>

      {e.caution && <p className="mt-6 flex gap-3 rounded-[22px] bg-fg/[0.05] px-5 py-4 text-small leading-[21px] text-soft"><TriangleAlert size={19} className="shrink-0" />{e.caution}</p>}

      <h2 className="mt-10 text-[22px] font-bold tracking-tight">So geht's</h2>
      <EqualList className="mt-4" items={e.how.map((h, k) => ({ key: h, lead: k + 1, text: h }))} />

      <button type="button" onClick={() => setMore((x) => !x)} aria-expanded={more} className="mt-10 flex h-12 w-full items-center justify-between rounded-full bg-fg/[0.06] px-5 text-[15px] font-semibold hover:bg-fg/[0.1]">
        Mehr über diese Übung <ChevronDown size={18} className={`text-muted transition-transform ${more ? "rotate-180" : ""}`} />
      </button>
      {more && (
        <div className="reveal-up mt-5 space-y-7 px-1">
          <section>
            <h3 className="text-[17px] font-semibold">Warum es hilft</h3>
            <p className="mt-2 text-body leading-7 text-soft">{e.why}</p>
            {e.evidence && <p className="mt-3 flex items-center gap-2 text-small text-muted"><FlaskConical size={15} /> {EVIDENCE_LABEL[e.evidence]}{e.study ? ` · ${e.study}` : ""}</p>}
          </section>
          {e.cycle.length > 1 && (
            <section>
              <h3 className="text-[17px] font-semibold">Ablauf</h3>
              <div className="mt-3 grid gap-2">{e.cycle.map((b) => <p key={b.label} className="flex justify-between rounded-full bg-fg/[0.05] px-5 py-3 text-small"><span className="font-semibold">{b.label}</span><span className="text-muted">{b.phases.map((p) => String(p.s).replace(".", ",")).join(" · ")} Sek.{b.repeat > 1 ? ` × ${b.repeat}` : ""}</span></p>)}</div>
            </section>
          )}
          <section>
            <h3 className="text-[17px] font-semibold">Hilft bei</h3>
            <div className="mt-3 flex flex-wrap gap-2">{e.tags.map((t) => <button key={t} type="button" onClick={() => nav(`/entdecken?tag=${t}`)}><Badge>{tagOf(t)?.label ?? t}</Badge></button>)}</div>
          </section>
          <p className="text-caption leading-5 text-muted">Foto: {e.image ? "eigenes Bild" : `${photoOf(e).by} · Unsplash`}. Atemübungen ersetzen keine ärztliche oder psychotherapeutische Behandlung.</p>
        </div>
      )}
    </div>
  );
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
