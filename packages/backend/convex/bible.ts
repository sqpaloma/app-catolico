"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const BIBLE_URL =
  "https://raw.githubusercontent.com/maatheusgois/bible/main/versions/pt-br/arc.json";

const VERSES_PER_CHUNK = 3;
const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 5_000;

interface BibleBook {
  id: string;
  name: string;
  chapters: string[][];
}

const BOOK_THEMES: Record<string, string[]> = {
  // Pentateuco
  gn: ["fe", "confianca", "liberdade"],
  ex: ["fe", "confianca", "liberdade"],
  lv: ["fe", "confianca", "liberdade"],
  nm: ["fe", "confianca", "liberdade"],
  dt: ["fe", "confianca", "liberdade"],
  // Historicos
  js: ["fe", "confianca", "perseveranca"],
  jud: ["fe", "confianca", "perseveranca"],
  rt: ["fe", "confianca", "perseveranca"],
  "1sm": ["fe", "confianca", "perseveranca"],
  "2sm": ["fe", "confianca", "perseveranca"],
  "1kgs": ["fe", "confianca", "perseveranca"],
  "2kgs": ["fe", "confianca", "perseveranca"],
  "1ch": ["fe", "confianca", "perseveranca"],
  "2ch": ["fe", "confianca", "perseveranca"],
  ezr: ["fe", "confianca", "perseveranca"],
  ne: ["fe", "confianca", "perseveranca"],
  et: ["fe", "confianca", "perseveranca"],
  // Poeticos / Sabedoria
  job: ["sofrimento", "fe", "paciencia"],
  ps: ["oracao", "consolo", "paz"],
  prv: ["consciencia", "humildade", "paciencia"],
  ec: ["consciencia", "paz", "humildade"],
  so: ["amor", "paz"],
  // Profetas Maiores
  is: ["consolo", "fe", "confianca"],
  jr: ["sofrimento", "penitencia", "fe"],
  lm: ["sofrimento", "penitencia", "fe"],
  ez: ["penitencia", "fe"],
  dn: ["fe", "confianca", "perseveranca"],
  // Profetas Menores
  ho: ["penitencia", "fe", "confianca"],
  jl: ["penitencia", "fe", "confianca"],
  am: ["penitencia", "fe", "confianca"],
  ob: ["penitencia", "fe", "confianca"],
  jn: ["penitencia", "fe", "confianca"],
  mi: ["penitencia", "fe", "confianca"],
  na: ["penitencia", "fe", "confianca"],
  hk: ["penitencia", "fe", "confianca"],
  zp: ["penitencia", "fe", "confianca"],
  hg: ["penitencia", "fe", "confianca"],
  zc: ["penitencia", "fe", "confianca"],
  ml: ["penitencia", "fe", "confianca"],
  // Evangelhos
  mt: ["amor", "fe", "consolo", "humildade"],
  mk: ["amor", "fe", "consolo", "humildade"],
  lk: ["amor", "fe", "consolo", "humildade"],
  jo: ["amor", "fe", "consolo", "humildade"],
  // Atos
  act: ["fe", "vocacao", "perseveranca"],
  // Cartas Paulinas
  rm: ["fe", "amor", "paz", "perseveranca"],
  "1co": ["fe", "amor", "paz", "perseveranca"],
  "2co": ["fe", "amor", "paz", "perseveranca"],
  gl: ["fe", "amor", "paz", "perseveranca"],
  eph: ["fe", "amor", "paz", "perseveranca"],
  ph: ["fe", "amor", "paz", "perseveranca"],
  cl: ["fe", "amor", "paz", "perseveranca"],
  "1ts": ["fe", "amor", "paz", "perseveranca"],
  "2ts": ["fe", "amor", "paz", "perseveranca"],
  "1tm": ["fe", "amor", "paz", "perseveranca"],
  "2tm": ["fe", "amor", "paz", "perseveranca"],
  tt: ["fe", "amor", "paz", "perseveranca"],
  phm: ["fe", "amor", "paz", "perseveranca"],
  // Cartas Gerais
  hb: ["fe", "perseveranca", "humildade"],
  jm: ["fe", "perseveranca", "humildade"],
  "1pe": ["fe", "perseveranca", "humildade"],
  "2pe": ["fe", "perseveranca", "humildade"],
  "1jo": ["fe", "perseveranca", "humildade"],
  "2jo": ["fe", "perseveranca", "humildade"],
  "3jo": ["fe", "perseveranca", "humildade"],
  jd: ["fe", "perseveranca", "humildade"],
  // Apocalipse
  re: ["fe", "perseveranca", "confianca"],
};

function buildChunks(books: BibleBook[]) {
  const chunks: {
    content: string;
    type: "biblia";
    reference: string;
    themes: string[];
  }[] = [];

  for (const book of books) {
    const themes = BOOK_THEMES[book.id] ?? ["fe"];

    for (let ci = 0; ci < book.chapters.length; ci++) {
      const chapter = book.chapters[ci]!;
      const chapterNum = ci + 1;

      for (let vi = 0; vi < chapter.length; vi += VERSES_PER_CHUNK) {
        const verses = chapter.slice(vi, vi + VERSES_PER_CHUNK);
        const startVerse = vi + 1;
        const endVerse = vi + verses.length;

        const reference =
          startVerse === endVerse
            ? `${book.name} ${chapterNum}:${startVerse}`
            : `${book.name} ${chapterNum}:${startVerse}-${endVerse}`;

        const content = verses
          .map((v, i) => `${startVerse + i} ${v}`)
          .join(" ");

        chunks.push({ content, type: "biblia", reference, themes });
      }
    }
  }

  return chunks;
}

export const ingestBible = internalAction({
  args: { maxBooks: v.optional(v.number()) },
  handler: async (ctx, { maxBooks }) => {
    const res = await fetch(BIBLE_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch Bible JSON: ${res.status}`);
    }

    const books: BibleBook[] = await res.json();
    const selected = maxBooks ? books.slice(0, maxBooks) : books;
    const chunks = buildChunks(selected);
    const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);

    for (let i = 0; i < totalBatches; i++) {
      const batch = chunks.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      await ctx.scheduler.runAfter(
        i * BATCH_DELAY_MS,
        internal.documents.addDocumentBatch,
        { docs: batch },
      );
    }

    return {
      totalBooks: selected.length,
      totalChunks: chunks.length,
      totalBatches,
    };
  },
});
