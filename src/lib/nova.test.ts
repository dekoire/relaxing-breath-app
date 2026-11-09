import { describe, expect, it } from "vitest";
import { advise, greeting, needOf, offTopic } from "./nova";

describe("Nova", () => {
  it("versteht freie Sätze", () => {
    expect(needOf("Ich kann nicht schlafen")).toBe("schlaf");
    expect(needOf("Ich bin total gestresst")).toBe("ruhe");
    expect(needOf("Morgen ist Prüfung, ich muss mich konzentrieren")).toBe("fokus");
  });
  it("empfiehlt immer etwas, abends nichts Aktivierendes", () => {
    const a = advise("schlaf", 5, { minutes: 0, doneIds: [], part: "evening" });
    expect(a.exercise).toBeTruthy();
    expect(a.exercise.level).not.toBe("fortgeschritten");
  });
  it("nach viel Atmen nur etwas Kurzes", () => {
    const a = advise("ruhe", 10, { minutes: 40, doneIds: [], part: "day" });
    expect(a.short).toBe(true);
    expect(a.text).toMatch(/schon viel/);
    expect(greeting({ minutes: 40, doneIds: [], part: "day" })).toMatch(/40 Minuten/);
  });
  it("lehnt Fremdes ab und lenkt zurück", () => {
    expect(offTopic("Ich hätte gerne eine Kalaschnikow")?.text).toMatch(/nicht helfen.*runterzukommen/);
    expect(offTopic("Was soll ich heute essen?")?.text).toMatch(/nicht helfen/);
    expect(offTopic("Ich bin gestresst")).toBeUndefined();
    expect(offTopic("Ich will nicht mehr leben")?.text).toMatch(/0800 111 0 111/);
  });
});
