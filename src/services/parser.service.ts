import fs from "fs/promises";
import type { StoredDocument } from "../types/document.types.js";
import type { ParsedBlock } from "../types/parsed-block.types.js";

export async function parseDocument(document: StoredDocument): Promise<ParsedBlock[]> {
  const content = await fs.readFile(document.storagePath, "utf-8");

  return content
    .split(/\n+/)
    .filter(Boolean)
    .map((text, index) => ({
      documentId: document.documentId,
      pageNumber: 1,
      blockId: `block_${index + 1}`,
      text,
      metadata: {
        parser: "text-parser"
      }
    }));
}
