import type { ParsedBlock } from "../types/parsed-block.types.js";
import type { DocumentChunk } from "../types/chunk.types.js";

export function chunkParsedBlocks(
  documentId: string,
  blocks: ParsedBlock[],
  chunkSize = 500,
  overlap = 50
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  let buffer = "";
  let sourceBlocks: string[] = [];
  let pageNumbers = new Set<number>();
  let boundingBoxes: NonNullable<DocumentChunk["boundingBoxes"]> = [];

  for (const block of blocks) {
    const nextText = buffer ? `${buffer}\n${block.text}` : block.text;

    if (nextText.length > chunkSize && buffer.length > 0) {
      chunks.push({
        chunkId: `chunk_${documentId}_${chunks.length + 1}`,
        documentId,
        text: buffer,
        pageNumbers: Array.from(pageNumbers),
        sourceBlocks,
        boundingBoxes,
        metadata: {
          chunkSize,
          overlap
        }
      });

      buffer = buffer.slice(-overlap) + "\n" + block.text;
      sourceBlocks = [block.blockId];
      pageNumbers = new Set([block.pageNumber]);
      boundingBoxes = block.boundingBox
        ? [
            {
              pageNumber: block.pageNumber,
              ...block.boundingBox
            }
          ]
        : [];
    } else {
      buffer = nextText;
      sourceBlocks.push(block.blockId);
      pageNumbers.add(block.pageNumber);

      if (block.boundingBox) {
        boundingBoxes.push({
          pageNumber: block.pageNumber,
          ...block.boundingBox
        });
      }
    }
  }

  if (buffer.trim()) {
    chunks.push({
      chunkId: `chunk_${documentId}_${chunks.length + 1}`,
      documentId,
      text: buffer,
      pageNumbers: Array.from(pageNumbers),
      sourceBlocks,
      boundingBoxes,
      metadata: {
        chunkSize,
        overlap
      }
    });
  }

  return chunks;
}
