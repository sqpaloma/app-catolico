import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  questions: defineTable({
    userId: v.string(),
    originalText: v.string(),
    normalizedText: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("answering"),
      v.literal("consensus_ready"),
    ),
    consensusResponse: v.optional(v.string()),
    answerCount: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  answers: defineTable({
    questionId: v.id("questions"),
    directorId: v.string(),
    directorName: v.string(),
    text: v.string(),
  })
    .index("by_questionId", ["questionId"])
    .index("by_directorId", ["directorId"]),
});
