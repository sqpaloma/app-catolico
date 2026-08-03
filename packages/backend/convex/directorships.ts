import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireIdentity } from "./lib/auth";

export const request = mutation({
  args: { directorId: v.string() },
  returns: v.id("directorships"),
  handler: async (ctx, { directorId }) => {
    const identity = await requireIdentity(ctx);

    const director = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", directorId))
      .unique();

    if (!director) {
      throw new Error("Usuário não encontrado.");
    }

    if (directorId === identity.subject) {
      throw new Error("Você não pode solicitar direção espiritual a si mesmo.");
    }

    const existing = await ctx.db
      .query("directorships")
      .withIndex("by_directorId_directeeId", (q) =>
        q.eq("directorId", directorId).eq("directeeId", identity.subject),
      )
      .filter((q) => q.neq(q.field("status"), "rejected"))
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
  returns: v.null(),
  handler: async (ctx, { directorshipId }) => {
    const identity = await requireIdentity(ctx);

    const directorship = await ctx.db.get(directorshipId);
    if (!directorship) throw new Error("Solicitação não encontrada.");
    if (directorship.directorId !== identity.subject) {
      throw new Error("Apenas o diretor pode aceitar esta solicitação.");
    }
    if (directorship.status !== "pending") {
      throw new Error("Esta solicitação já foi processada.");
    }

    await ctx.db.patch(directorshipId, { status: "active" });
    return null;
  },
});

export const reject = mutation({
  args: { directorshipId: v.id("directorships") },
  returns: v.null(),
  handler: async (ctx, { directorshipId }) => {
    const identity = await requireIdentity(ctx);

    const directorship = await ctx.db.get(directorshipId);
    if (!directorship) throw new Error("Solicitação não encontrada.");
    if (directorship.directorId !== identity.subject) {
      throw new Error("Apenas o diretor pode rejeitar esta solicitação.");
    }
    if (directorship.status !== "pending") {
      throw new Error("Esta solicitação já foi processada.");
    }

    await ctx.db.patch(directorshipId, { status: "rejected" });
    return null;
  },
});

export const listMyDirectees = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const directorships = await ctx.db
      .query("directorships")
      .withIndex("by_directorId_status", (q) =>
        q.eq("directorId", identity.subject).eq("status", "active"),
      )
      .collect();

    return await Promise.all(
      directorships.map(async (d) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", d.directeeId))
          .unique();
        return {
          _id: d._id,
          status: d.status,
          createdAt: d.createdAt,
          directeeId: d.directeeId,
          // Never expose real names — only anonymous label.
          directeeName: user?.anonymousId ?? "Anônimo",
        };
      }),
    );
  },
});

export const getPendingRequests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("directorships")
      .withIndex("by_directorId_status", (q) =>
        q.eq("directorId", identity.subject).eq("status", "pending"),
      )
      .collect();
  },
});

export const getMyDirector = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const directorship = await ctx.db
      .query("directorships")
      .withIndex("by_directeeId_status", (q) =>
        q.eq("directeeId", identity.subject).eq("status", "active"),
      )
      .first();

    if (!directorship) return null;

    return {
      _id: directorship._id,
      status: directorship.status,
      createdAt: directorship.createdAt,
      // Omit directorId from public surface if not needed by UI —
      // keep for accept/reject ownership flows on director side only.
      directorId: directorship.directorId,
    };
  },
});
