import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getOptionalUser, isPremiumActive, requireUser } from "./lib/auth";
import { enforceRateLimit } from "./lib/rateLimit";
import {
  historyQuestionValidator,
  publicQuestionValidator,
  responsePatternValidator,
  toHistoryQuestion,
  toPublicQuestion,
} from "./lib/questionDto";

const QUESTION_LIMIT_REACHED = "QUESTION_LIMIT_REACHED";
const PREMIUM_DAILY_LIMIT_REACHED = "PREMIUM_DAILY_LIMIT_REACHED";
const MAX_QUESTION_LENGTH = 4000;
const MIN_QUESTION_LENGTH = 10;
const FREE_QUESTION_LIMIT = 5;

const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;

function startOfDayBRT(now: number): number {
  const nowBRT = now - BRT_OFFSET_MS;
  const dayStartBRT = nowBRT - (nowBRT % (24 * 60 * 60 * 1000));
  return dayStartBRT + BRT_OFFSET_MS;
}

const questionAccessValidator = v.object({
  canAskQuestion: v.boolean(),
  questionCount: v.number(),
  questionsRemaining: v.union(v.number(), v.null()),
  isPremium: v.boolean(),
  premiumAskedToday: v.boolean(),
});

export const submit = mutation({
  args: {
    text: v.string(),
    category: v.optional(v.string()),
  },
  returns: v.id("questions"),
  handler: async (ctx, { text, category }) => {
    const { identity, user } = await requireUser(ctx);
    const now = Date.now();

    const trimmed = text.trim();
    if (trimmed.length < MIN_QUESTION_LENGTH) {
      throw new Error(`A pergunta deve ter pelo menos ${MIN_QUESTION_LENGTH} caracteres.`);
    }
    if (trimmed.length > MAX_QUESTION_LENGTH) {
      throw new Error(`A pergunta deve ter no máximo ${MAX_QUESTION_LENGTH} caracteres.`);
    }

    await enforceRateLimit(ctx, `questions:${identity.subject}`, 20);

    const existing = await ctx.db
      .query("questions")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    const premium = isPremiumActive(user, now);

    if (premium) {
      const todayStart = startOfDayBRT(now);
      const askedToday = existing.some((q) => q._creationTime >= todayStart);
      if (askedToday) throw new Error(PREMIUM_DAILY_LIMIT_REACHED);
    } else if (existing.length >= FREE_QUESTION_LIMIT) {
      throw new Error(QUESTION_LIMIT_REACHED);
    }

    const questionId = await ctx.db.insert("questions", {
      userId: identity.subject,
      anonymousId: user.anonymousId,
      isPremium: premium,
      category,
      originalText: trimmed,
      normalizedText: trimmed,
      status: "pending",
      answerCount: 0,
    });

    await ctx.scheduler.runAfter(0, internal.ai.normalizeQuestion, {
      questionId,
      originalText: trimmed,
    });

    return questionId;
  },
});

export const getQuestionAccess = query({
  args: { now: v.number() },
  returns: questionAccessValidator,
  handler: async (ctx, { now }) => {
    const auth = await getOptionalUser(ctx);
    if (!auth) {
      return {
        canAskQuestion: false,
        questionCount: 0,
        questionsRemaining: 0,
        isPremium: false,
        premiumAskedToday: false,
      };
    }

    const { identity, user } = auth;
    const existingQuestions = await ctx.db
      .query("questions")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    const questionCount = existingQuestions.length;
    const premium = isPremiumActive(user, now);

    if (premium) {
      const todayStart = startOfDayBRT(now);
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
      canAskQuestion: questionCount < FREE_QUESTION_LIMIT,
      questionCount,
      questionsRemaining: Math.max(0, FREE_QUESTION_LIMIT - questionCount),
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

export const markConsensusProcessing = internalMutation({
  args: { questionId: v.id("questions") },
  returns: v.boolean(),
  handler: async (ctx, { questionId }) => {
    const question = await ctx.db.get(questionId);
    if (!question) return false;
    if (
      question.status === "consensus_ready" ||
      question.status === "consensus_processing"
    ) {
      return false;
    }
    await ctx.db.patch(questionId, { status: "consensus_processing" });
    return true;
  },
});

export const saveConsensus = internalMutation({
  args: {
    questionId: v.id("questions"),
    consensusResponse: v.string(),
    confidenceScore: v.optional(v.number()),
    responsePatterns: v.optional(v.array(responsePatternValidator)),
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
  args: {},
  returns: v.array(publicQuestionValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const questions = await ctx.db
      .query("questions")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return questions.map((q) => toPublicQuestion(q, identity.subject));
  },
});

export const getAvailableQuestions = query({
  args: {},
  returns: v.array(publicQuestionValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Bounded reads — avoid unbounded .collect() on the global pool.
    const pending = await ctx.db
      .query("questions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(50);

    const answering = await ctx.db
      .query("questions")
      .withIndex("by_status", (q) => q.eq("status", "answering"))
      .order("desc")
      .take(50);

    return [...pending, ...answering]
      .filter((q) => q.userId !== identity.subject)
      .map((q) => toPublicQuestion(q, identity.subject));
  },
});

export const getById = query({
  args: { questionId: v.id("questions") },
  returns: v.union(publicQuestionValidator, v.null()),
  handler: async (ctx, { questionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const question = await ctx.db.get(questionId);
    if (!question) return null;

    return toPublicQuestion(question, identity.subject);
  },
});

export const getHistoryByAnonymousId = query({
  args: { questionId: v.id("questions") },
  returns: v.array(historyQuestionValidator),
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

    return history
      .filter((q) => q._id !== questionId)
      .map(toHistoryQuestion);
  },
});
