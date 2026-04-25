"use node";

import OpenAI from "openai";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_ANSWERS = 10;
const RAG_LIMIT = 5;

type DirectorRole = "leigo" | "diretor" | "padre";

type LimitedAnswer = {
  text: string;
  role?: DirectorRole;
};

type ResponsePattern = {
  representativeText: string;
  confidenceScore: number;
  matchingAnswerCount: number;
  totalAnswerCount: number;
};

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractJsonPayload(raw: string): string {
  const trimmed = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return trimmed;
  }

  const firstObject = trimmed.indexOf("{");
  const lastObject = trimmed.lastIndexOf("}");
  if (firstObject >= 0 && lastObject > firstObject) {
    return trimmed.slice(firstObject, lastObject + 1);
  }

  const firstArray = trimmed.indexOf("[");
  const lastArray = trimmed.lastIndexOf("]");
  if (firstArray >= 0 && lastArray > firstArray) {
    return trimmed.slice(firstArray, lastArray + 1);
  }

  return trimmed;
}

function readNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "number") return item;
      if (typeof item === "string") return Number(item);
      return Number.NaN;
    })
    .filter(Number.isInteger);
}

function readRawGroups(payload: unknown): number[][] {
  const groupsValue = isRecord(payload) ? payload.groups : payload;
  if (!Array.isArray(groupsValue)) return [];

  const groups: number[][] = [];
  for (const group of groupsValue) {
    if (Array.isArray(group)) {
      groups.push(readNumberArray(group));
      continue;
    }

    if (isRecord(group)) {
      const answerNumbers =
        group.answerNumbers ?? group.answers ?? group.indices;
      groups.push(readNumberArray(answerNumbers));
    }
  }

  return groups.filter((group) => group.length > 0);
}

function parseAnswerGroups(raw: string, totalAnswers: number): number[][] {
  try {
    const parsed: unknown = JSON.parse(extractJsonPayload(raw));
    const rawGroups = readRawGroups(parsed);
    return normalizeAnswerGroups(rawGroups, totalAnswers);
  } catch {
    return buildFallbackGroups(totalAnswers);
  }
}

function buildFallbackGroups(totalAnswers: number): number[][] {
  return Array.from({ length: Math.min(3, totalAnswers) }, (_, index) => [
    index + 1,
  ]);
}

function normalizeAnswerGroups(
  rawGroups: number[][],
  totalAnswers: number,
): number[][] {
  const seenAnswers = new Set<number>();
  const normalizedGroups: number[][] = [];

  for (const rawGroup of rawGroups) {
    const uniqueGroup = [...new Set(rawGroup)]
      .filter((answerNumber) => answerNumber >= 1)
      .filter((answerNumber) => answerNumber <= totalAnswers)
      .filter((answerNumber) => !seenAnswers.has(answerNumber));

    if (uniqueGroup.length === 0) continue;

    for (const answerNumber of uniqueGroup) {
      seenAnswers.add(answerNumber);
    }
    normalizedGroups.push(uniqueGroup);
  }

  for (let answerNumber = 1; answerNumber <= totalAnswers; answerNumber += 1) {
    if (!seenAnswers.has(answerNumber)) {
      normalizedGroups.push([answerNumber]);
    }
  }

  return normalizedGroups
    .sort((left, right) => {
      if (right.length !== left.length) return right.length - left.length;
      return left[0] - right[0];
    })
    .slice(0, 3);
}

async function groupSimilarAnswers(
  answersText: string,
  totalAnswers: number,
): Promise<number[][]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Agrupe respostas de direção espiritual que tenham a mesma orientação prática principal.

Regras:
- Use APENAS os números das respostas fornecidas.
- Uma resposta só pode aparecer em um grupo.
- Retorne no máximo 3 grupos principais.
- Não resuma, não reescreva e não crie texto novo.
- Se duas respostas forem diferentes, deixe em grupos separados.
- Retorne APENAS JSON válido neste formato:
{"groups":[{"answerNumbers":[1,3]},{"answerNumbers":[2]}]}`,
      },
      { role: "user", content: answersText },
    ],
    max_tokens: 300,
    temperature: 0,
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? "";
  return parseAnswerGroups(raw, totalAnswers);
}

function buildResponsePatterns(
  answerGroups: number[][],
  answers: LimitedAnswer[],
): ResponsePattern[] {
  const totalAnswerCount = answers.length;

  return answerGroups
    .map((group) => {
      const representativeAnswer = answers[group[0] - 1];
      if (!representativeAnswer) return null;

      return {
        representativeText: representativeAnswer.text,
        confidenceScore: Math.round((group.length / totalAnswerCount) * 100),
        matchingAnswerCount: group.length,
        totalAnswerCount,
      };
    })
    .filter((pattern): pattern is ResponsePattern => pattern !== null);
}

async function generateSourceGuidance({
  questionText,
  detectedThemes,
  answersText,
  contextBlock,
}: {
  questionText: string;
  detectedThemes: string[];
  answersText: string;
  contextBlock: string;
}): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Você escreve uma orientação espiritual católica fundamentada nas fontes consultadas.

Regras obrigatórias:
- Não use as palavras "consenso", "concordância", "diretores" ou "confiabilidade".
- Não diga que a resposta veio de votação ou comparação de pessoas.
- Seja pastoral, simples e direto, em 2 a 4 parágrafos curtos.
- Explique como a pessoa pode seguir a orientação, com passos concretos quando eles estiverem presentes nas respostas recebidas.
- Fundamente a orientação na Bíblia, no Catecismo e em santos apenas quando essas fontes estiverem no contexto fornecido.
- Não invente citações nem referências.
- Evite frases genéricas e tom excessivamente conversacional.

Ao final, inclua até 3 linhas de fontes usando a referência real no começo da linha. Exemplos de formato:
Mateus 6,6 — [Trecho do contexto fornecido]
CIC 2729 — [Trecho do contexto fornecido]
São Francisco de Sales — [Trecho do contexto fornecido]`,
      },
      {
        role: "user",
        content: `PERGUNTA:\n${questionText}\n\nTEMAS DETECTADOS: ${detectedThemes.join(", ") || "nenhum"}\n\nORIENTAÇÕES RECEBIDAS:\n${answersText}\n\nFONTES CONSULTADAS:\n${contextBlock}`,
      },
    ],
    max_tokens: 800,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}

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
        (a: LimitedAnswer, i: number) =>
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

    // --- Step 4: Group similar human answers without rewriting them ---
    const answerGroups = await groupSimilarAnswers(
      answersText,
      limitedAnswers.length,
    );
    const responsePatterns = buildResponsePatterns(answerGroups, limitedAnswers);

    // --- Step 5: Generate source-grounded spiritual guidance ---
    const sourceGuidance = await generateSourceGuidance({
      questionText,
      detectedThemes,
      answersText,
      contextBlock,
    });

    if (sourceGuidance) {
      await ctx.runMutation(internal.questions.saveConsensus, {
        questionId,
        consensusResponse: sourceGuidance,
        confidenceScore: responsePatterns[0]?.confidenceScore,
        responsePatterns,
        sourceGuidance,
      });
    }
  },
});
