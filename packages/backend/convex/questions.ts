import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const QUESTION_LIMIT_REACHED = "QUESTION_LIMIT_REACHED";
const PREMIUM_DAILY_LIMIT_REACHED = "PREMIUM_DAILY_LIMIT_REACHED";

const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;

function startOfDayBRT(now: number): number {
  const nowBRT = now - BRT_OFFSET_MS;
  const dayStartBRT = nowBRT - (nowBRT % (24 * 60 * 60 * 1000));
  return dayStartBRT + BRT_OFFSET_MS;
}

export const submit = mutation({
  args: {
    text: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { text, category }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("Usuário não encontrado. Faça login novamente.");

    const existing = await ctx.db
      .query("questions")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    if (user.isPremium) {
      const todayStart = startOfDayBRT(Date.now());
      const askedToday = existing.some((q) => q._creationTime >= todayStart);
      if (askedToday) throw new Error(PREMIUM_DAILY_LIMIT_REACHED);
    } else {
      if (existing.length >= 5) throw new Error(QUESTION_LIMIT_REACHED);
    }

    const questionId = await ctx.db.insert("questions", {
      userId: identity.subject,
      anonymousId: user.anonymousId,
      isPremium: user.isPremium,
      category,
      originalText: text,
      normalizedText: text,
      status: "pending",
      answerCount: 0,
    });

    await ctx.scheduler.runAfter(0, internal.ai.normalizeQuestion, {
      questionId,
      originalText: text,
    });

    return questionId;
  },
});

export const getQuestionAccess = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        canAskQuestion: false,
        questionCount: 0,
        questionsRemaining: 0,
        isPremium: false,
        premiumAskedToday: false,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return {
        canAskQuestion: false,
        questionCount: 0,
        questionsRemaining: 0,
        isPremium: false,
        premiumAskedToday: false,
      };
    }

    const existingQuestions = await ctx.db
      .query("questions")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    const questionCount = existingQuestions.length;

    if (user.isPremium) {
      const todayStart = startOfDayBRT(Date.now());
      const askedToday = existingQuestions.some((q) => q._creationTime >= todayStart);
      return {
        canAskQuestion: !askedToday,
        questionCount,
        questionsRemaining: null,
        isPremium: true,
        premiumAskedToday: askedToday,
      };
    }

    return {
      canAskQuestion: questionCount < 5,
      questionCount,
      questionsRemaining: Math.max(0, 5 - questionCount),
      isPremium: false,
      premiumAskedToday: false,
    };
  },
});

export const saveNormalized = internalMutation({
  args: {
    questionId: v.id("questions"),
    normalizedText: v.string(),
  },
  handler: async (ctx, { questionId, normalizedText }) => {
    await ctx.db.patch(questionId, { normalizedText });
  },
});

export const saveConsensus = internalMutation({
  args: {
    questionId: v.id("questions"),
    consensusResponse: v.string(),
    confidenceScore: v.optional(v.number()),
    responsePatterns: v.optional(
      v.array(
        v.object({
          representativeText: v.string(),
          confidenceScore: v.number(),
          matchingAnswerCount: v.number(),
          totalAnswerCount: v.number(),
        }),
      ),
    ),
    sourceGuidance: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      questionId,
      consensusResponse,
      confidenceScore,
      responsePatterns,
      sourceGuidance,
    },
  ) => {
    await ctx.db.patch(questionId, {
      consensusResponse,
      confidenceScore,
      responsePatterns,
      sourceGuidance,
      status: "consensus_ready",
    });
  },
});

export const getByIdInternal = internalQuery({
  args: { questionId: v.id("questions") },
  handler: async (ctx, { questionId }) => {
    return await ctx.db.get(questionId);
  },
});

export const getMyQuestions = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("questions")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const getAvailableQuestions = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const pending = await ctx.db
      .query("questions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    const answering = await ctx.db
      .query("questions")
      .withIndex("by_status", (q) => q.eq("status", "answering"))
      .order("desc")
      .collect();

    return [...pending, ...answering].filter(
      (q) => q.userId !== identity.subject,
    );
  },
});

export const getById = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, { questionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db.get(questionId);
  },
});

export const getHistoryByAnonymousId = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, { questionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const question = await ctx.db.get(questionId);
    if (!question || !question.isPremium) return [];

    const history = await ctx.db
      .query("questions")
      .withIndex("by_anonymousId", (q) =>
        q.eq("anonymousId", question.anonymousId),
      )
      .order("desc")
      .collect();

    return history.filter((q) => q._id !== questionId);
  },
});
