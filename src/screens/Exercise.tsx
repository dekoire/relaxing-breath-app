import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { AudioLines, ChevronDown, ChevronLeft, FlaskConical, Play, TriangleAlert, VolumeX } from "lucide-react";
import { EVIDENCE_LABEL, durationLabel, exerciseById, flexible, rhythmWords, tagOf, totalSec } from "@/data/exercises";
import { Photo, artBg, useExerciseMenu } from "@/components/Art";
import { photoOf } from "@/data/photos";
import { BreatheView } from "@/components/Breathe";
import { EmptyState, EqualList, MoreButton, Pill } from "@/components/primitives";
import { TagMark } from "@/components/TagLook";
import { hush, say, useVoices } from "@/lib/speech";
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
  return <Detail e={e} total={totalSec(e, prefs.minutes[e.id] ?? e.minutes)} nav={nav} />;
}

/**
 * Wie bei Pinterest: vorne nur Bild, Name, ein Satz und „Starten“. Darunter knapp, wie es geht.
 * Alles Weitere (warum, Studie, wobei es hilft) zum Aufklappen, Favorit/Teilen/Ähnliche hinter „⋯“.
 */
function Detail({ e, total, nav }: { e: NonNullable<ReturnType<typeof exerciseById>>; total: number; nav: ReturnType<typeof useNavigate> }) {
  const menu = useExerciseMenu(e);
  const [prefs, setPrefs] = usePrefs();
  const voices = useVoices();
  const [more, setMore] = useState(false);
  return (
    <div>
      {/* Bedienung über dem Bild auf normalem Grund, nie auf dem Foto */}
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => nav(-1)} aria-label="Zurück" className="grid h-11 w-11 place-items-center rounded-full bg-fg/[0.07] hover:bg-fg/[0.12]"><ChevronLeft size={21} /></button>
        <MoreButton items={menu} title={e.name} className="h-11 w-11 bg-fg/[0.07]" />
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]" style={{ background: artBg(e) }}><Photo e={e} w={1080} /></div>
      <h1 className="mt-5 text-[30px] leading-9 font-bold tracking-tight">{e.name}</h1>
      <p className="mt-1.5 text-body leading-6 text-soft">{e.short}</p>

      <button type="button" onClick={() => nav(`/atmen/${e.id}`)} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-500 text-[17px] font-semibold text-white"><Play size={18} fill="currentColor" /> Starten · {durationLabel(total)}</button>
      <p className="mt-3 text-center text-small text-muted">{e.cycle.length > 1 ? `${e.cycle.length} Teile` : rhythmWords(e)} · <span className="capitalize">{e.level}</span></p>

      {/* vor dem Start einstellen: wie lange und welche Stimme */}
      <div className="mt-6 grid gap-2.5">
        {flexible(e) && (
          <div className="grid grid-cols-4 gap-1 rounded-full bg-fg/[0.06] p-1" role="radiogroup" aria-label="Dauer">
            {[1, 3, 5, 10].map((x) => { const on = x === (prefs.minutes[e.id] ?? e.minutes); return (
              <button key={x} type="button" role="radio" aria-checked={on} onClick={() => setPrefs({ minutes: { ...prefs.minutes, [e.id]: x } })} className={`h-11 rounded-full text-[15px] font-semibold transition ${on ? "bg-fg text-canvas" : "text-muted hover:text-fg"}`}>{x} Min.</button>
            ); })}
          </div>
        )}
        <MoreButton label="Stimme wählen" title="Stimme" className="flex h-14 w-full items-center gap-3 rounded-full bg-fg/[0.06] py-2 pr-5 pl-2 text-left hover:bg-fg/[0.09]"
          items={[{ label: "Ohne Stimme", icon: <VolumeX />, onClick: () => { hush(); setPrefs({ voice: false }); } },
            ...(voices.length ? voices : [{ name: "" } as SpeechSynthesisVoice]).map((v) => ({ label: v.name || "Stimme des Handys", icon: <AudioLines />, onClick: () => { setPrefs({ voice: true, voiceName: v.name }); void say("Einatmen. Und langsam ausatmen.", { voiceName: v.name }); } }))]}>
          <span className="accent-chip grid h-10 w-10 shrink-0 place-items-center rounded-full">{prefs.voice ? <AudioLines size={18} /> : <VolumeX size={18} />}</span>
          <span className="min-w-0 flex-1"><span className="block text-caption text-muted">Stimme</span><span className="block truncate text-[15px] font-semibold">{prefs.voice ? prefs.voiceName || voices[0]?.name || "Stimme des Handys" : "Ohne Stimme"}</span></span>
          <ChevronDown size={18} className="text-muted" />
        </MoreButton>
      </div>

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
            <div className="mt-3 flex flex-wrap gap-2">{e.tags.map((t) => <Pill key={t} icon={<TagMark id={t} group={tagOf(t)?.group ?? ""} />} onClick={() => nav(`/entdecken?tag=${t}`)}>{tagOf(t)?.label ?? t}</Pill>)}</div>
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
