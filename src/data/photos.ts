/**
 * Fotos für die Übungen (Unsplash, frei nutzbar; Nennung der Fotografen auf der Detailseite). Je Motiv mehrere Bilder,
 * die Übung bekommt fest eines davon (nach ihrer id), damit nebeneinander nicht dasselbe Bild steht.
 * Eigene Fotos später: `image` an der Übung setzen, das geht vor.
 */
import type { Exercise, Motif } from "@/data/exercises";

export type Photo = { id: string; by: string };
const P = (id: string, by: string): Photo => ({ id, by });

const MOUNTAIN = [P("1530569673472-307dc017a82d", "Alessio Soggetti"), P("1572994384812-d66fea58513f", "Alessio Soggetti"), P("1707336575595-2b302f5a353e", "Diana Roberts")];
const SEA = [P("1501436513145-30f24e19fcc8", "Linus Nylund"), P("1598941288672-af25bcc7b223", "Laura Barry"), P("1503942142281-94af0aded523", "Giga Khurtsilava")];
const MOON = [P("1507502707541-f369a3b18502", "Sander Dewerte"), P("1581886573745-4487c55d95f8", "Aron Visuals"), P("1693418777220-e94f65d4cd4d", "Aron Visuals")];
const FLOWER = [P("1623056678728-3826872da064", "Magnus Östberg"), P("1716116058168-c3c7c190a9ec", "Serhii Kabakov"), P("1648466442714-b8cdf6bf45fa", "Aliona Gumeniuk")];
const LIGHT = [P("1581713872605-b9dfbc84eaa4", "Sami Matias Breilin"), P("1574726252024-83b799196f99", "Leyre")];
const FLAME = [P("1601922046210-41e129a3e64a", "Sixteen Miles Out"), P("1559091156-b9610fb12eda", "Marc Ignacio")];
const STONES = [P("1601850141256-e326878aeec3", "Mor Shani"), P("1646909106850-8c426285ed2a", "Content Pixie")];
const WATER = [P("1503891617560-5b8c2e28cbf6", "Ian Keefe"), P("1581284943246-0eb528155992", "Sami Matias Breilin")];
const FOREST = [P("1707336575595-2b302f5a353e", "Diana Roberts"), P("1572994384812-d66fea58513f", "Alessio Soggetti")];

const BY_MOTIF: Record<Motif, Photo[]> = {
  flower: FLOWER, heart: FLOWER, bee: FLOWER,
  wave: SEA, drop: WATER, lungs: WATER, circle: WATER,
  moon: MOON, sun: LIGHT, stairs: LIGHT,
  square: STONES, triangle: STONES, spiral: STONES, hand: STONES,
  flame: FLAME, mountain: MOUNTAIN, leaf: FOREST,
};

const hash = (s: string) => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

export function photoOf(e: Pick<Exercise, "id" | "art">): Photo {
  const list = BY_MOTIF[e.art.motif];
  return list[hash(e.id) % list.length];
}
/** Bild-Adresse in passender Größe (Unsplash rechnet zu) */
export const photoUrl = (p: Photo, w = 600) => `https://images.unsplash.com/photo-${p.id}?auto=format&fit=crop&w=${w}&q=72`;
export const imageOf = (e: Pick<Exercise, "id" | "art" | "image">, w = 600) => e.image ?? photoUrl(photoOf(e), w);

/** ein ruhiges Bild je Kategorie (Entdecken) */
const CATEGORY_PHOTO: Record<string, Photo> = {
  akut: WATER[0], beruhigen: SEA[0], schlafen: MOON[0], fokus: STONES[0], energie: LIGHT[0], balance: MOUNTAIN[0], koerper: FOREST[0], gut: FLOWER[1],
};
export const categoryImage = (id: string, w = 600) => photoUrl(CATEGORY_PHOTO[id] ?? SEA[1], w);
