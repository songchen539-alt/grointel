// GroIntel AI Core - Mock Embedding Provider
// Deterministic embeddings for testing the AI pipeline.
// Returns simple hash-based vectors for similarity computation.

import { EmbeddingProvider } from "./provider";

const MOCK_DIMENSION = 8;

export class MockEmbeddingProvider implements EmbeddingProvider {
  name = "mock";

  async generateEmbedding(text: string): Promise<number[]> {
    const vector = new Array(MOCK_DIMENSION).fill(0);
    for (let i = 0; i < text.length; i++) {
      vector[i % MOCK_DIMENSION] += text.charCodeAt(i) / 255;
    }
    // Normalize
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map((v) => v / norm);
  }

  similarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, v, i) => sum + v * (b[i] || 0), 0);
    return Math.round(dot * 100) / 100;
  }
}
