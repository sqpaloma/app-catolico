"use node";

import OpenAI from "openai";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_ANSWERS = 10;
const RAG_LIMIT = 5;

const VALID_THEMES = [
  "ansiedade",
  "pecado",
  "oracao",
  "sofrimento",
  "vocacao",
  "fe",
  "culpa",
  "consolo",
  "descanso",
  "confianca",
  "paz",
  "perseveranca",
  "amor",
  "paciencia",
  "penitencia",
  "consciencia",
  "liberdade",
  "humildade",
] as const;

async function detectThemes(question: string): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Classifique esta pergunta em até 3 temas espirituais.
Temas possíveis: ${VALID_THEMES.join(", ")}.
Retorne APENAS um array JSON de strings, sem explicações. Exemplo: ["ansiedade", "oracao", "paz"]`,
      },
      { role: "user", content: question },
    ],
    max_tokens: 100,
    temperature: 0,
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? "[]";
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter(
          (t): t is string =>
            typeof t === "string" &&
            VALID_THEMES.includes(t as (typeof VALID_THEMES)[number]),
        )
        .slice(0, 3);
    }
  } catch {
    // fallback: empty themes
  }
  return [];
}

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
    const question = await ctx.runQuery(internal.questions.getByIdInternal, {
      questionId,
    });
    if (!question) return;

    const answers = await ctx.runQuery(internal.answers.listByQuestion, {
      questionId,
    });
    if (answers.length < 3) return;

    const limitedAnswers = answers.slice(0, MAX_ANSWERS);
    const questionText = question.normalizedText || question.originalText;

    // --- Step 1: Detect spiritual themes ---
    const detectedThemes = await detectThemes(questionText);

    // --- Step 2: Format human answers ---
    const answersText = limitedAnswers
      .map(
        (a: { text: string; role?: string }, i: number) =>
          `Resposta ${i + 1}${a.role ? ` (${a.role})` : ""}: ${a.text}`,
      )
      .join("\n\n");

    // --- Step 3: Search RAG with theme-aware hybrid search ---
    const { text: doctrinalContext } = await ctx.runAction(
      internal.documents.searchDocuments,
      {
        query: questionText,
        limit: RAG_LIMIT,
        detectedThemes,
      },
    );

    const contextBlock =
      doctrinalContext && doctrinalContext.trim().length > 0
        ? doctrinalContext
        : "Nenhum contexto doutrinário encontrado no banco de dados.";

    // --- Step 4: Generate final spiritual guidance ---
    const consensusResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um confessor católico experiente, fiel ao magistério da Igreja Católica Apostólica Romana. A pessoa está confessando algo — um pecado, uma fraqueza, uma falta de fé, uma angústia. Todo sofrimento, ansiedade, gula, ou falta de confiança é, no fundo, uma forma de afastamento de Deus e falta de fé.

Sua função é:
- Ler as respostas dos diretores espirituais e extrair as AÇÕES CONCRETAS E ESPECÍFICAS que eles recomendaram
- Falar diretamente com o penitente como um confessor amoroso, mas firme
- Prescrever ações práticas de penitência e busca a Deus, baseadas no que os diretores sugeriram
- Fundamentar tudo na doutrina católica

REGRAS OBRIGATÓRIAS:
- NÃO comece com "Consenso" ou qualquer rótulo. Escreva como se fosse o confessor falando diretamente ao penitente.
- SEJA ESPECÍFICO: Se os diretores disseram "reze 5 Ave Marias", "leia o Salmo 100", "vá à missa", USE essas sugestões concretas. NÃO generalize dizendo apenas "ore mais" ou "busque Deus".
- FOQUE EM AÇÕES: orações específicas (com quantidade), leituras bíblicas específicas (com capítulo e versículo), devoções específicas, participação em sacramentos (confissão, missa, adoração), obras de caridade concretas.
- NUNCA contradiga a doutrina católica
- NÃO invente citações — use APENAS as fontes do contexto doutrinário fornecido
- Se os diretores divergirem, combine as melhores sugestões de cada um

Também avalie o NÍVEL DE CONCORDÂNCIA entre os diretores (0 a 100):
- 90-100: Todos concordam nas mesmas ações
- 70-89: Concordam no essencial, pequenas variações
- 50-69: Algumas divergências mas direção similar
- Abaixo de 50: Divergências significativas

Formato OBRIGATÓRIO (siga EXATAMENTE):

[CONFIANCA:XX%]

[Texto direto ao penitente, pastoral e acolhedor, mas com ações CONCRETAS e ESPECÍFICAS extraídas das respostas dos diretores. Fale como confessor. Prescreva penitências e ações claras para a pessoa buscar Deus e se redimir.]

[Referência bíblica] — [Trecho do contexto fornecido]
[Referência do Catecismo] — [Trecho do contexto fornecido]
[Referência de santo] — [Trecho do contexto fornecido]`,
        },
        {
          role: "user",
          content: `CONFISSÃO DO PENITENTE:\n${questionText}\n\nTEMAS DETECTADOS: ${detectedThemes.join(", ") || "nenhum"}\n\nRESPOSTAS DOS DIRETORES ESPIRITUAIS:\n${answersText}\n\nCONTEXTO DOUTRINÁRIO:\n${contextBlock}`,
        },
      ],
      max_tokens: 1000,
    });

    const rawConsensus =
      consensusResponse.choices[0]?.message?.content?.trim() ?? "";

    if (rawConsensus) {
      const confidenceMatch = rawConsensus.match(/\[CONFIANCA:(\d+)%\]/);
      const confidenceScore = confidenceMatch
        ? Math.min(100, Math.max(0, parseInt(confidenceMatch[1], 10)))
        : null;
      const cleanedText = rawConsensus
        .replace(/\[CONFIANCA:\d+%\]\s*/, "")
        .trim();

      await ctx.runMutation(internal.questions.saveConsensus, {
        questionId,
        consensusResponse: cleanedText,
        confidenceScore: confidenceScore ?? undefined,
      });
    }
  },
});
