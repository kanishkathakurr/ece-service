import type { DocumentChunk } from "../types/chunk.types.js";

const documentChunks = new Map<string, DocumentChunk[]>();

export function saveChunksForDocument(documentId: string, chunks: DocumentChunk[]) {
  documentChunks.set(documentId, chunks);
}

export function getChunksForDocument(documentId: string) {
  return documentChunks.get(documentId) ?? [];
}
