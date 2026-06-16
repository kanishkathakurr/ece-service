import type { BoundingBox } from "./parsed-block.types.js";

export type DocumentChunk = {
  chunkId: string;
  documentId: string;
  text: string;
  pageNumbers: number[];
  sourceBlocks: string[];
  boundingBoxes?: Array<BoundingBox & { pageNumber: number }>;
  metadata?: Record<string, unknown>;
};
