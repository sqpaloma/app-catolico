import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_POST_LENGTH = 250;

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    text: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    visibleToDirector: v.boolean(),
  },
  handler: async (ctx, { text, imageStorageId, visibleToDirector }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    if (text.length === 0) throw new Error("O texto não pode estar vazio.");
    if (text.length > MAX_POST_LENGTH) {
      throw new Error(`O texto deve ter no máximo ${MAX_POST_LENGTH} caracteres.`);
    }

    return await ctx.db.insert("posts", {
      userId: identity.subject,
      text,
      imageStorageId,
      visibleToDirector,
      createdAt: Date.now(),
    });
  },
});

export const listMine = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return await Promise.all(
      posts.map(async (post) => ({
        ...post,
        imageUrl: post.imageStorageId
          ? await ctx.storage.getUrl(post.imageStorageId)
          : null,
      })),
    );
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

export const listByDirectee = query({
  args: { directeeId: v.string() },
  handler: async (ctx, { directeeId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const directorship = await ctx.db
      .query("directorships")
      .withIndex("by_directorId", (q) => q.eq("directorId", identity.subject))
      .filter((q) =>
        q.and(
          q.eq(q.field("directeeId"), directeeId),
          q.eq(q.field("status"), "active"),
        ),
      )
      .unique();

    if (!directorship) {
      throw new Error("Você não é diretor espiritual desta pessoa.");
    }

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId_visible", (q) =>
        q.eq("userId", directeeId).eq("visibleToDirector", true),
      )
      .order("desc")
      .collect();

    return await Promise.all(
      posts.map(async (post) => ({
        ...post,
        imageUrl: post.imageStorageId
          ? await ctx.storage.getUrl(post.imageStorageId)
          : null,
      })),
    );
  },
});

export const remove = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post não encontrado.");
    if (post.userId !== identity.subject) {
      throw new Error("Você não pode excluir este post.");
    }

    if (post.imageStorageId) {
      await ctx.storage.delete(post.imageStorageId);
    }

    await ctx.db.delete(postId);
  },
});
