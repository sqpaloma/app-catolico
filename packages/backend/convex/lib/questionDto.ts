import type { Doc, Id } from "../_generated/dataModel";
import { v } from "convex/values";

export const responsePatternValidator = v.object({
  representativeText: v.string(),
  confidenceScore: v.number(),
  matchingAnswerCount: v.number(),
  totalAnswerCount: v.number(),
});

export const questionStatusValidator = v.union(
  v.literal("pending"),
  v.literal("answering"),
  v.literal("consensus_processing"),
  v.literal("consensus_ready"),
);

export const publicQuestionValidator = v.object({
  _id: v.id("questions"),
  _creationTime: v.number(),
  isPremium: v.boolean(),
  category: v.optional(v.string()),
  originalText: v.string(),
  normalizedText: v.string(),
  status: questionStatusValidator,
  consensusResponse: v.optional(v.string()),
  confidenceScore: v.optional(v.number()),
  responsePatterns: v.optional(v.array(responsePatternValidator)),
  sourceGuidance: v.optional(v.string()),
  answerCount: v.number(),
  isOwner: v.boolean(),
});

export const historyQuestionValidator = v.object({
  _id: v.id("questions"),
  _creationTime: v.number(),
  isPremium: v.boolean(),
  category: v.optional(v.string()),
  originalText: v.string(),
  normalizedText: v.string(),
  status: questionStatusValidator,
  answerCount: v.number(),
});

export const publicAnswerValidator = v.object({
  _id: v.id("answers"),
  questionId: v.id("questions"),
  text: v.string(),
  role: v.optional(
    v.union(v.literal("leigo"), v.literal("diretor"), v.literal("padre")),
  ),
});

export type PublicQuestion = {
  _id: Id<"questions">;
  _creationTime: number;
  isPremium: boolean;
  category?: string;
  originalText: string;
  normalizedText: string;
  status: Doc<"questions">["status"];
  consensusResponse?: string;
  confidenceScore?: number;
  responsePatterns?: Doc<"questions">["responsePatterns"];
  sourceGuidance?: string;
  answerCount: number;
  isOwner: boolean;
};

export function toPublicQuestion(
  question: Doc<"questions">,
  callerSubject: string | null,
): PublicQuestion {
  return {
    _id: question._id,
    _creationTime: question._creationTime,
    isPremium: question.isPremium,
    category: question.category,
    originalText: question.originalText,
    normalizedText: question.normalizedText,
    status: question.status,
    consensusResponse: question.consensusResponse,
    confidenceScore: question.confidenceScore,
    responsePatterns: question.responsePatterns,
    sourceGuidance: question.sourceGuidance,
    answerCount: question.answerCount,
    isOwner: callerSubject !== null && question.userId === callerSubject,
  };
}

export function toHistoryQuestion(question: Doc<"questions">) {
  return {
    _id: question._id,
    _creationTime: question._creationTime,
    isPremium: question.isPremium,
    category: question.category,
    originalText: question.originalText,
    normalizedText: question.normalizedText,
    status: question.status,
    answerCount: question.answerCount,
  };
}
