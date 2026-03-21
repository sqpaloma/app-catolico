import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

const invoiceStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("received"),
  v.literal("overdue"),
  v.literal("refunded"),
  v.literal("cancelled"),
);

export const upsertFromWebhook = internalMutation({
  args: {
    userId: v.string(),
    orderId: v.id("orders"),
    asaasPaymentId: v.string(),
    status: invoiceStatusValidator,
    billingType: v.string(),
    value: v.number(),
    dueDate: v.string(),
    paymentDate: v.optional(v.string()),
    invoiceUrl: v.optional(v.string()),
    bankSlipUrl: v.optional(v.string()),
    pixQrCodeBase64: v.optional(v.string()),
    pixCopiaECola: v.optional(v.string()),
    boletoLinhaDigitavel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("invoices")
      .withIndex("by_asaasPaymentId", (q) =>
        q.eq("asaasPaymentId", args.asaasPaymentId),
      )
      .unique();

    if (existing) {
      const patch: Record<string, unknown> = {
        status: args.status,
        paymentDate: args.paymentDate,
      };
      if (args.invoiceUrl !== undefined) patch.invoiceUrl = args.invoiceUrl;
      if (args.bankSlipUrl !== undefined) patch.bankSlipUrl = args.bankSlipUrl;
      if (args.pixQrCodeBase64 !== undefined)
        patch.pixQrCodeBase64 = args.pixQrCodeBase64;
      if (args.pixCopiaECola !== undefined)
        patch.pixCopiaECola = args.pixCopiaECola;
      if (args.boletoLinhaDigitavel !== undefined)
        patch.boletoLinhaDigitavel = args.boletoLinhaDigitavel;
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("invoices", {
      userId: args.userId,
      orderId: args.orderId,
      asaasPaymentId: args.asaasPaymentId,
      status: args.status,
      billingType: args.billingType,
      value: args.value,
      dueDate: args.dueDate,
      paymentDate: args.paymentDate,
      invoiceUrl: args.invoiceUrl,
      bankSlipUrl: args.bankSlipUrl,
      pixQrCodeBase64: args.pixQrCodeBase64,
      pixCopiaECola: args.pixCopiaECola,
      boletoLinhaDigitavel: args.boletoLinhaDigitavel,
      createdAt: Date.now(),
    });
  },
});

export const getMyInvoices = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("invoices")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});
