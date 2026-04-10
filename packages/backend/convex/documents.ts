"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { rag } from "./rag";

const NAMESPACE = "doctrina";

type DocType = "biblia" | "catecismo" | "santo";

const IMPORTANCE_BY_TYPE: Record<DocType, number> = {
  biblia: 1.0,
  catecismo: 0.9,
  santo: 0.8,
};

export const ingestDocument = internalAction({
  args: {
    content: v.string(),
    type: v.union(
      v.literal("biblia"),
      v.literal("catecismo"),
      v.literal("santo"),
    ),
    reference: v.string(),
    themes: v.array(v.string()),
  },
  handler: async (ctx, { content, type, reference, themes }) => {
    await rag.add(ctx, {
      namespace: NAMESPACE,
      key: reference,
      text: `${content} — ${reference}`,
      title: reference,
      importance: IMPORTANCE_BY_TYPE[type],
      metadata: { type, themes },
      filterValues: [{ name: "type", value: type }],
    });
  },
});

export const searchDocuments = internalAction({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    detectedThemes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { query, limit, detectedThemes }) => {
    const fetchLimit = (limit ?? 5) * 2;
    const { results, entries } = await rag.search(ctx, {
      namespace: NAMESPACE,
      query,
      limit: fetchLimit,
      searchType: "hybrid",
      vectorWeight: 2,
      textWeight: 1,
    });

    const themes = detectedThemes ?? [];

    const scored = entries.map((entry) => {
      const entryMeta = (entry.metadata ?? {}) as {
        type?: string;
        themes?: string[];
      };
      const entryType = (entryMeta.type ?? "santo") as DocType;
      const entryThemes: string[] = entryMeta.themes ?? [];

      const matchingResult = results.find(
        (r) => r.entryId === entry.entryId,
      );
      const ragScore = matchingResult?.score ?? 0;

      const typePriority = IMPORTANCE_BY_TYPE[entryType] ?? 0.8;

      const hasThemeMatch =
        themes.length > 0 &&
        entryThemes.some((t) => themes.includes(t));
      const themeMatchBonus = hasThemeMatch ? 1.0 : 0.0;

      const finalScore =
        ragScore * 0.7 + typePriority * 0.2 + themeMatchBonus * 0.1;

      return { entry, finalScore };
    });

    scored.sort((a, b) => b.finalScore - a.finalScore);
    const top = scored.slice(0, limit ?? 5);

    const formattedText = top
      .map((s) => {
        const meta = (s.entry.metadata ?? {}) as {
          type?: string;
          themes?: string[];
        };
        const docType = meta.type ?? "documento";
        const title = s.entry.title ?? "";
        const text = s.entry.text ?? "";
        return `[${docType}] ${title}\n${text}`;
      })
      .join("\n\n");

    return {
      results: top.map((s) => ({
        entry: s.entry,
        score: s.finalScore,
      })),
      text: formattedText,
    };
  },
});

interface SeedDoc {
  content: string;
  type: DocType;
  reference: string;
  themes: string[];
}

