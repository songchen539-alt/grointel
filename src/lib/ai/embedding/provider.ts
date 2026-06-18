// GroIntel AI Core v2 - Embedding Provider Interface
// All embedding providers implement this interface.

export interface EmbeddingProvider {
  readonly name: string;
  generateEmbedding(text: string): Promise<number[]>;
  generateEmbeddings(texts: string[]): Promise<number[][]>;
  similarity(vectorA: number[], vectorB: number[]): number;
}
