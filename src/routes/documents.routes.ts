import { Router } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { env } from "../config/env.js";

import {
  saveChunksForDocument,
  getChunksForDocument
} from "../services/chunk-store.service.js";

import {
  getDocument,
  saveDocument,
  updateDocumentStatus
} from "../services/document-registry.service.js";

import { parseDocument } from "../services/parser.service.js";
import { chunkParsedBlocks } from "../services/chunker.service.js";
import { generateEmbeddings } from "../services/embedding.service.js";
import {
  upsertChunksToQdrant,
  deleteDocumentVectors
} from "../services/qdrant.service.js";

const storage = multer.diskStorage({
  destination: env.UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  }
});

const upload = multer({ storage });

export const documentsRouter = Router();

documentsRouter.post("/documents/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File is required" });
  }

  const now = new Date().toISOString();

  const document = saveDocument({
    documentId: `doc_${randomUUID()}`,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    storagePath: req.file.path,
    status: "uploaded",
    createdAt: now,
    updatedAt: now
  });

  return res.status(201).json(document);
});

documentsRouter.get("/documents/:documentId/status", (req, res) => {
  const document = getDocument(req.params.documentId);

  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  return res.json({
    documentId: document.documentId,
    fileName: document.fileName,
    status: document.status,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt
  });
});

documentsRouter.post("/documents/:documentId/index", async (req, res) => {
  const document = getDocument(req.params.documentId);

  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  try {
    updateDocumentStatus(document.documentId, "indexing");

    const parsedBlocks = await parseDocument(document);
    const chunks = chunkParsedBlocks(document.documentId, parsedBlocks);

    const embeddings = await generateEmbeddings(
      chunks.map((chunk) => chunk.text)
    );

    const vectorsStored = await upsertChunksToQdrant(chunks, embeddings);

    saveChunksForDocument(document.documentId, chunks);
    updateDocumentStatus(document.documentId, "indexed");

    return res.json({
      documentId: document.documentId,
      status: "indexed",
      pagesParsed: [...new Set(parsedBlocks.map((block) => block.pageNumber))].length,
      blocksParsed: parsedBlocks.length,
      chunksCreated: chunks.length,
      vectorsStored
    });
  } catch (error) {
    console.error("INDEXING ERROR:", error);

    updateDocumentStatus(document.documentId, "failed");

    return res.status(500).json({
      error: "Indexing failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

documentsRouter.get("/documents/:documentId/chunks", (req, res) => {
  const document = getDocument(req.params.documentId);

  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  return res.json({
    documentId: document.documentId,
    chunks: getChunksForDocument(document.documentId)
  });
});

documentsRouter.delete("/documents/:documentId", async (req, res) => {
  const document = getDocument(req.params.documentId);

  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  try {
    await deleteDocumentVectors(document.documentId);

    return res.json({
      documentId: document.documentId,
      status: "deleted",
      message: "Document vectors deleted from Qdrant"
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return res.status(500).json({
      error: "Delete failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
