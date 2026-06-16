import type { StoredDocument } from "../types/document.types.js";

const documents = new Map<string, StoredDocument>();

export function saveDocument(document: StoredDocument) {
  documents.set(document.documentId, document);
  return document;
}

export function getDocument(documentId: string) {
  return documents.get(documentId);
}

export function updateDocumentStatus(
  documentId: string,
  status: StoredDocument["status"]
) {
  const document = documents.get(documentId);

  if (!document) {
    return undefined;
  }

  document.status = status;
  document.updatedAt = new Date().toISOString();

  documents.set(documentId, document);

  return document;
}
