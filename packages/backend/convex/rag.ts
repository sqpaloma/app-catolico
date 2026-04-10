import { components } from "./_generated/api";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";

type DocFilter = {
  type: "biblia" | "catecismo" | "santo";
};

export const rag = new RAG<DocFilter>(components.rag, {
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  embeddingDimension: 1536,
  filterNames: ["type"],
});
