import { Router } from "express";
import { z } from "zod";
import { generateEmbeddings } from "../services/embedding.service.js";
import { searchQdrant } from "../services/qdrant.service.js";
import { generateAnswerWithOllama } from "../ai/providers/ollama.provider.js";

export const askRouter = Router();

const askSchema = z.object({
  question: z.string().min(1),
  documentIds: z.array(z.string()).optional(),
  topK: z.number().int().positive().default(5)
});

askRouter.post("/ask", async (req, res) => {
  const parsed = askSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parsed.error.flatten()
    });
  }

  const { question, documentIds, topK } = parsed.data;

  try {
    const [queryVector] = await generateEmbeddings([question]);
    const results = await searchQdrant(queryVector, topK, documentIds);

    const sources = results.map((item) => {
      const payload = item.payload as Record<string, any>;

      return {
        chunkId: payload.chunkId,
        documentId: payload.documentId,
        text: payload.text,
        score: item.score,
        pageNumbers: payload.pageNumbers ?? [],
        sourceBlocks: payload.sourceBlocks ?? [],
        boundingBoxes: payload.boundingBoxes ?? []
      };
    });

    const context = sources
      .map((source, index) => {
        return `[Source ${index + 1}]\n${source.text}`;
      })
      .join("\n\n");

    const answer = await generateAnswerWithOllama(question, context);

    return res.json({
      answer,
      sources
    });
  } catch (error) {
    return res.status(500).json({
      error: "Ask failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
