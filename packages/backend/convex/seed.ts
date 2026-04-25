import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

const TARGET_USER_DOCUMENT_ID =
  "jn77btmjw8shg4hmzkrrkw4dbh84rcn9" as Id<"users">;
const TARGET_USER_FALLBACK_CLERK_ID = "jn77btmjw8shg4hmzkrrkw4dbh84rcn9";
const TARGET_USER_ANONYMOUS_ID = "anon_jn77btmjw_seed";
const TARGET_USER_SEED_CATEGORY = "seed_usuario_jn77";

const EXAMEN_RESPONSE_PATTERNS = [
  {
    representativeText:
      "Antes da confissão, peça luz ao Espírito Santo e revise com calma seus pensamentos, palavras, ações e omissões. Anote o que perceber e termine com um ato sincero de contrição.",
    confidenceScore: 92,
    matchingAnswerCount: 5,
    totalAnswerCount: 5,
  },
];

const EXAMEN_SOURCE_GUIDANCE =
  "Para preparar um bom exame de consciência, comece pedindo luz ao Espírito Santo e faça silêncio suficiente para olhar sua vida diante de Deus. Revise com sinceridade seus pensamentos, palavras, ações e omissões, sem medo, mas também sem justificar aquilo que precisa ser confessado.\n\nUse os mandamentos como ajuda concreta e observe onde houve falta de amor a Deus, ao próximo e aos deveres do seu estado de vida. Ao final, faça um ato de contrição e vá ao sacramento com confiança, lembrando que a confissão é lugar de misericórdia e recomeço.\n\nCIC 1451 — A contrição é uma dor da alma e detestação do pecado cometido, com o propósito de não mais pecar.\nJoão 20,22-23 — Recebei o Espírito Santo; aqueles a quem perdoardes os pecados, lhes serão perdoados.";

const EXAMEN_CONSENSUS_RESPONSE = EXAMEN_SOURCE_GUIDANCE;

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
      answerCount: 5,
      consensusResponse: EXAMEN_CONSENSUS_RESPONSE,
      confidenceScore: EXAMEN_RESPONSE_PATTERNS[0].confidenceScore,
      responsePatterns: EXAMEN_RESPONSE_PATTERNS,
      sourceGuidance: EXAMEN_SOURCE_GUIDANCE,
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
      answerCount: 5,
      consensusResponse: EXAMEN_CONSENSUS_RESPONSE,
      confidenceScore: EXAMEN_RESPONSE_PATTERNS[0].confidenceScore,
      responsePatterns: EXAMEN_RESPONSE_PATTERNS,
      sourceGuidance: EXAMEN_SOURCE_GUIDANCE,
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

