import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    anonymousId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    isDirector: v.optional(v.boolean()),
    isPremium: v.boolean(),
    premiumUntil: v.optional(v.number()),
    asaasCustomerId: v.optional(v.string()),
    asaasSubscriptionId: v.optional(v.string()),
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

  orders: defineTable({
    userId: v.string(),
    asaasCustomerId: v.string(),
    asaasSubscriptionId: v.string(),
    status: v.union(
      v.literal("pending_payment"),
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("overdue"),
    ),
    plan: v.literal("premium"),
    value: v.number(),
    billingType: v.union(
      v.literal("PIX"),
      v.literal("BOLETO"),
      v.literal("CREDIT_CARD"),
      v.literal("UNDEFINED"),
    ),
    paymentLink: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_asaasSubscriptionId", ["asaasSubscriptionId"]),

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

  invoices: defineTable({
    userId: v.string(),
    orderId: v.id("orders"),
    asaasPaymentId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("received"),
      v.literal("overdue"),
      v.literal("refunded"),
      v.literal("cancelled"),
    ),
    billingType: v.string(),
    value: v.number(),
    dueDate: v.string(),
    paymentDate: v.optional(v.string()),
    invoiceUrl: v.optional(v.string()),
    bankSlipUrl: v.optional(v.string()),
    pixQrCodeBase64: v.optional(v.string()),
    pixCopiaECola: v.optional(v.string()),
    boletoLinhaDigitavel: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_orderId", ["orderId"])
    .index("by_asaasPaymentId", ["asaasPaymentId"]),
});
