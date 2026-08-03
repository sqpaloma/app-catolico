import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

const ENTITLEMENT_ID = "Safe Pro";

type RevenueCatEvent = {
  type?: string;
  app_user_id?: string;
  expiration_at_ms?: number | null;
  entitlement_ids?: string[] | null;
  entitlements?: Record<string, unknown> | null;
};

type RevenueCatWebhookBody = {
  api_version?: string;
  event?: RevenueCatEvent;
};

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function normalizeAuthHeader(value: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

function eventGrantsPremium(event: RevenueCatEvent): boolean {
  const type = event.type ?? "";
  const revokeTypes = new Set([
    "EXPIRATION",
    "CANCELLATION",
    "SUBSCRIPTION_PAUSED",
  ]);
  if (revokeTypes.has(type)) return false;

  if (Array.isArray(event.entitlement_ids) && event.entitlement_ids.length > 0) {
    return event.entitlement_ids.includes(ENTITLEMENT_ID);
  }

  if (event.entitlements && typeof event.entitlements === "object") {
    return ENTITLEMENT_ID in event.entitlements;
  }

  // INITIAL_PURCHASE / RENEWAL / UNCANCELLATION / PRODUCT_CHANGE / TRANSFER
  // without explicit entitlement list — treat as premium grant when not revoke.
  const grantTypes = new Set([
    "INITIAL_PURCHASE",
    "RENEWAL",
    "UNCANCELLATION",
    "NON_RENEWING_PURCHASE",
    "PRODUCT_CHANGE",
    "TRANSFER",
    "TEMPORARY_ENTITLEMENT_GRANT",
  ]);
  return grantTypes.has(type);
}

http.route({
  path: "/webhooks/revenuecat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
    if (!secret || secret.length < 16) {
      console.error("[RevenueCat] REVENUECAT_WEBHOOK_SECRET missing or too short");
      return new Response("Server misconfigured", { status: 500 });
    }

    const provided = normalizeAuthHeader(request.headers.get("Authorization"));
    if (!timingSafeEqual(provided, secret)) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: RevenueCatWebhookBody;
    try {
      body = (await request.json()) as RevenueCatWebhookBody;
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const event = body.event;
    if (!event?.app_user_id) {
      return new Response("Ignored", { status: 200 });
    }

    const clerkId = event.app_user_id;
    const isPremium = eventGrantsPremium(event);
    const premiumUntil =
      typeof event.expiration_at_ms === "number"
        ? event.expiration_at_ms
        : undefined;

    try {
      await ctx.runMutation(internal.users.setPremiumStatus, {
        clerkId,
        isPremium,
        premiumUntil,
      });
    } catch (error) {
      console.error("[RevenueCat] setPremiumStatus failed", {
        clerkId,
        type: event.type,
        error: error instanceof Error ? error.message : String(error),
      });
      // Still 200 so RC does not hammer retries for unknown users.
      return new Response("OK", { status: 200 });
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
