export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ParsedBlock = {
  documentId: string;
  pageNumber: number;
  blockId: string;
  text: string;
  boundingBox?: BoundingBox;
  metadata?: Record<string, unknown>;
};
