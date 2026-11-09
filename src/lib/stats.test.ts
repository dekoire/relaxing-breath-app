import { describe, expect, it } from "vitest";
import { daysAgo, report, streak } from "./stats";
import type { CheckIn, Session } from "./types";

const now = new Date("2026-11-09T12:00:00");
const ci = (date: string, mood = 3, moodAfter?: number): CheckIn => ({ id: date, createdAt: `${date}T08:00:00`, date, part: "morning", mood, energy: 2, emotions: ["Gestresst"], body: [], influences: ["Arbeit"], answers: [], moodAfter });
const se = (date: string, seconds = 120): Session => ({ id: `s${date}`, createdAt: `${date}T08:00:00`, date, exerciseId: "box", seconds, completed: true });

describe("Serie", () => {
  it("zählt Tage in Folge, heute offen zählt ab gestern", () => {
    expect(streak([ci(daysAgo(1, now)), ci(daysAgo(2, now))], [], now)).toBe(2);
    expect(streak([ci(daysAgo(0, now))], [se(daysAgo(1, now))], now)).toBe(2);
  });
  it("ein Pausetag wird verziehen", () => {
    expect(streak([ci(daysAgo(0, now)), ci(daysAgo(1, now)), ci(daysAgo(3, now))], [], now)).toBe(3);
  });
  it("zu kurze Übungen zählen nicht", () => {
    expect(streak([], [se(daysAgo(0, now), 10)], now)).toBe(0);
  });
});

describe("Rückblick", () => {
  it("rechnet Stimmung vorher/nachher und Minuten", () => {
    const r = report([ci(daysAgo(0, now), 2, 4), ci(daysAgo(1, now), 3, 4)], [se(daysAgo(0, now), 180)], 30, now);
    expect(r.lift).toBe(1.5);
    expect(r.minutes).toBe(3);
    expect(r.emotions[0]).toEqual(["Gestresst", 2]);
  });
});
