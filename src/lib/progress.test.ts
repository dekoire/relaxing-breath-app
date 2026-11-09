import { describe, expect, it } from "vitest";
import { badges, bestStreak, levelOf, points } from "./progress";
import { compare, insights } from "./insights";
import { reminderText } from "./remind";
import type { CheckIn, Session } from "./types";

const today = new Date("2026-11-09T12:00:00");
const day = (k: number) => { const d = new Date(today); d.setDate(d.getDate() - k); return d.toLocaleDateString("sv-SE"); };
const ck = (k: number, mood: number, extra: Partial<CheckIn> = {}): CheckIn => ({ id: `c${k}${extra.part ?? ""}`, createdAt: `${day(k)}T08:00:00`, date: day(k), part: "morning", mood, energy: 2, emotions: [], body: [], influences: [], answers: [], ...extra });
const se = (k: number, seconds = 180, extra: Partial<Session> = {}): Session => ({ id: `s${k}${extra.exerciseId ?? ""}`, createdAt: `${day(k)}T08:10:00`, date: day(k), exerciseId: "seufzer", seconds, completed: true, ...extra });

describe("Punkte und Stufen", () => {
  it("zählt Check-ins, Minuten, fertige Übungen und Serien-Tage", () => {
    // 1 Check-in (10) + 3 Min. (6) + fertig (5) = 21
    expect(points([ck(0, 3)], [se(0)])).toBe(21);
    // zwei Tage in Folge: +5 Serienbonus
    expect(points([ck(0, 3), ck(1, 3)], [])).toBe(25);
  });
  it("Stufe mit Abstand zur nächsten", () => {
    expect(levelOf(0)).toMatchObject({ n: 1, name: "Erster Atemzug", toNext: 60 });
    expect(levelOf(200).n).toBe(3);
  });
  it("längste Serie", () => {
    expect(bestStreak([ck(10, 3), ck(9, 3), ck(8, 3), ck(2, 3)], [])).toBe(3);
  });
});

describe("Abzeichen", () => {
  it("3 Tage in Folge", () => {
    const b = badges([ck(0, 3), ck(1, 3), ck(2, 3)], [], today);
    expect(b.find((x) => x.id === "streak3")?.earned).toBe(true);
    expect(b.find((x) => x.id === "streak7")).toMatchObject({ earned: false, now: 3, goal: 7 });
  });
  it("Timer zählt nicht als verschiedene Übung", () => {
    const b = badges([], [se(0, 300, { exerciseId: "timer" })], today);
    expect(b.find((x) => x.id === "timer")?.earned).toBe(true);
    expect(b.find((x) => x.id === "kinds5")?.now).toBe(0);
  });
});

describe("Entwicklung", () => {
  it("vergleicht mit dem Zeitraum davor", () => {
    const c = compare([ck(1, 4), ck(2, 4), ck(9, 2)], [], 7, today);
    expect(c.now.activeDays).toBe(2);
    expect(c.before.activeDays).toBe(1);
  });
  it("findet die Übung, nach der es am meisten besser geht", () => {
    const xs = [ck(1, 2, { exerciseId: "seufzer", moodAfter: 4 }), ck(2, 2, { exerciseId: "seufzer", moodAfter: 4 }), ck(3, 3, { exerciseId: "box", moodAfter: 3 }), ck(4, 3, { exerciseId: "box", moodAfter: 3 })];
    expect(insights(xs, [], 7, today).some((i) => i.text.includes("Physiologischer Seufzer"))).toBe(true);
  });
  it("sagt nichts ohne genug Daten", () => {
    expect(insights([ck(0, 3)], [], 7, today)).toEqual([]);
  });
});

describe("Erinnerung", () => {
  it("nennt die Serie ab zwei Tagen", () => {
    expect(reminderText("evening", 4, 1).body).toMatch(/4 Tage/);
    expect(reminderText("morning", 0, 0).body).not.toMatch(/Tage/);
  });
});
