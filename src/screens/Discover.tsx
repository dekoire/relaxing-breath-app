import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { FlaskConical, Search, X } from "lucide-react";
import { CATEGORIES, EXERCISES, TAGS, TAG_GROUP_LABEL, search, tagOf, type Category, type TagGroup } from "@/data/exercises";
import { categoryImage } from "@/data/photos";
import { ExerciseGrid, LayoutSwitch, LongTile, flatBg } from "@/components/Art";
import { PageTitle, Pill, Segmented } from "@/components/primitives";
import { usePrefs } from "@/lib/prefs";

/**
 * Entdecken: oben die Suche (Name, Gefühl, Symptom, Ziel, auch Synonyme wie „Herzklopfen“), darunter Filter nach
 * Gefühl · Körper · Ziel · Situation, ohne Suche die Kategorien mit Bild. Kategorien und Übungen als Kacheln oder
 * als Liste länglicher Kacheln (Schalter oben rechts, gleiche Einstellung wie im Profil).
 * Zustand in der Adresse (?q=&tag=&kat=&gut=1), damit Zurück und Teilen funktionieren.
 */
const GUT = { id: "gut", label: "Gut erforscht", sub: "Mit Studien belegt" };

export default function Discover() {
  const [params, setParams] = useSearchParams();
  const [prefs] = usePrefs();
  const q = params.get("q") ?? "";
  const tags = params.getAll("tag");
  const cat = (params.get("kat") as Category | null) ?? undefined;
  const gut = params.get("gut") === "1";
  const [group, setGroup] = useState<TagGroup>("gefuehl");
  const set = (patch: { q?: string; tags?: string[]; kat?: Category | null; gut?: boolean }) => {
    const p = new URLSearchParams(params);
    if (patch.q !== undefined) { if (patch.q) p.set("q", patch.q); else p.delete("q"); }
    if (patch.tags) { p.delete("tag"); patch.tags.forEach((t) => p.append("tag", t)); }
    if (patch.kat !== undefined) { if (patch.kat) p.set("kat", patch.kat); else p.delete("kat"); }
    if (patch.gut !== undefined) { if (patch.gut) p.set("gut", "1"); else p.delete("gut"); }
    setParams(p, { replace: true });
  };
  const results = useMemo(() => search(q, { tags, category: cat, evidence: gut }), [q, tags.join(","), cat, gut]); // eslint-disable-line react-hooks/exhaustive-deps
  const filtering = !!(q || tags.length || cat || gut);
  const cats = [...CATEGORIES.map((c) => ({ ...c, n: EXERCISES.filter((e) => e.category === c.id).length, pick: () => set({ kat: c.id }) })),
    { ...GUT, from: "#6d4aff", to: "#2a1a7a", n: search("", { evidence: true }).length, pick: () => set({ gut: true }) }];

  return (
    <div>
      <PageTitle title="Entdecken" sub={`${EXERCISES.length} Atemübungen`} right={<LayoutSwitch />} />
      <div className="sticky top-[env(safe-area-inset-top)] z-20 -mx-5 bg-page/90 px-5 pt-1 pb-3 backdrop-blur-xl md:-mx-6 md:px-6">
        <label className="relative block">
          <span className="sr-only">Suchen</span>
          <Search size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <input type="text" inputMode="search" enterKeyHint="search" autoComplete="off" value={q} onChange={(e) => set({ q: e.target.value })} placeholder="Wie fühlst du dich? z. B. Herzrasen" className="h-14 w-full rounded-full border border-card-line bg-surface pr-12 pl-12 text-[17px] placeholder:text-muted focus:border-brand-500 focus:outline-none" data-own-focus />
          {q && <button type="button" onClick={() => set({ q: "" })} aria-label="Suche leeren" className="absolute top-1/2 right-3 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-fg/[0.08]"><X size={16} /></button>}
        </label>
      </div>

      <div className="mt-2">
        <Segmented label="Filter nach" joined value={group} onChange={setGroup} options={(Object.keys(TAG_GROUP_LABEL) as TagGroup[]).map((g) => ({ id: g, label: TAG_GROUP_LABEL[g] }))} />
        <div className="hscroll mt-3 gap-2 md:flex-wrap">
          {TAGS.filter((t) => t.group === group).map((t) => <Pill key={t.id} on={tags.includes(t.id)} onClick={() => set({ tags: tags.includes(t.id) ? tags.filter((x) => x !== t.id) : [...tags, t.id] })}>{t.label}</Pill>)}
        </div>
      </div>

      {filtering && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {cat && <Pill on onClick={() => set({ kat: null })}>{CATEGORIES.find((c) => c.id === cat)?.label} <X size={14} /></Pill>}
          {gut && <Pill on onClick={() => set({ gut: false })}>{GUT.label} <X size={14} /></Pill>}
          {tags.map((t) => <Pill key={t} on onClick={() => set({ tags: tags.filter((x) => x !== t) })}>{tagOf(t)?.label} <X size={14} /></Pill>)}
          <span className="text-small text-muted">{results.length} {results.length === 1 ? "Übung" : "Übungen"}</span>
        </div>
      )}

      {!filtering && (prefs.layout === "list" ? (
        <div className="mt-6 grid gap-2.5 lg:grid-cols-2">
          {cats.map((c) => <LongTile key={c.id} to={c.id === "gut" ? "/entdecken?gut=1" : `/entdecken?kat=${c.id}`} img={categoryImage(c.id, 400)} bg={flatBg(c.from, c.to)} title={c.label} sub={c.sub} meta={`${c.n} Übungen`} />)}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {cats.map((c, k) => (
            <button key={c.id} type="button" onClick={c.pick} className={`press relative overflow-hidden rounded-[22px] p-4 text-left text-white ${k === 0 ? "col-span-2 min-h-[132px]" : "min-h-[116px]"}`} style={{ background: flatBg(c.from, c.to) }}>
              <img src={categoryImage(c.id, k === 0 ? 900 : 500)} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
              <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,22,30,.15) 0%, rgba(20,22,30,.78) 100%)" }} />
              <span className="relative flex h-full flex-col justify-end">
                <span className="flex items-center gap-1.5 text-[19px] leading-6 font-bold">{c.id === "gut" && <FlaskConical size={17} />}{c.label}</span>
                <span className="mt-0.5 block text-small text-white/80">{c.sub} · {c.n}</span>
              </span>
            </button>
          ))}
        </div>
      ))}

      <h2 className="mt-8 mb-3 text-[22px] font-bold tracking-tight">{filtering ? "Ergebnisse" : "Alle Übungen"}</h2>
      {results.length ? <ExerciseGrid list={results} /> : (
        <p className="rounded-3xl border border-card-line bg-surface px-5 py-8 text-center text-body text-muted">Nichts gefunden. Versuch ein Gefühl wie „unruhig“ oder ein Ziel wie „einschlafen“.</p>
      )}
    </div>
  );
}
