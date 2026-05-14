import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    anonymousId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    gender: v.optional(
      v.union(v.literal("masculino"), v.literal("feminino"), v.literal("prefiro_nao_identificar")),
    ),
    ageGroup: v.optional(
      v.union(
        v.literal("-18"),
        v.literal("18-25"),
        v.literal("25-35"),
        v.literal("35-45"),
        v.literal("45-55"),
        v.literal("55+"),
      ),
    ),
    hasDepression: v.optional(v.boolean()),
    goesToChurch: v.optional(v.boolean()),
    isDirector: v.optional(v.boolean()),
    isPremium: v.boolean(),
    premiumUntil: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_anonymousId", ["anonymousId"]),

  questions: defineTable({
    userId: v.string(),
    anonymousId: v.string(),
    isPremium: v.boolean(),
    category: v.optional(v.string()),
    originalText: v.string(),
    normalizedText: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("answering"),
      v.literal("consensus_ready"),
    ),
    consensusResponse: v.optional(v.string()),
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
    answerCount: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_anonymousId", ["anonymousId"]),

  answers: defineTable({
    questionId: v.id("questions"),
    directorId: v.string(),
    directorName: v.string(),
    text: v.string(),
    role: v.optional(
      v.union(v.literal("leigo"), v.literal("diretor"), v.literal("padre")),
    ),
  })
    .index("by_questionId", ["questionId"])
    .index("by_directorId", ["directorId"]),

  posts: defineTable({
    userId: v.string(),
    text: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    visibleToDirector: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId", "createdAt"])
    .index("by_userId_visible", ["userId", "visibleToDirector"]),

  directorships: defineTable({
    directorId: v.string(),
    directeeId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("rejected"),
    ),
    createdAt: v.number(),
  })
    .index("by_directorId", ["directorId"])
    .index("by_directeeId", ["directeeId"]),

});
