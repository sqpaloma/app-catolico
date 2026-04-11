import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { PRIVACY_POLICY_HTML } from "./privacyPolicyHtml";

const http = httpRouter();

http.route({
  path: "/privacy",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(PRIVACY_POLICY_HTML, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }),
});

function mapAsaasEventToInvoiceStatus(
  event: string,
): "pending" | "confirmed" | "received" | "overdue" | "refunded" | "cancelled" | null {
  switch (event) {
    case "PAYMENT_CREATED":
    case "PAYMENT_UPDATED":
      return "pending";
    case "PAYMENT_CONFIRMED":
      return "confirmed";
    case "PAYMENT_RECEIVED":
      return "received";
    case "PAYMENT_OVERDUE":
      return "overdue";
    case "PAYMENT_REFUNDED":
    case "PAYMENT_REFUND_IN_PROGRESS":
      return "refunded";
    case "PAYMENT_DELETED":
      return "cancelled";
    default:
      return null;
  }
}

http.route({
  path: "/asaas/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;

    if (webhookToken) {
      const receivedToken = request.headers.get("asaas-access-token");
      if (receivedToken !== webhookToken) {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const event: string = body.event;
    const payment = body.payment;

    if (!event || !payment) {
      return new Response("OK", { status: 200 });
    }

    const asaasCustomerId: string | undefined = payment.customer;
    if (!asaasCustomerId) {
      return new Response("OK", { status: 200 });
    }

    const subscriptionId: string | undefined = payment.subscription;

    // --- Sync invoice ---
    const invoiceStatus = mapAsaasEventToInvoiceStatus(event);
    if (invoiceStatus && subscriptionId && payment.id) {
      const order = await ctx.runQuery(internal.orders.getBySubscriptionId, {
        asaasSubscriptionId: subscriptionId,
      });

      if (order) {
        const pix = payment.pix;
        await ctx.runMutation(internal.invoices.upsertFromWebhook, {
          userId: order.userId,
          orderId: order._id,
          asaasPaymentId: payment.id,
          status: invoiceStatus,
          billingType: payment.billingType ?? "UNDEFINED",
          value: payment.value ?? 0,
          dueDate: payment.dueDate ?? "",
          paymentDate: payment.paymentDate ?? undefined,
          invoiceUrl: payment.invoiceUrl ?? undefined,
          bankSlipUrl: payment.bankSlipUrl ?? undefined,
          pixQrCodeBase64:
            pix?.encodedImage ?? pix?.qrCodeBase64 ?? undefined,
          pixCopiaECola: pix?.payload ?? pix?.copyPaste ?? undefined,
          boletoLinhaDigitavel: payment.identificationField ?? undefined,
        });
      }
    }

    // --- Sync order + premium status ---
    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      const premiumUntil = payment.dueDate
        ? new Date(payment.dueDate).getTime() + 35 * 24 * 60 * 60 * 1000
        : Date.now() + 35 * 24 * 60 * 60 * 1000;

      await ctx.runMutation(internal.users.setPremiumByAsaasCustomer, {
        asaasCustomerId,
        isPremium: true,
        premiumUntil,
      });

      if (subscriptionId) {
        await ctx.runMutation(internal.orders.updateStatusBySubscription, {
          asaasSubscriptionId: subscriptionId,
          status: "active",
        });
      }
    }

    if (event === "PAYMENT_OVERDUE") {
      if (subscriptionId) {
        await ctx.runMutation(internal.orders.updateStatusBySubscription, {
          asaasSubscriptionId: subscriptionId,
          status: "overdue",
        });
      }
    }

    if (
      event === "PAYMENT_DELETED" ||
      event === "PAYMENT_REFUNDED"
    ) {
      await ctx.runMutation(internal.users.setPremiumByAsaasCustomer, {
        asaasCustomerId,
        isPremium: false,
      });

      if (subscriptionId) {
        await ctx.runMutation(internal.orders.updateStatusBySubscription, {
          asaasSubscriptionId: subscriptionId,
          status: "cancelled",
        });
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
