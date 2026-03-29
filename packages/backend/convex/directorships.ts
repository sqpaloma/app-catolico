import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const request = mutation({
  args: { directorId: v.string() },
  handler: async (ctx, { directorId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const director = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", directorId))
      .unique();

    if (!director || !director.isDirector) {
      throw new Error("Diretor espiritual não encontrado.");
    }

    if (directorId === identity.subject) {
      throw new Error("Você não pode solicitar direção espiritual a si mesmo.");
    }

    const existing = await ctx.db
      .query("directorships")
      .withIndex("by_directeeId", (q) => q.eq("directeeId", identity.subject))
      .filter((q) =>
        q.and(
          q.eq(q.field("directorId"), directorId),
          q.neq(q.field("status"), "rejected"),
        ),
      )
      .first();

    if (existing) {
      throw new Error("Já existe uma solicitação para este diretor.");
    }

    return await ctx.db.insert("directorships", {
      directorId,
      directeeId: identity.subject,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const accept = mutation({
  args: { directorshipId: v.id("directorships") },
  handler: async (ctx, { directorshipId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const directorship = await ctx.db.get(directorshipId);
    if (!directorship) throw new Error("Solicitação não encontrada.");
    if (directorship.directorId !== identity.subject) {
      throw new Error("Apenas o diretor pode aceitar esta solicitação.");
    }
    if (directorship.status !== "pending") {
      throw new Error("Esta solicitação já foi processada.");
    }

    await ctx.db.patch(directorshipId, { status: "active" });
  },
});

export const reject = mutation({
  args: { directorshipId: v.id("directorships") },
  handler: async (ctx, { directorshipId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const directorship = await ctx.db.get(directorshipId);
    if (!directorship) throw new Error("Solicitação não encontrada.");
    if (directorship.directorId !== identity.subject) {
      throw new Error("Apenas o diretor pode rejeitar esta solicitação.");
    }
    if (directorship.status !== "pending") {
      throw new Error("Esta solicitação já foi processada.");
    }

    await ctx.db.patch(directorshipId, { status: "rejected" });
  },
});

export const listMyDirectees = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const directorships = await ctx.db
      .query("directorships")
      .withIndex("by_directorId", (q) => q.eq("directorId", identity.subject))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    return await Promise.all(
      directorships.map(async (d) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", d.directeeId))
          .unique();
        return {
          ...d,
          directeeName: user?.anonymousId ?? "Anônimo",
        };
      }),
    );
  },
});

export const getPendingRequests = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("directorships")
      .withIndex("by_directorId", (q) => q.eq("directorId", identity.subject))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

export const getMyDirector = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const directorship = await ctx.db
      .query("directorships")
      .withIndex("by_directeeId", (q) => q.eq("directeeId", identity.subject))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    return directorship;
  },
});
