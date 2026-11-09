import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Search, X } from "lucide-react";
import { CATEGORIES, EXERCISES, TAGS, TAG_GROUP_LABEL, search, tagOf, type Category, type TagGroup } from "@/data/exercises";
import { ExerciseCard, flatBg } from "@/components/Art";
import { PageTitle, Pill, Segmented } from "@/components/primitives";

/**
 * Entdecken: oben die Suche (Name, Gefühl, Symptom, Ziel – auch Synonyme wie „Herzklopfen“), darunter Filter nach
 * Gefühl · Körper · Ziel · Situation, ohne Suche große Kategorie-Kacheln. Ergebnisse als Mauerwerk wie bei Pinterest.
 * Zustand in der Adresse (?q=&tag=&kat=), damit Zurück und Teilen funktionieren.
 */
export default function Discover() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const tags = params.getAll("tag");
  const cat = (params.get("kat") as Category | null) ?? undefined;
  const [group, setGroup] = useState<TagGroup>("gefuehl");
  const set = (patch: { q?: string; tags?: string[]; kat?: Category | null }) => {
    const p = new URLSearchParams(params);
    if (patch.q !== undefined) { if (patch.q) p.set("q", patch.q); else p.delete("q"); }
    if (patch.tags) { p.delete("tag"); patch.tags.forEach((t) => p.append("tag", t)); }
    if (patch.kat !== undefined) { if (patch.kat) p.set("kat", patch.kat); else p.delete("kat"); }
    setParams(p, { replace: true });
  };
  const results = useMemo(() => search(q, { tags, category: cat }), [q, tags.join(","), cat]); // eslint-disable-line react-hooks/exhaustive-deps
  const filtering = !!(q || tags.length || cat);

  return (
    <div>
      <PageTitle title="Entdecken" sub={`${EXERCISES.length} Atemübungen`} />
      <div className="sticky top-[env(safe-area-inset-top)] z-20 -mx-4 bg-page/90 px-4 pt-1 pb-3 backdrop-blur-xl md:-mx-6 md:px-6">
        <label className="relative block">
          <span className="sr-only">Suchen</span>
          <Search size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <input type="text" inputMode="search" enterKeyHint="search" autoComplete="off" value={q} onChange={(e) => set({ q: e.target.value })} placeholder="Gefühl, Symptom oder Ziel … z. B. Herzrasen" className="h-14 w-full rounded-full border border-card-line bg-surface pr-12 pl-12 text-[17px] placeholder:text-muted focus:border-brand-500 focus:outline-none" data-own-focus />
          {q && <button type="button" onClick={() => set({ q: "" })} aria-label="Suche leeren" className="absolute top-1/2 right-3 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-fg/[0.08]"><X size={16} /></button>}
        </label>
      </div>

      <div className="mt-2">
        <Segmented label="Filter nach" joined value={group} onChange={setGroup} options={(Object.keys(TAG_GROUP_LABEL) as TagGroup[]).map((g) => ({ id: g, label: TAG_GROUP_LABEL[g] }))} />
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 md:-mx-6 md:flex-wrap md:px-6">
          {TAGS.filter((t) => t.group === group).map((t) => <Pill key={t.id} on={tags.includes(t.id)} onClick={() => set({ tags: tags.includes(t.id) ? tags.filter((x) => x !== t.id) : [...tags, t.id] })}>{t.label}</Pill>)}
        </div>
      </div>

      {filtering && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {cat && <Pill on onClick={() => set({ kat: null })}>{CATEGORIES.find((c) => c.id === cat)?.label} <X size={14} /></Pill>}
          {tags.map((t) => <Pill key={t} on onClick={() => set({ tags: tags.filter((x) => x !== t) })}>{tagOf(t)?.label} <X size={14} /></Pill>)}
          <span className="text-small text-muted">{results.length} {results.length === 1 ? "Übung" : "Übungen"}</span>
        </div>
      )}

      {!filtering && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {CATEGORIES.map((c, k) => (
            <button key={c.id} type="button" onClick={() => set({ kat: c.id })} className={`press relative overflow-hidden rounded-[22px] p-4 text-left text-white ${k === 0 ? "col-span-2 min-h-[120px]" : "min-h-[104px]"}`} style={{ background: flatBg(c.from, c.to) }}>
              <span className="block text-[19px] leading-6 font-bold">{c.label}</span>
              <span className="mt-0.5 block text-small text-white/75">{c.sub}</span>
              <span className="absolute right-4 bottom-3 text-caption font-semibold text-white/60">{EXERCISES.filter((e) => e.category === c.id).length}</span>
            </button>
          ))}
        </div>
      )}

      <h2 className="mt-8 mb-3 text-[22px] font-bold tracking-tight">{filtering ? "Ergebnisse" : "Alle Übungen"}</h2>
      {results.length ? (
        <div className="masonry">
          {results.map((e, k) => <ExerciseCard key={e.id} e={e} tall={k % 3 === 0} />)}
        </div>
      ) : (
        <p className="rounded-3xl border border-card-line bg-surface px-5 py-8 text-center text-body text-muted">Nichts gefunden. Versuch ein Gefühl wie „unruhig“ oder ein Ziel wie „einschlafen“.</p>
      )}
    </div>
  );
}
