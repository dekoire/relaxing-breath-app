import { describe, expect, it } from "vitest";
import { quadrantOf, recommend, reflectQuestions, VARIANTS } from "./checkin";

describe("Mood Meter", () => {
  it("Stimmung × Energie → Feld", () => {
    expect(quadrantOf(1, 3)).toBe("angespannt");
    expect(quadrantOf(2, 1)).toBe("schwer");
    expect(quadrantOf(5, 3)).toBe("lebendig");
    expect(quadrantOf(4, 1)).toBe("ruhig");
  });
});

describe("Empfehlung", () => {
  it("Herzrasen + gestresst → beruhigend, nichts Aktivierendes", () => {
    const r = recommend({ mood: 2, energy: 3, emotions: ["Gestresst"], body: ["herz"], part: "day" });
    expect(r).toHaveLength(3);
    expect(r[0].exercise.tags).toContain("herzrasen");
    expect(r.every((x) => x.exercise.category !== "energie")).toBe(true);
    expect(r[0].reason).toMatch(/Herzrasen/);
  });
  it("abends müde und grübelnd → Schlaf", () => {
    const r = recommend({ mood: 3, energy: 1, emotions: ["Nachdenklich"], body: [], part: "evening" });
    expect(r.some((x) => x.exercise.tags.includes("schlaf"))).toBe(true);
  });
  it("schlechte Stimmung → keine Übungen für Fortgeschrittene", () => {
    const r = recommend({ mood: 1, energy: 1, emotions: ["Müde", "Erschöpft"], body: ["schwer"], part: "morning" });
    expect(r.every((x) => x.exercise.level !== "fortgeschritten")).toBe(true);
  });
});

describe("Stoische Fragen", () => {
  const today = "2026-11-09";
  it("Länge bestimmt die Zahl der Fragen", () => {
    expect(reflectQuestions("morning", [], "short", today)).toHaveLength(1);
    expect(reflectQuestions("evening", [], "long", today)).toHaveLength(3);
  });
  it("abends greift sie den Vorsatz vom Morgen auf", () => {
    const q = VARIANTS.intention[0];
    const hist = [{ date: today, createdAt: `${today}T07:00:00Z`, part: "morning" as const, mood: 4, answers: [{ q, a: "Präsentation gut vorbereiten" }] }];
    expect(reflectQuestions("evening", hist, "short", today)[0]).toContain("Präsentation gut vorbereiten");
  });
});
