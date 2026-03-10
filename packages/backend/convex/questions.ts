import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, { text }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const questionId = await ctx.db.insert("questions", {
      userId: identity.subject,
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
  },
  handler: async (ctx, { questionId, consensusResponse }) => {
    await ctx.db.patch(questionId, {
      consensusResponse,
      status: "consensus_ready",
    });
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

    return [...pending, ...answering];
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
