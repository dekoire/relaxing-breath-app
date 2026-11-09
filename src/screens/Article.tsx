import { useNavigate, useParams } from "react-router";
import { BookOpen, ChevronLeft } from "lucide-react";
import { articleById, articleImage } from "@/data/articles";
import { exerciseById } from "@/data/exercises";
import { ExerciseRow } from "@/components/Art";
import { EmptyState, Section } from "@/components/primitives";

/** Artikel aus „Gut zu wissen“: großes Bild, kurzer Text mit fetten Zwischenzeilen, passende Übungen, Quelle */
export default function ArticlePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const a = articleById(id);
  if (!a) return <EmptyState icon={<BookOpen />} title="Artikel nicht gefunden" text="Vielleicht wurde er umbenannt." />;
  const ex = a.exercises.map((x) => exerciseById(x)).filter((e): e is NonNullable<typeof e> => !!e);
  return (
    <div>
      <div className="relative -mx-5 -mt-5 overflow-hidden bg-surface-3 md:mx-0 md:mt-0 md:rounded-[28px]">
        <img src={articleImage(a, 1080)} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,22,30,.1) 30%, rgba(20,22,30,.9) 100%)" }} />
        <div className="top-safe relative px-5">
          <button type="button" onClick={() => nav(-1)} aria-label="Zurück" className="grid h-11 w-11 place-items-center rounded-full bg-black/25 text-white backdrop-blur"><ChevronLeft size={21} /></button>
        </div>
        <div className="h-44" />
        <div className="relative px-5 pb-6 text-white">
          <p className="text-small font-semibold text-white/70">Gut zu wissen · {a.minutes} Min. lesen</p>
          <h1 className="mt-1 text-[30px] leading-9 font-bold tracking-tight">{a.title}</h1>
          <p className="mt-2 text-body leading-6 text-white/85">{a.teaser}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {a.body.map((p) => {
          const m = /^\*\*(.+?)\*\*\s*(.*)$/.exec(p);
          return <p key={p} className="text-body leading-7 text-soft">{m ? <><b className="font-semibold text-fg">{m[1]}</b> {m[2].split(/\*\*(.+?)\*\*/).map((t, k) => k % 2 ? <b key={k} className="font-semibold text-fg">{t}</b> : t)}</> : p}</p>;
        })}
      </div>

      {ex.length > 0 && (
        <Section title="Gleich ausprobieren">
          <div className="grid gap-1">{ex.map((e) => <ExerciseRow key={e.id} e={e} to={`/uebung/${e.id}`} />)}</div>
        </Section>
      )}
      <p className="mt-8 text-caption leading-5 text-muted">{a.source ? `Quelle: ${a.source}. ` : ""}Foto: {a.photo.by} · Unsplash. Kein Ersatz für ärztlichen Rat.</p>
    </div>
  );
}
