import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { requireIdentity, requireUser } from "./lib/auth";

function generateAnonymousId(): string {
  const bytes = new Uint8Array(18);
  // Convex mutations run in V8 — crypto.getRandomValues is available.
  crypto.getRandomValues(bytes);
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < bytes.length; i++) {
    id += chars[bytes[i]! % chars.length];
  }
  return id;
}

const genderValidator = v.optional(
  v.union(v.literal("masculino"), v.literal("feminino"), v.literal("prefiro_nao_identificar")),
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

const userReturnValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  clerkId: v.string(),
  anonymousId: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  gender: genderValidator,
  ageGroup: ageGroupValidator,
  hasDepression: v.optional(v.boolean()),
  goesToChurch: v.optional(v.boolean()),
  isDirector: v.optional(v.boolean()),
  isPremium: v.boolean(),
  premiumUntil: v.optional(v.number()),
});

export const ensureUser = mutation({
  args: {
    gender: genderValidator,
    ageGroup: ageGroupValidator,
    hasDepression: v.optional(v.boolean()),
    goesToChurch: v.optional(v.boolean()),
  },
  returns: userReturnValidator,
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

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

    const created = await ctx.db.get(userId);
    if (!created) throw new Error("Falha ao criar usuário");
    return created;
  },
});

export const getMe = query({
  args: {},
  returns: v.union(userReturnValidator, v.null()),
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
  returns: v.null(),
  handler: async (ctx, { firstName, lastName }) => {
    const { user } = await requireUser(ctx);
    await ctx.db.patch(user._id, { firstName, lastName });
    return null;
  },
});

export const setPremiumStatus = internalMutation({
  args: {
    clerkId: v.string(),
    isPremium: v.boolean(),
    premiumUntil: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, { clerkId, isPremium, premiumUntil }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      console.warn("[users.setPremiumStatus] user not found", clerkId);
      return null;
    }

    await ctx.db.patch(user._id, {
      isPremium,
      premiumUntil,
    });
    return null;
  },
});

export const deleteMyAccount = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { user } = await requireUser(ctx);

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
      .collect();
    for (const post of posts) {
      if (post.imageStorageId) {
        await ctx.storage.delete(post.imageStorageId);
      }
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
    return null;
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
