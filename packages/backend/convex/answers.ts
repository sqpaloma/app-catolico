import { mutation, query, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    questionId: v.id("questions"),
    text: v.string(),
  },
  handler: async (ctx, { questionId, text }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || !user.isDirector) {
      throw new Error("Apenas diretores espirituais podem responder perguntas");
    }

    const question = await ctx.db.get(questionId);
    if (!question) throw new Error("Pergunta não encontrada");

    const existing = await ctx.db
      .query("answers")
      .withIndex("by_questionId", (q) => q.eq("questionId", questionId))
      .filter((q) => q.eq(q.field("directorId"), identity.subject))
      .first();

    if (existing) throw new Error("Você já respondeu esta pergunta");

    await ctx.db.insert("answers", {
      questionId,
      directorId: identity.subject,
      directorName: identity.name ?? "Diretor Espiritual",
      text,
    });

    const newCount = question.answerCount + 1;
    const newStatus = newCount >= 3 ? "answering" : "answering";

    await ctx.db.patch(questionId, {
      answerCount: newCount,
      status: question.status === "pending" ? "answering" : question.status,
    });

    if (newCount >= 3 && question.status !== "consensus_ready") {
      await ctx.scheduler.runAfter(0, internal.ai.generateConsensus, {
        questionId,
      });
    }

    return questionId;
  },
});

export const getByQuestion = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, { questionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("answers")
      .withIndex("by_questionId", (q) => q.eq("questionId", questionId))
      .collect();
  },
});

export const getMyAnswers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("answers")
      .withIndex("by_directorId", (q) =>
        q.eq("directorId", identity.subject),
      )
      .order("desc")
      .collect();
  },
});

export const listByQuestion = internalQuery({
  args: { questionId: v.id("questions") },
  handler: async (ctx, { questionId }) => {
    return await ctx.db
      .query("answers")
      .withIndex("by_questionId", (q) => q.eq("questionId", questionId))
      .collect();
  },
});
