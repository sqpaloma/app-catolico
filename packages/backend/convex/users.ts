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

const genderValidator = v.optional(
  v.union(v.literal("masculino"), v.literal("feminino")),
);
const ageGroupValidator = v.optional(
  v.union(
    v.literal("-18"),
    v.literal("18-25"),
    v.literal("25-35"),
    v.literal("35-45"),
    v.literal("45-55"),
    v.literal("55+"),
  ),
);

export const ensureUser = mutation({
  args: {
    gender: genderValidator,
    ageGroup: ageGroupValidator,
    hasDepression: v.optional(v.boolean()),
    goesToChurch: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
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
      firstName: identity.givenName ?? undefined,
      lastName: identity.familyName ?? undefined,
      gender: args.gender ?? undefined,
      ageGroup: args.ageGroup ?? undefined,
      hasDepression: args.hasDepression ?? undefined,
      goesToChurch: args.goesToChurch ?? undefined,
      isDirector: true,
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

export const updateName = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, { firstName, lastName }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("Usuário não encontrado");

    await ctx.db.patch(user._id, { firstName, lastName });
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
