import { useMemo } from "react";
import { Link } from "react-router";
import { ArrowRight, Flame, Timer } from "lucide-react";
import { useStore } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";
import { dayStats, streak, week } from "@/lib/stats";
import { PART_TITLE, partOf, recommend, QUADRANT, quadrantOf } from "@/lib/checkin";
import { EXERCISES, exerciseById } from "@/data/exercises";
import { todayIso } from "@/lib/types";
import { ExerciseCard, ExerciseRow, LogoMark } from "@/components/Art";
import { Nova } from "@/components/Nova";
import { MoodFace, MOOD_FLAT } from "@/components/MoodFace";
import { Section } from "@/components/primitives";

/**
 * Heute: groß der Check-in („Wie geht's dir?“) bzw. wie es dir heute ging, darunter was du heute geschafft hast
 * (Minuten, Übungen, Serie), Empfehlungen passend zum letzten Check-in oder zur Tageszeit, Favoriten und die Woche.
 */
const TIME_PICKS: Record<ReturnType<typeof partOf>, string[]> = {
  morning: ["morgen", "wach-werden", "kohaerent", "box"],
  day: ["buero-reset", "seufzer", "box", "schultern"],
  evening: ["abend", "schlaf-48", "einschlaf-leiter", "478"],
};

export default function Home() {
  const { checkins, sessions } = useStore();
  const [prefs] = usePrefs();
  const today = todayIso();
  const part = partOf();
  const s = dayStats(checkins, sessions, today);
  const days = streak(checkins, sessions);
  const w = week(checkins, sessions);
  const last = s.last;
  const picks = useMemo(() => (last ? recommend({ mood: last.mood, energy: last.energy, emotions: last.emotions, body: last.body, part }).map((p) => p.exercise) : TIME_PICKS[part].map((id) => exerciseById(id)!).filter(Boolean)), [last, part]);
  const favs = prefs.favorites.map((id) => exerciseById(id)).filter((e): e is NonNullable<typeof e> => !!e);
  const recent = [...new Set([...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((x) => x.exerciseId))].slice(0, 3).map((id) => exerciseById(id)).filter((e): e is NonNullable<typeof e> => !!e);
  const date = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-small font-semibold text-muted">{date}</p>
          <h1 className="text-[34px] leading-[40px] font-bold tracking-tight">{PART_TITLE[part]}</h1>
        </div>
        <LogoMark size={40} />
      </header>

      {/* Check-in: groß, eine Fläche, ein Knopf */}
      {!last ? (
        <Link to="/checkin" className="press relative block overflow-hidden rounded-[28px] p-6 text-white" style={{ background: "linear-gradient(135deg, #5c49d8 0%, #45407e 100%)" }}>
          <span className="absolute top-5 right-5"><Nova size={64} /></span>
          <p className="relative text-small font-semibold text-white/75">Check-in · 2 Minuten</p>
          <p className="relative mt-1 text-[30px] leading-9 font-bold">Wie geht's dir?</p>
          <p className="relative mt-2 max-w-[80%] text-body leading-6 text-white/80">Kurz hinspüren, reflektieren, dann die passende Atemübung.</p>
          <span className="relative mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-[16px] font-semibold text-[#141522]">Los geht's <ArrowRight size={18} /></span>
        </Link>
      ) : (
        <div className="rounded-[28px] border border-card-line bg-surface p-5">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-white" style={{ background: MOOD_FLAT[Math.round(last.mood)] }}><MoodFace mood={last.mood} size={40} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-small font-semibold text-muted">Heute · {QUADRANT[quadrantOf(last.mood, last.energy)].label}</p>
              <p className="truncate text-[20px] leading-7 font-semibold">{last.emotions.length ? last.emotions.join(", ") : "Eingecheckt"}</p>
              {last.moodAfter != null && <p className="text-small text-muted">Nach dem Atmen: {last.moodAfter > last.mood ? "besser" : last.moodAfter < last.mood ? "schwerer" : "gleich"}</p>}
            </div>
          </div>
          {last.answers[0] && <p className="mt-4 border-l-2 border-brand-500 pl-3 text-body leading-6 text-soft">„{last.answers[0].a}“</p>}
          <Link to="/checkin" className="mt-5 grid h-12 place-items-center rounded-full bg-fg/[0.08] text-[15px] font-semibold hover:bg-fg/[0.13]">Noch einmal einchecken</Link>
        </div>
      )}

      {/* Heute geschafft: eine ruhige Zeile statt drei Zahl-Kacheln (eine Null wirkt wie ein Vorwurf) */}
      {(days > 0 || s.exercises > 0) && (
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-small text-muted">
          {days > 0 && <span className="inline-flex items-center gap-1.5"><Flame size={15} className="text-brand-400" /><b className="font-semibold text-fg">{days}</b> {days === 1 ? "Tag in Folge" : "Tage in Folge"}</span>}
          <span className="inline-flex items-center gap-1.5"><Timer size={15} />{s.exercises ? <><b className="font-semibold text-fg">{s.minutes} Min.</b> heute geatmet</> : "Heute noch nicht geatmet"}</span>
        </p>
      )}

      <Section title={last ? "Passt zu dir jetzt" : part === "evening" ? "Für deinen Abend" : part === "morning" ? "Für deinen Morgen" : "Für zwischendurch"} action={<Link to="/entdecken" className="text-small font-semibold text-muted hover:text-fg">Alle {EXERCISES.length}</Link>}>
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 md:-mx-6 md:px-6">
          {picks.map((e) => <div key={e.id} className="w-[46%] shrink-0 snap-start sm:w-[30%]"><ExerciseCard e={e} tall /></div>)}
        </div>
      </Section>

      {favs.length > 0 && (
        <Section title="Favoriten">
          <div className="grid gap-1">{favs.slice(0, 5).map((e) => <ExerciseRow key={e.id} e={e} to={`/uebung/${e.id}`} />)}</div>
        </Section>
      )}
      {recent.length > 0 && (
        <Section title="Zuletzt geatmet">
          <div className="grid gap-1">{recent.map((e) => <ExerciseRow key={e.id} e={e} to={`/uebung/${e.id}`} />)}</div>
        </Section>
      )}

      <Section title="Deine Woche" action={<Link to="/rueckblick" className="text-small font-semibold text-muted hover:text-fg">Rückblick</Link>}>
        <div className="grid grid-cols-7 gap-2 rounded-3xl border border-card-line bg-surface p-4">
          {w.map((d) => (
            <div key={d.date} className="flex flex-col items-center gap-2">
              <span className={`grid h-10 w-10 place-items-center rounded-full ${d.mood ? "text-white" : "bg-fg/[0.06] text-muted"}`} style={d.mood ? { background: MOOD_FLAT[Math.round(d.mood)] } : undefined}>{d.mood ? <MoodFace mood={d.mood} size={24} /> : "·"}</span>
              <span className={`text-caption font-semibold ${d.date === today ? "text-fg" : "text-muted"}`}>{new Date(`${d.date}T12:00:00`).toLocaleDateString("de-DE", { weekday: "short" }).slice(0, 2)}</span>
              {d.minutes > 0 && <span className="text-label text-muted tabular-nums">{d.minutes}′</span>}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

