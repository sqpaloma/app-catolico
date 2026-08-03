import { mutation, query, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireIdentity } from "./lib/auth";
import { enforceRateLimit } from "./lib/rateLimit";
import { publicAnswerValidator } from "./lib/questionDto";

const MAX_ANSWER_LENGTH = 4000;
const MIN_ANSWER_LENGTH = 10;

export const submit = mutation({
  args: {
    questionId: v.id("questions"),
    text: v.string(),
    role: v.optional(
      v.union(v.literal("leigo"), v.literal("diretor"), v.literal("padre")),
    ),
  },
  returns: v.id("questions"),
  handler: async (ctx, { questionId, text, role }) => {
    const identity = await requireIdentity(ctx);

    const trimmed = text.trim();
    if (trimmed.length < MIN_ANSWER_LENGTH) {
      throw new Error(`A resposta deve ter pelo menos ${MIN_ANSWER_LENGTH} caracteres.`);
    }
    if (trimmed.length > MAX_ANSWER_LENGTH) {
      throw new Error(`A resposta deve ter no máximo ${MAX_ANSWER_LENGTH} caracteres.`);
    }

    const question = await ctx.db.get(questionId);
    if (!question) throw new Error("Pergunta não encontrada");

    if (question.userId === identity.subject) {
      throw new Error("Você não pode responder à sua própria pergunta.");
    }

    if (question.status !== "pending" && question.status !== "answering") {
      throw new Error("Esta pergunta não está mais aberta para respostas.");
    }

    await enforceRateLimit(ctx, `answers:${identity.subject}`, 40);

    const existing = await ctx.db
      .query("answers")
      .withIndex("by_questionId_directorId", (q) =>
        q.eq("questionId", questionId).eq("directorId", identity.subject),
      )
      .first();

    if (existing) throw new Error("Você já respondeu esta pergunta");

    await ctx.db.insert("answers", {
      questionId,
      directorId: identity.subject,
      directorName: "Anônimo",
      text: trimmed,
      role,
    });

    const allAnswers = await ctx.db
      .query("answers")
      .withIndex("by_questionId", (q) => q.eq("questionId", questionId))
      .collect();
    const newCount = allAnswers.length;
    // Status already constrained to pending|answering above.
    const shouldStartConsensus = newCount >= 3;

    await ctx.db.patch(questionId, {
      answerCount: newCount,
      status: shouldStartConsensus
        ? "consensus_processing"
        : question.status === "pending"
          ? "answering"
          : question.status,
    });

    if (shouldStartConsensus) {
      await ctx.scheduler.runAfter(0, internal.ai.generateConsensus, {
        questionId,
      });
    }

    return questionId;
  },
});

export const getByQuestion = query({
  args: { questionId: v.id("questions") },
  returns: v.array(publicAnswerValidator),
  handler: async (ctx, { questionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const question = await ctx.db.get(questionId);
    if (!question) return [];

    if (question.userId === identity.subject) return [];

    const own = await ctx.db
      .query("answers")
      .withIndex("by_questionId_directorId", (q) =>
        q.eq("questionId", questionId).eq("directorId", identity.subject),
      )
      .first();

    if (!own) return [];

    return [
      {
        _id: own._id,
        questionId: own.questionId,
        text: own.text,
        role: own.role,
      },
    ];
  },
});

export const getMyAnswers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("answers"),
      questionId: v.id("questions"),
      _creationTime: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const answers = await ctx.db
      .query("answers")
      .withIndex("by_directorId", (q) =>
        q.eq("directorId", identity.subject),
      )
      .order("desc")
      .collect();

    return answers.map((a) => ({
      _id: a._id,
      questionId: a.questionId,
      _creationTime: a._creationTime,
    }));
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
