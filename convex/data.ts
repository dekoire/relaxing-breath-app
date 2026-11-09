import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { fields } from "./schema";

/** Alles für die App in EINER Abfrage: Konto, Check-ins, Übungen, Einstellungen */
async function me(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Nicht angemeldet");
  return userId;
}

export const all = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    const strip = <T extends { _id: unknown; _creationTime: number; userId: unknown; key: string }>({ _id, _creationTime, userId: _u, key, ...rest }: T) => ({ id: key, ...rest });
    const checkins = (await ctx.db.query("checkins").withIndex("by_user", (q) => q.eq("userId", userId)).collect()).map(strip);
    const sessions = (await ctx.db.query("sessions").withIndex("by_user", (q) => q.eq("userId", userId)).collect()).map(strip);
    const prefs = await ctx.db.query("prefs").withIndex("by_user", (q) => q.eq("userId", userId)).unique();
    return { email: user?.email ?? "", checkins, sessions, prefs: prefs?.json ?? "{}" };
  },
});

export const saveCheckin = mutation({
  args: { key: v.string(), ...fields.checkins },
  handler: async (ctx, { key, ...data }) => {
    const userId = await me(ctx);
    const old = await ctx.db.query("checkins").withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", key)).unique();
    if (old) await ctx.db.replace(old._id, { userId, key, ...data });
    else await ctx.db.insert("checkins", { userId, key, ...data });
  },
});

export const removeCheckin = mutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const userId = await me(ctx);
    const old = await ctx.db.query("checkins").withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", key)).unique();
    if (old) await ctx.db.delete(old._id);
  },
});

export const saveSession = mutation({
  args: { key: v.string(), ...fields.sessions },
  handler: async (ctx, { key, ...data }) => {
    const userId = await me(ctx);
    const old = await ctx.db.query("sessions").withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", key)).unique();
    if (old) await ctx.db.replace(old._id, { userId, key, ...data });
    else await ctx.db.insert("sessions", { userId, key, ...data });
  },
});

export const savePrefs = mutation({
  args: { json: v.string() },
  handler: async (ctx, { json }) => {
    const userId = await me(ctx);
    const old = await ctx.db.query("prefs").withIndex("by_user", (q) => q.eq("userId", userId)).unique();
    if (old) await ctx.db.patch(old._id, { json });
    else await ctx.db.insert("prefs", { userId, json });
  },
});
