import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Datenmodell (spiegelt src/lib/types.ts). Jede Zeile gehört einem Nutzer (`userId`) und trägt den App-Schlüssel
 * (`key`), unter dem die Oberfläche sie kennt – wie in Notara. Alle Änderungen gehen durch `data.ts`.
 */
const own = { userId: v.id("users"), key: v.string() };
const part = v.union(v.literal("morning"), v.literal("day"), v.literal("evening"));

export const fields = {
  checkins: {
    createdAt: v.string(),
    date: v.string(),
    part,
    mood: v.number(),
    energy: v.number(),
    emotions: v.array(v.string()),
    body: v.array(v.string()),
    influences: v.array(v.string()),
    control: v.optional(v.union(v.literal("ganz"), v.literal("teils"), v.literal("nicht"))),
    answers: v.array(v.object({ q: v.string(), a: v.string() })),
    exerciseId: v.optional(v.string()),
    moodAfter: v.optional(v.number()),
  },
  sessions: {
    createdAt: v.string(),
    date: v.string(),
    exerciseId: v.string(),
    seconds: v.number(),
    completed: v.boolean(),
    checkinKey: v.optional(v.string()),
    moodAfter: v.optional(v.number()),
  },
};

export default defineSchema({
  ...authTables,
  checkins: defineTable({ ...own, ...fields.checkins }).index("by_user", ["userId"]).index("by_user_key", ["userId", "key"]),
  sessions: defineTable({ ...own, ...fields.sessions }).index("by_user", ["userId"]).index("by_user_key", ["userId", "key"]),
  /** Einstellungen und Favoriten als JSON je Nutzer (geräteübergreifend) */
  prefs: defineTable({ userId: v.id("users"), json: v.string() }).index("by_user", ["userId"]),
});
