import { embedMany, embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { env } from "../config/env.js";

export async function generateEmbeddings(texts: string[]) {
  const result = await embedMany({
    model: openai.embedding(env.EMBEDDING_MODEL),
    values: texts
  });

  return result.embeddings;
}

export async function generateEmbedding(text: string) {
  const result = await embed({
    model: openai.embedding(env.EMBEDDING_MODEL),
    value: text
  });

  return result.embedding;
}
