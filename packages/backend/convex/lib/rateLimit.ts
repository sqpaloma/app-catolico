import type { MutationCtx } from "../_generated/server";

const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Simple per-user rate limit stored in `rateLimits` table.
 * Throws if the caller exceeded `max` events in the rolling window.
 */
export async function enforceRateLimit(
  ctx: MutationCtx,
  key: string,
  max: number,
  windowMs: number = WINDOW_MS,
): Promise<void> {
  const now = Date.now();
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();

  if (!existing || now - existing.windowStart >= windowMs) {
    if (existing) {
      await ctx.db.patch(existing._id, { windowStart: now, count: 1 });
    } else {
      await ctx.db.insert("rateLimits", { key, windowStart: now, count: 1 });
    }
    return;
  }

  if (existing.count >= max) {
    throw new Error("Limite de uso atingido. Tente novamente mais tarde.");
  }

  await ctx.db.patch(existing._id, { count: existing.count + 1 });
}
