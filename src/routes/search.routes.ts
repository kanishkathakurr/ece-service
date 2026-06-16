import { Router } from "express";
import { z } from "zod";
import { generateEmbedding } from "../services/embedding.service.js";
import { searchQdrant } from "../services/qdrant.service.js";

export const searchRouter = Router();

const searchSchema = z.object({
  query: z.string().min(1),
  documentIds: z.array(z.string()).optional(),
  topK: z.number().int().positive().default(5),
  filters: z.record(z.string(), z.unknown()).optional()
});

searchRouter.post("/search", async (req, res) => {
  const parsed = searchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parsed.error.flatten()
    });
  }

  try {
    const { query, documentIds, topK } = parsed.data;

    const queryVector = await generateEmbedding(query);

    const qdrantResults = await searchQdrant(
      queryVector,
      topK,
      documentIds
    );

    const results = qdrantResults.map((item) => {
      const payload = item.payload as Record<string, any>;

      return {
        chunkId: payload.chunkId,
        documentId: payload.documentId,
        text: payload.text,
        score: item.score,
        pageNumbers: payload.pageNumbers ?? [],
        sourceBlocks: payload.sourceBlocks ?? [],
        boundingBoxes: payload.boundingBoxes ?? [],
        metadata: payload.metadata ?? {}
      };
    });

    return res.json({ results });
  } catch (error) {
    console.error("SEARCH ERROR:", error);

    return res.status(500).json({
      error: "Search failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
