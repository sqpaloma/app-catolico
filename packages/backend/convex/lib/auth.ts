import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

type Ctx = QueryCtx | MutationCtx;

export async function requireIdentity(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Não autenticado");
  return identity;
}

export async function getOptionalIdentity(ctx: Ctx) {
  return await ctx.auth.getUserIdentity();
}

export async function requireUser(ctx: Ctx): Promise<{
  identity: NonNullable<Awaited<ReturnType<Ctx["auth"]["getUserIdentity"]>>>;
  user: Doc<"users">;
}> {
  const identity = await requireIdentity(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("Usuário não encontrado. Faça login novamente.");
  return { identity, user };
}

export async function getOptionalUser(ctx: Ctx): Promise<{
  identity: NonNullable<Awaited<ReturnType<Ctx["auth"]["getUserIdentity"]>>>;
  user: Doc<"users">;
} | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) return null;
  return { identity, user };
}

export function isPremiumActive(
  user: Pick<Doc<"users">, "isPremium" | "premiumUntil">,
  now: number,
): boolean {
  if (!user.isPremium) return false;
  if (user.premiumUntil !== undefined && user.premiumUntil <= now) return false;
  return true;
}
