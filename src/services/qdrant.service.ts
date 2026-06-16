import { QdrantClient } from "@qdrant/js-client-rest";
import { randomUUID } from "crypto";
import { env } from "../config/env.js";
import type { DocumentChunk } from "../types/chunk.types.js";

const VECTOR_SIZE = 1536;

export const qdrantClient = new QdrantClient({
  url: env.QDRANT_URL
});

export async function ensureCollection() {
  const collections = await qdrantClient.getCollections();

  const exists = collections.collections.some(
    (collection) => collection.name === env.QDRANT_COLLECTION
  );

  if (!exists) {
    await qdrantClient.createCollection(env.QDRANT_COLLECTION, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine"
      }
    });
  }
}

export async function upsertChunksToQdrant(
  chunks: DocumentChunk[],
  vectors: number[][]
) {
  await ensureCollection();

  const points = chunks.map((chunk, index) => ({
    id: randomUUID(),
    vector: vectors[index],
    payload: {
      documentId: chunk.documentId,
      chunkId: chunk.chunkId,
      text: chunk.text,
      pageNumbers: chunk.pageNumbers,
      sourceBlocks: chunk.sourceBlocks,
      boundingBoxes: chunk.boundingBoxes ?? [],
      metadata: chunk.metadata ?? {}
    }
  }));

  await qdrantClient.upsert(env.QDRANT_COLLECTION, {
    wait: true,
    points
  });

  return points.length;
}

export async function searchQdrant(
  queryVector: number[],
  topK: number,
  documentIds?: string[]
) {
  await ensureCollection();

  return qdrantClient.search(env.QDRANT_COLLECTION, {
    vector: queryVector,
    limit: topK,
    with_payload: true,
    filter: documentIds?.length
      ? {
          must: [
            {
              key: "documentId",
              match: {
                any: documentIds
              }
            }
          ]
        }
      : undefined
  });
}

export async function deleteDocumentVectors(documentId: string) {
  await ensureCollection();

  await qdrantClient.delete(env.QDRANT_COLLECTION, {
    wait: true,
    filter: {
      must: [
        {
          key: "documentId",
          match: {
            value: documentId
          }
        }
      ]
    }
  });
}
