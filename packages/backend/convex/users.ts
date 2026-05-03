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

export const syncPremiumFromClient = mutation({
  args: {
    isPremium: v.boolean(),
  },
  handler: async (ctx, { isPremium }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return;

    if (user.isPremium !== isPremium) {
      await ctx.db.patch(user._id, { isPremium });
    }
  },
});

export const deleteMyAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("Usuário não encontrado");

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
      .collect();
    for (const post of posts) {
      await ctx.db.delete(post._id);
    }

    const questions = await ctx.db
      .query("questions")
      .withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
      .collect();
    for (const question of questions) {
      const answers = await ctx.db
        .query("answers")
        .withIndex("by_questionId", (q) => q.eq("questionId", question._id))
        .collect();
      for (const answer of answers) {
        await ctx.db.delete(answer._id);
      }
      await ctx.db.delete(question._id);
    }

    const directorships = await ctx.db
      .query("directorships")
      .withIndex("by_directorId", (q) => q.eq("directorId", user.clerkId))
      .collect();
    for (const d of directorships) {
      await ctx.db.delete(d._id);
    }

    const directeeships = await ctx.db
      .query("directorships")
      .withIndex("by_directeeId", (q) => q.eq("directeeId", user.clerkId))
      .collect();
    for (const d of directeeships) {
      await ctx.db.delete(d._id);
    }

    await ctx.db.delete(user._id);
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

