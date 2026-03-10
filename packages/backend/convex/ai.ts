"use node";

import OpenAI from "openai";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const normalizeQuestion = internalAction({
  args: {
    questionId: v.id("questions"),
    originalText: v.string(),
  },
  handler: async (ctx, { questionId, originalText }) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente que reescreve textos de forma clara, respeitosa e estruturada, sem alterar o significado original. O contexto é direção espiritual católica. Mantenha o tom pessoal e humilde. Responda apenas com o texto reescrito, sem explicações adicionais.",
        },
        {
          role: "user",
          content: originalText,
        },
      ],
      max_tokens: 500,
    });

    const normalizedText =
      response.choices[0]?.message?.content?.trim() ?? originalText;

    await ctx.runMutation(internal.questions.saveNormalized, {
      questionId,
      normalizedText,
    });
  },
});

export const generateConsensus = internalAction({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, { questionId }) => {
    const answers = await ctx.runQuery(internal.answers.listByQuestion, {
      questionId,
    });

    if (answers.length < 3) return;

    const answersText = answers
      .map((a, i) => `Resposta ${i + 1}: ${a.text}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um diretor espiritual católico experiente. A seguir estão respostas de diferentes diretores espirituais para o mesmo problema.

Crie uma orientação única que represente o consenso geral entre as respostas.

Regras:
- Não repetir ideias iguais
- Manter apenas ideias comuns entre as respostas
- Redigir em tom pastoral e respeitoso
- Máximo 5 frases
- Pode incluir sugestões de oração ou práticas espirituais`,
        },
        {
          role: "user",
          content: answersText,
        },
      ],
      max_tokens: 500,
    });

    const consensus =
      response.choices[0]?.message?.content?.trim() ?? "";

    if (consensus) {
      await ctx.runMutation(internal.questions.saveConsensus, {
        questionId,
        consensusResponse: consensus,
      });
    }
  },
});
