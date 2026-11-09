import { describe, expect, it } from "vitest";
import { EXERCISES, TAGS, cycleSec, exerciseById, roundsFor, search, steps, tagsFor, totalSec } from "./exercises";

describe("Bibliothek", () => {
  it("hat viele Übungen mit eindeutigen ids", () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(40);
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length);
  });
  it("nutzt nur bekannte Schlagwörter und sinnvolle Phasen", () => {
    const known = new Set(TAGS.map((t) => t.id));
    for (const e of EXERCISES) {
      for (const t of e.tags) expect(known.has(t), `${e.id}: ${t}`).toBe(true);
      expect(cycleSec(e)).toBeGreaterThan(0);
      for (const b of e.cycle) for (const p of b.phases) expect(p.s).toBeGreaterThan(0);
    }
  });
  it("jedes Schlagwort hat mindestens eine Übung", () => {
    for (const t of TAGS) expect(EXERCISES.some((e) => e.tags.includes(t.id)), t.id).toBe(true);
  });
});

describe("Zeit und Schritte", () => {
  it("rechnet Minuten in Runden um", () => {
    const e = exerciseById("laenger-aus")!;
    expect(cycleSec(e)).toBe(10);
    expect(roundsFor(e, 3)).toBe(18);
    expect(totalSec(e, 1)).toBe(60);
  });
  it("feste Runden gehen vor", () => {
    expect(roundsFor(exerciseById("seufzer")!, 5)).toBe(6);
  });
  it("Programme mit Blöcken werden ausgerollt", () => {
    const e = exerciseById("kapalabhati")!;
    const s = steps(e);
    expect(s.filter((x) => x.round === 1 && x.block === 0)).toHaveLength(60);
    expect(s[s.length - 1].at + s[s.length - 1].s).toBeCloseTo(totalSec(e));
  });
  it("Zählen und Gedanken je Atemzug", () => {
    const z = steps(exerciseById("zaehlen")!, 2).filter((x) => x.kind === "out").map((x) => x.word);
    expect(z.slice(0, 3)).toEqual(["Eins", "Zwei", "Drei"]);
    expect(z[10]).toBe("Eins");
    const g = steps(exerciseById("erden-54321")!);
    expect(g[0].thought).toBe("Fünf Dinge, die du siehst");
    expect(g[2].thought).toBe("Vier Dinge, die du fühlst");
  });
});

describe("Suche", () => {
  it("findet über Synonyme", () => {
    expect(tagsFor("Herzklopfen")).toContain("herzrasen");
    expect(search("herzklopfen").length).toBeGreaterThan(2);
    expect(search("einschlafen")[0].tags).toContain("schlaf");
  });
  it("Name zuerst", () => {
    expect(search("box")[0].id).toBe("box");
  });
  it("Filter müssen alle passen", () => {
    const r = search("", { tags: ["schlaf", "stoisch"] });
    expect(r.map((e) => e.id)).toContain("abend");
    expect(r.every((e) => e.tags.includes("schlaf") && e.tags.includes("stoisch"))).toBe(true);
  });
  it("findet Umlaute auch ohne", () => {
    expect(search("prufung").length).toBeGreaterThan(0);
  });
});