export const seedTargetUser = internalMutation({
  args: {},
  returns: v.object({
    message: v.string(),
    userDocumentId: v.id("users"),
    clerkId: v.string(),
    questionsCreated: v.number(),
    postsCreated: v.number(),
  }),
  handler: async (ctx) => {
    const userByDocumentId = await ctx.db.get(TARGET_USER_DOCUMENT_ID);
    let user =
      userByDocumentId ??
      (await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) =>
          q.eq("clerkId", TARGET_USER_FALLBACK_CLERK_ID),
        )
        .unique());

    if (!user) {
      const userDocumentId = await ctx.db.insert("users", {
        clerkId: TARGET_USER_FALLBACK_CLERK_ID,
        anonymousId: TARGET_USER_ANONYMOUS_ID,
        isDirector: false,
        isPremium: true,
        premiumUntil: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
      user = await ctx.db.get(userDocumentId);
    }

    if (!user) {
      throw new Error("Não foi possível criar ou localizar o usuário do seed.");
    }

    const existingSeedQuestions = (
      await ctx.db
        .query("questions")
        .withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
        .collect()
    ).filter((question) => question.category === TARGET_USER_SEED_CATEGORY);
    const existingSeedQuestion = existingSeedQuestions[0];
    const existingExamQuestion =
      existingSeedQuestions.find((question) =>
        question.originalText.includes("exame de consciência"),
      ) ?? existingSeedQuestions.find((question) => question.status === "consensus_ready");

    if (existingSeedQuestion) {
      if (existingExamQuestion) {
        await ctx.db.patch(existingExamQuestion._id, {
          status: "consensus_ready",
          answerCount: 5,
          consensusResponse: EXAMEN_CONSENSUS_RESPONSE,
          confidenceScore: EXAMEN_RESPONSE_PATTERNS[0].confidenceScore,
          responsePatterns: EXAMEN_RESPONSE_PATTERNS,
          sourceGuidance: EXAMEN_SOURCE_GUIDANCE,
        });
      }

      return {
        message: existingExamQuestion
          ? "Seed atualizado: resposta estruturada aplicada."
          : "Seed ignorado: dados deste usuário já existem.",
        userDocumentId: user._id,
        clerkId: user.clerkId,
        questionsCreated: 0,
        postsCreated: 0,
      };
    }

    const legacyExamQuestion = (
      await ctx.db
        .query("questions")
        .withIndex("by_userId", (q) => q.eq("userId", user.clerkId))
        .collect()
    ).find((question) =>
      question.originalText.includes("exame de consciência"),
    );

    if (legacyExamQuestion) {
      await ctx.db.patch(legacyExamQuestion._id, {
        status: "consensus_ready",
        answerCount: 5,
        consensusResponse: EXAMEN_CONSENSUS_RESPONSE,
        confidenceScore: EXAMEN_RESPONSE_PATTERNS[0].confidenceScore,
        responsePatterns: EXAMEN_RESPONSE_PATTERNS,
        sourceGuidance: EXAMEN_SOURCE_GUIDANCE,
      });

      return {
        message: "Seed legado atualizado: resposta estruturada aplicada.",
        userDocumentId: user._id,
        clerkId: user.clerkId,
        questionsCreated: 0,
        postsCreated: 0,
      };
    }

    const isPremium = user.isPremium;
    const questions = [
      {
        originalText:
          "Tenho dificuldade de manter uma rotina de oração diária. Por onde devo começar?",
        normalizedText:
          "Gostaria de orientação prática para estabelecer uma rotina diária de oração e perseverar nela.",
        status: "pending" as const,
        answerCount: 0,
      },
      {
        originalText:
          "Como posso fazer um bom exame de consciência antes da confissão?",
        normalizedText:
          "Desejo entender como preparar um exame de consciência sincero antes do sacramento da Reconciliação.",
        status: "consensus_ready" as const,
        answerCount: 5,
        consensusResponse: EXAMEN_CONSENSUS_RESPONSE,
        confidenceScore: EXAMEN_RESPONSE_PATTERNS[0].confidenceScore,
        responsePatterns: EXAMEN_RESPONSE_PATTERNS,
        sourceGuidance: EXAMEN_SOURCE_GUIDANCE,
      },
      {
        originalText:
          "Sinto ansiedade e quero aprender a entregar minhas preocupações a Deus.",
        normalizedText:
          "Busco uma orientação católica para viver a ansiedade com fé, oração e confiança em Deus.",
        status: "answering" as const,
        answerCount: 1,
      },
    ];

    for (const question of questions) {
      await ctx.db.insert("questions", {
        userId: user.clerkId,
        anonymousId: user.anonymousId,
        isPremium,
        category: TARGET_USER_SEED_CATEGORY,
        ...question,
      });
    }

    const now = Date.now();
    const posts = [
      {
        text: "Hoje consegui reservar alguns minutos para rezar com calma.",
        visibleToDirector: true,
        createdAt: now - 2 * 24 * 60 * 60 * 1000,
      },
      {
        text: "Quero crescer na constância da oração e na confiança em Deus.",
        visibleToDirector: true,
        createdAt: now - 24 * 60 * 60 * 1000,
      },
      {
        text: "Anotação pessoal para acompanhar minha caminhada espiritual.",
        visibleToDirector: false,
        createdAt: now,
      },
    ];

    for (const post of posts) {
      await ctx.db.insert("posts", {
        userId: user.clerkId,
        ...post,
      });
    }

    return {
      message: "Seed do usuário criado com sucesso!",
      userDocumentId: user._id,
      clerkId: user.clerkId,
      questionsCreated: questions.length,
      postsCreated: posts.length,
    };
  },
});
