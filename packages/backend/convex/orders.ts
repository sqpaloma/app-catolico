import {
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { v } from "convex/values";

export const create = internalMutation({
  args: {
    userId: v.string(),
    asaasCustomerId: v.string(),
    asaasSubscriptionId: v.string(),
    billingType: v.union(
      v.literal("PIX"),
      v.literal("BOLETO"),
      v.literal("CREDIT_CARD"),
      v.literal("UNDEFINED"),
    ),
    value: v.number(),
    paymentLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", {
      userId: args.userId,
      asaasCustomerId: args.asaasCustomerId,
      asaasSubscriptionId: args.asaasSubscriptionId,
      status: "pending_payment",
      plan: "premium",
      value: args.value,
      billingType: args.billingType,
      paymentLink: args.paymentLink,
      createdAt: Date.now(),
    });
  },
});

export const updateStatusBySubscription = internalMutation({
  args: {
    asaasSubscriptionId: v.string(),
    status: v.union(
      v.literal("pending_payment"),
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("overdue"),
    ),
  },
  handler: async (ctx, { asaasSubscriptionId, status }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_asaasSubscriptionId", (q) =>
        q.eq("asaasSubscriptionId", asaasSubscriptionId),
      )
      .order("desc")
      .first();

    if (order) {
      await ctx.db.patch(order._id, { status });
    }
  },
});

export const getBySubscriptionId = internalQuery({
  args: { asaasSubscriptionId: v.string() },
  handler: async (ctx, { asaasSubscriptionId }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_asaasSubscriptionId", (q) =>
        q.eq("asaasSubscriptionId", asaasSubscriptionId),
      )
      .order("desc")
      .first();
  },
});

/** Verifica se o pedido da assinatura pertence ao usuário (para actions Asaas). */
export const getBySubscriptionForUser = internalQuery({
  args: {
    asaasSubscriptionId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { asaasSubscriptionId, userId }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_asaasSubscriptionId", (q) =>
        q.eq("asaasSubscriptionId", asaasSubscriptionId),
      )
      .order("desc")
      .first();
    if (!order || order.userId !== userId) return null;
    return order;
  },
});

export const getMyOrders = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const getMyActiveOrder = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return (
      orders.find((o) => o.status === "active") ??
      orders.find((o) => o.status === "pending_payment") ??
      null
    );
  },
});
