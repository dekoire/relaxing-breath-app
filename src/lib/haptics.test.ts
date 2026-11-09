import { describe, expect, it } from "vitest";
import { hapticPlan, vibratePattern } from "./haptics";

describe("Vibrationssprache", () => {
  it("Einatmen wird dichter und kräftiger", () => {
    const t = hapticPlan("in", 4);
    expect(t.length).toBeGreaterThan(8);
    expect(t[0].strength).toBe(1);
    expect(t[t.length - 1].strength).toBe(3);
    const gapStart = t[1].at - t[0].at, gapEnd = t[t.length - 1].at - t[t.length - 2].at;
    expect(gapEnd).toBeLessThan(gapStart);
  });
  it("Ausatmen fällt ab und endet vor dem Phasenende", () => {
    const t = hapticPlan("out", 6);
    expect(t[0].strength).toBe(3);
    expect(t[t.length - 1].strength).toBe(1);
    expect(t[t.length - 1].at).toBeLessThan(6000 * 0.86);
  });
  it("Halten ist ein weicher Doppel-Tipper", () => {
    expect(hapticPlan("hold", 7)).toEqual([{ at: 0, strength: 1 }, { at: 140, strength: 1 }]);
  });
  it("aus = nichts, sanft = schwächer", () => {
    expect(hapticPlan("in", 4, "off")).toEqual([]);
    expect(Math.max(...hapticPlan("in", 4, "soft").map((x) => x.strength))).toBe(2);
  });
  it("Muster für navigator.vibrate", () => {
    expect(vibratePattern([{ at: 0, strength: 1 }, { at: 140, strength: 1 }])).toEqual([12, 128, 12]);
  });
});