const SEED_DOCUMENTS: SeedDoc[] = [
  // --- Bíblia ---
  {
    type: "biblia",
    reference: "Mateus 11:28-30",
    content:
      "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei. Tomai sobre vós o meu jugo e aprendei de mim, porque sou manso e humilde de coração, e encontrareis descanso para as vossas almas. Porque o meu jugo é suave e o meu fardo é leve.",
    themes: ["cansaco", "consolo", "descanso", "sofrimento", "humildade"],
  },
  {
    type: "biblia",
    reference: "Salmo 23:1-4",
    content:
      "O Senhor é o meu pastor; nada me faltará. Ele me faz repousar em pastos verdejantes. Leva-me para junto das águas de descanso; refrigera-me a alma. Guia-me pelas veredas da justiça por amor do seu nome. Ainda que eu ande pelo vale da sombra da morte, não temerei mal nenhum, porque tu estás comigo; o teu bordão e o teu cajado me consolam.",
    themes: ["confianca", "consolo", "descanso", "fe", "sofrimento"],
  },
  {
    type: "biblia",
    reference: "Romanos 8:28",
    content:
      "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.",
    themes: ["confianca", "fe", "vocacao", "sofrimento"],
  },
  {
    type: "biblia",
    reference: "Filipenses 4:6-7",
    content:
      "Não andeis ansiosos por coisa alguma; antes, em tudo, sejam os vossos pedidos conhecidos diante de Deus pela oração e súplica, com ações de graças. E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus.",
    themes: ["ansiedade", "oracao", "paz", "confianca"],
  },
  {
    type: "biblia",
    reference: "Isaías 41:10",
    content:
      "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a minha destra fiel.",
    themes: ["ansiedade", "confianca", "fe", "sofrimento"],
  },
  {
    type: "biblia",
    reference: "João 14:27",
    content:
      "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.",
    themes: ["paz", "ansiedade", "consolo"],
  },
  {
    type: "biblia",
    reference: "Tiago 1:2-4",
    content:
      "Meus irmãos, tende por motivo de toda alegria o passardes por várias provações, sabendo que a provação da vossa fé, uma vez confirmada, produz perseverança. Ora, a perseverança deve ter ação completa, para que sejais perfeitos e íntegros, em nada deficientes.",
    themes: ["perseveranca", "sofrimento", "fe", "paciencia"],
  },
  // --- Catecismo ---
  {
    type: "catecismo",
    reference: "CIC 1422",
    content:
      "Os que se aproximam do sacramento da Penitência obtêm da misericórdia de Deus o perdão da ofensa a Ele feita e ao mesmo tempo são reconciliados com a Igreja que feriram pecando, e a qual trabalha para a sua conversão com a caridade, o exemplo e a oração.",
    themes: ["penitencia", "pecado", "culpa", "oracao"],
  },
  {
    type: "catecismo",
    reference: "CIC 1458",
    content:
      "Sem ser estritamente necessária, a confissão das faltas cotidianas (pecados veniais) é vivamente recomendada pela Igreja. Com efeito, a confissão regular dos pecados veniais ajuda-nos a formar a consciência, a lutar contra as más inclinações, a deixar-nos curar por Cristo e a progredir na vida do Espírito.",
    themes: ["penitencia", "pecado", "consciencia", "culpa"],
  },
  {
    type: "catecismo",
    reference: "CIC 2558",
    content:
      "A oração é a elevação da alma a Deus ou o pedido a Deus dos bens convenientes. De onde falamos nós, quando oramos? Da altura da nossa soberba e da nossa vontade própria, ou das profundezas de um coração humilde e contrito? É aquele que se humilha que é exaltado. A humildade é a base da oração.",
    themes: ["oracao", "humildade", "fe"],
  },
  {
    type: "catecismo",
    reference: "CIC 1731",
    content:
      "A liberdade é o poder, baseado na razão e na vontade, de agir ou não agir, de fazer isto ou aquilo, de praticar por si mesmo ações deliberadas. Pelo livre-arbítrio, cada um dispõe de si mesmo. A liberdade é no homem uma força de crescimento e de amadurecimento na verdade e na bondade.",
    themes: ["liberdade", "consciencia", "vocacao"],
  },
  {
    type: "catecismo",
    reference: "CIC 2563",
    content:
      "O coração é a morada onde estou, onde habito. É o nosso centro escondido, inapreensível nem pela nossa razão nem por outrem; só o Espírito de Deus pode sondá-lo e conhecê-lo. É o lugar da decisão, no mais profundo das nossas tendências psíquicas. É o lugar da verdade, onde escolhemos a vida ou a morte.",
    themes: ["oracao", "fe", "consciencia", "vocacao"],
  },
  // --- Santos ---
  {
    type: "santo",
    reference: "Santo Agostinho, Confissões",
    content:
      "Fizeste-nos para Ti, Senhor, e inquieto está o nosso coração enquanto não repousar em Ti. Tarde Te amei, ó Beleza tão antiga e tão nova, tarde Te amei!",
    themes: ["ansiedade", "descanso", "amor", "fe"],
  },
  {
    type: "santo",
    reference: "Santa Teresa de Ávila",
    content:
      "Nada te perturbe, nada te espante. Tudo passa. Deus não muda. A paciência tudo alcança. Quem tem Deus nada lhe falta. Só Deus basta.",
    themes: ["ansiedade", "paz", "confianca", "paciencia", "fe"],
  },
  {
    type: "santo",
    reference: "São João da Cruz, Subida do Monte Carmelo",
    content:
      "No entardecer da vida, seremos julgados pelo amor. Para chegar ao que não sabes, deves ir por onde não sabes. Na noite escura da alma, Deus purifica e ilumina aqueles que Ele ama.",
    themes: ["sofrimento", "amor", "fe", "perseveranca"],
  },
  {
    type: "santo",
    reference: "São Francisco de Sales, Introdução à Vida Devota",
    content:
      "Não tenhas pressa em nada. Deus age com suavidade em tudo. Sê paciente contigo mesmo, acima de tudo, e não te deixes perturbar pela consciência de tuas imperfeições. Levanta-te sempre com paciência quando caíres, porque Deus te estende a mão.",
    themes: ["paciencia", "culpa", "consolo", "humildade", "perseveranca"],
  },
  {
    type: "santo",
    reference: "Santa Teresinha do Menino Jesus",
    content:
      "A minha vocação é o amor! Sim, encontrei o meu lugar na Igreja: no coração da Igreja, minha Mãe, eu serei o amor. Não é preciso fazer grandes coisas; o que conta é o amor com que se fazem as pequenas coisas do dia a dia.",
    themes: ["vocacao", "amor", "humildade"],
  },
  {
    type: "santo",
    reference: "São Padre Pio",
    content:
      "Ore, espere e não se preocupe. A preocupação é inútil. Deus é misericordioso e ouvirá a sua oração. A oração é a melhor arma que possuímos; é uma chave que abre o coração de Deus.",
    themes: ["oracao", "ansiedade", "confianca", "paz"],
  },
];

export const addDocumentBatch = internalAction({
  args: {
    docs: v.array(
      v.object({
        content: v.string(),
        type: v.union(
          v.literal("biblia"),
          v.literal("catecismo"),
          v.literal("santo"),
        ),
        reference: v.string(),
        themes: v.array(v.string()),
      }),
    ),
  },
  handler: async (ctx, { docs }) => {
    for (const doc of docs) {
      await rag.add(ctx, {
        namespace: NAMESPACE,
        key: doc.reference,
        text: `${doc.content} — ${doc.reference}`,
        title: doc.reference,
        importance: IMPORTANCE_BY_TYPE[doc.type],
        metadata: { type: doc.type, themes: doc.themes },
        filterValues: [{ name: "type", value: doc.type }],
      });
    }
    return { ingested: docs.length };
  },
});

export const seedDocuments = internalAction({
  handler: async (ctx) => {
    for (const doc of SEED_DOCUMENTS) {
      await rag.add(ctx, {
        namespace: NAMESPACE,
        key: doc.reference,
        text: `${doc.content} — ${doc.reference}`,
        title: doc.reference,
        importance: IMPORTANCE_BY_TYPE[doc.type],
        metadata: { type: doc.type, themes: doc.themes },
        filterValues: [{ name: "type", value: doc.type }],
      });
    }
    return { seeded: SEED_DOCUMENTS.length };
  },
});
