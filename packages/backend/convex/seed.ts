import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedRealTestUsers = internalMutation({
  args: {
    userClerkId: v.string(),
    directorClerkId: v.string(),
    premiumClerkId: v.string(),
  },
  handler: async (ctx, { userClerkId, directorClerkId, premiumClerkId }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userClerkId))
      .unique();

    if (existingUser) {
      return { message: "Usuários de teste reais já existem no Convex." };
    }

    const userId = await ctx.db.insert("users", {
      clerkId: userClerkId,
      anonymousId: "real_anon_user_001",
      isDirector: false,
      isPremium: false,
    });

    const directorId = await ctx.db.insert("users", {
      clerkId: directorClerkId,
      anonymousId: "real_anon_director_002",
      isDirector: true,
      isPremium: false,
    });

    const premiumAnonId = "real_anon_premium_003";
    const premiumId = await ctx.db.insert("users", {
      clerkId: premiumClerkId,
      anonymousId: premiumAnonId,
      isDirector: false,
      isPremium: true,
      premiumUntil: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    await ctx.db.insert("questions", {
      userId: userClerkId,
      anonymousId: "real_anon_user_001",
      isPremium: false,
      originalText: "Estou com dificuldade em manter minha vida de oração. O que posso fazer?",
      normalizedText: "Estou enfrentando dificuldades em manter uma vida de oração constante. Gostaria de orientação sobre como perseverar nessa prática espiritual.",
      status: "pending",
      answerCount: 0,
    });

    await ctx.db.insert("questions", {
      userId: premiumClerkId,
      anonymousId: premiumAnonId,
      isPremium: true,
      originalText: "Sinto que estou me afastando de Deus. Como posso me reaproximar?",
      normalizedText: "Sinto que estou me distanciando de Deus e gostaria de orientação sobre como retomar minha proximidade com Ele na vida espiritual.",
      status: "pending",
      answerCount: 0,
    });

    await ctx.db.insert("questions", {
      userId: premiumClerkId,
      anonymousId: premiumAnonId,
      isPremium: true,
      originalText: "Tenho dúvidas sobre o sacramento da confissão.",
      normalizedText: "Tenho dúvidas sobre o sacramento da Reconciliação (Confissão). Gostaria de entender melhor como me preparar e o que esperar desse momento.",
      status: "consensus_ready",
      answerCount: 3,
      consensusResponse: "A confissão é um encontro de misericórdia com Deus. Prepare-se fazendo um exame de consciência sincero, reconhecendo seus pecados com humildade. O sacerdote está ali como instrumento de Cristo para acolhê-lo. Não tenha medo, pois Deus sempre perdoa quem se arrepende de coração.",
    });

    await ctx.db.insert("questions", {
      userId: premiumClerkId,
      anonymousId: premiumAnonId,
      isPremium: true,
      originalText: "Como lidar com a ansiedade à luz da fé católica?",
      normalizedText: "Gostaria de orientação sobre como enfrentar a ansiedade a partir da perspectiva da fé católica e da espiritualidade cristã.",
      status: "answering",
      answerCount: 1,
    });

    return {
      message: "Usuários de teste reais criados com sucesso!",
      users: { comum: userId, diretor: directorId, premium: premiumId },
    };
  },
});

export const seedTestUsers = internalMutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", "test_user_comum"))
      .unique();

    if (existing) {
      return { message: "Seed ignorado: usuários de teste já existem." };
    }

    // 1. Usuário comum
    const userId = await ctx.db.insert("users", {
      clerkId: "test_user_comum",
      anonymousId: "anon_user_abc123",
      isDirector: false,
      isPremium: false,
    });

    // 2. Diretor Espiritual
    const directorId = await ctx.db.insert("users", {
      clerkId: "test_diretor_espiritual",
      anonymousId: "anon_director_def456",
      isDirector: true,
      isPremium: false,
    });

    // 3. Usuário Premium
    const premiumId = await ctx.db.insert("users", {
      clerkId: "test_user_premium",
      anonymousId: "anon_premium_ghi789",
      isDirector: false,
      isPremium: true,
      premiumUntil: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    // Perguntas do usuário comum (sem histórico para diretores)
    await ctx.db.insert("questions", {
      userId: "test_user_comum",
      anonymousId: "anon_user_abc123",
      isPremium: false,
      originalText: "Estou com dificuldade em manter minha vida de oração. O que posso fazer?",
      normalizedText: "Estou enfrentando dificuldades em manter uma vida de oração constante. Gostaria de orientação sobre como perseverar nessa prática espiritual.",
      status: "pending",
      answerCount: 0,
    });

    // Perguntas do usuário premium (diretores verão o histórico)
    await ctx.db.insert("questions", {
      userId: "test_user_premium",
      anonymousId: "anon_premium_ghi789",
      isPremium: true,
      originalText: "Sinto que estou me afastando de Deus. Como posso me reaproximar?",
      normalizedText: "Sinto que estou me distanciando de Deus e gostaria de orientação sobre como retomar minha proximidade com Ele na vida espiritual.",
      status: "pending",
      answerCount: 0,
    });

    await ctx.db.insert("questions", {
      userId: "test_user_premium",
      anonymousId: "anon_premium_ghi789",
      isPremium: true,
      originalText: "Tenho dúvidas sobre o sacramento da confissão.",
      normalizedText: "Tenho dúvidas sobre o sacramento da Reconciliação (Confissão). Gostaria de entender melhor como me preparar e o que esperar desse momento.",
      status: "consensus_ready",
      answerCount: 3,
      consensusResponse: "A confissão é um encontro de misericórdia com Deus. Prepare-se fazendo um exame de consciência sincero, reconhecendo seus pecados com humildade. O sacerdote está ali como instrumento de Cristo para acolhê-lo. Não tenha medo, pois Deus sempre perdoa quem se arrepende de coração.",
    });

    await ctx.db.insert("questions", {
      userId: "test_user_premium",
      anonymousId: "anon_premium_ghi789",
      isPremium: true,
      originalText: "Como lidar com a ansiedade à luz da fé católica?",
      normalizedText: "Gostaria de orientação sobre como enfrentar a ansiedade a partir da perspectiva da fé católica e da espiritualidade cristã.",
      status: "answering",
      answerCount: 1,
    });

    return {
      message: "Seed concluído com sucesso!",
      users: {
        comum: userId,
        diretor: directorId,
        premium: premiumId,
      },
    };
  },
});
