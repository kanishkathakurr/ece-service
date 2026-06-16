import { Router } from "express";
import { z } from "zod";
import { getChunksForDocument } from "../services/chunk-store.service.js";

export const extractRouter = Router();

const extractSchema = z.object({
  documentId: z.string().min(1),
  schema: z.record(z.string(), z.string())
});

function normalizeFieldName(field: string) {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .toLowerCase()
    .trim();
}

function extractValueFromText(field: string, text: string) {
  const normalizedField = normalizeFieldName(field);
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  const matchingLine = lines.find((line) =>
    line.toLowerCase().includes(normalizedField)
  );

  if (!matchingLine) {
    return null;
  }

  const parts = matchingLine.split(":");

  if (parts.length > 1) {
    return parts.slice(1).join(":").trim();
  }

  return matchingLine;
}

extractRouter.post("/extract", (req, res) => {
  const parsed = extractSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parsed.error.flatten()
    });
  }

  const { documentId, schema } = parsed.data;
  const chunks = getChunksForDocument(documentId);

  if (!chunks.length) {
    return res.status(404).json({
      error: "No indexed chunks found for document"
    });
  }

  const fullText = chunks.map((chunk) => chunk.text).join("\n");

  const data: Record<string, unknown> = {};
  const sources: Array<{
    field: string;
    documentId: string;
    pageNumber: number;
    text: string;
    chunkId?: string;
  }> = [];

  for (const field of Object.keys(schema)) {
    const value = extractValueFromText(field, fullText);
    data[field] = value;

    if (value) {
      const sourceChunk = chunks.find((chunk) =>
        chunk.text.toLowerCase().includes(String(value).toLowerCase())
      );

      sources.push({
        field,
        documentId,
        pageNumber: sourceChunk?.pageNumbers?.[0] ?? 1,
        text: String(value),
        chunkId: sourceChunk?.chunkId
      });
    }
  }

  return res.json({
    data,
    sources
  });
});
