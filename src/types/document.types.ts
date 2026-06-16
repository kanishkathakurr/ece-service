export type DocumentStatus = "uploaded" | "indexing" | "indexed" | "failed";

export type StoredDocument = {
  documentId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
};
