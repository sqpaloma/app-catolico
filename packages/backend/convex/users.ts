import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

function generateAnonymousId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export const ensureUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) return existing;

    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      anonymousId: generateAnonymousId(),
      isDirector: false,
      isPremium: false,
    });

    return await ctx.db.get(userId);
  },
});

export const getMe = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const becomeDirector = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("Usuário não encontrado");
    if (user.isDirector) return user;

    await ctx.db.patch(user._id, { isDirector: true });
    return await ctx.db.get(user._id);
  },
});

export const leaveDirector = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("Usuário não encontrado");
    if (!user.isDirector) return user;

    await ctx.db.patch(user._id, { isDirector: false });
    return await ctx.db.get(user._id);
  },
});

export const setPremiumStatus = internalMutation({
  args: {
    clerkId: v.string(),
    isPremium: v.boolean(),
    premiumUntil: v.optional(v.number()),
  },
  handler: async (ctx, { clerkId, isPremium, premiumUntil }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) throw new Error("Usuário não encontrado");

    await ctx.db.patch(user._id, { isPremium, premiumUntil });
  },
});

export const getMeInternal = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
  },
});

export const setPremiumByAsaasCustomer = internalMutation({
  args: {
    asaasCustomerId: v.string(),
    isPremium: v.boolean(),
    premiumUntil: v.optional(v.number()),
  },
  handler: async (ctx, { asaasCustomerId, isPremium, premiumUntil }) => {
    const users = await ctx.db.query("users").collect();
    const user = users.find((u) => u.asaasCustomerId === asaasCustomerId);
    if (!user) throw new Error("Usuário não encontrado para este customer Asaas");

    await ctx.db.patch(user._id, { isPremium, premiumUntil });
  },
});

export const setAsaasCustomerId = internalMutation({
  args: {
    userId: v.id("users"),
    asaasCustomerId: v.string(),
    asaasSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, { userId, asaasCustomerId, asaasSubscriptionId }) => {
    await ctx.db.patch(userId, { asaasCustomerId, asaasSubscriptionId });
  },
});
