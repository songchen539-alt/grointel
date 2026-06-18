// GroIntel AI Core v2 - Vector Types
// Shared types for embedding and vector operations.

export interface VectorDocument {
  id: string;
  type: VectorDocumentType;
  text: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
  source: string;
}

export type VectorDocumentType =
  | "growth_need"
  | "channel"
  | "service"
  | "case_study"
  | "company_mri"
  | "outreach"
  | "knowledge_base";

export interface VectorSearchResult {
  document: VectorDocument;
  score: number;
}

export interface EmbeddingBatch {
  texts: string[];
  embeddings: number[][];
}
