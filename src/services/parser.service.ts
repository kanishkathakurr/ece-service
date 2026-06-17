import fs from "fs/promises";
import { LiteParse } from "@llamaindex/liteparse";
import type { StoredDocument } from "../types/document.types.js";
import type { ParsedBlock } from "../types/parsed-block.types.js";

function isTextFile(fileType: string, fileName: string) {
  return fileType === "text/plain" || fileName.toLowerCase().endsWith(".txt");
}

async function parseTextFile(document: StoredDocument): Promise<ParsedBlock[]> {
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
        parser: "text-parser",
        fileName: document.fileName,
        fileType: document.fileType
      }
    }));
}

async function parseWithLiteParse(document: StoredDocument): Promise<ParsedBlock[]> {
  const parser = new LiteParse({
    outputFormat: "json",
    ocrEnabled: true,
    quiet: true
  });

  const result = await parser.parse(document.storagePath);
  const blocks: ParsedBlock[] = [];

  for (const page of result.pages) {
    for (let index = 0; index < page.textItems.length; index++) {
      const item = page.textItems[index];

      if (!item.text.trim()) continue;

      blocks.push({
        documentId: document.documentId,
        pageNumber: page.pageNum,
        blockId: `page_${page.pageNum}_block_${index + 1}`,
        text: item.text.trim(),
        boundingBox: {
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height
        },
        metadata: {
          parser: "liteparse",
          fileName: document.fileName,
          fileType: document.fileType,
          pageWidth: page.width,
          pageHeight: page.height,
          fontName: item.fontName,
          fontSize: item.fontSize,
          confidence: item.confidence
        }
      });
    }
  }

  return blocks;
}

export async function parseDocument(document: StoredDocument): Promise<ParsedBlock[]> {
  if (isTextFile(document.fileType, document.fileName)) {
    return parseTextFile(document);
  }

  return parseWithLiteParse(document);
}
