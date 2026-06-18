// GroIntel AI Core v2 - Mock Embedding Provider
// Deterministic embeddings for testing. Simple hash-based vector generation.

import { EmbeddingProvider } from "./provider";
import { AI_CONFIG } from "../config";

const DIMENSION = AI_CONFIG.EMBEDDING_DIMENSION;

export class MockEmbeddingProvider implements EmbeddingProvider {
  readonly name = "mock";

  async generateEmbedding(text: string): Promise<number[]> {
    const vector = new Array(DIMENSION).fill(0);
    for (let i = 0; i < text.length; i++) {
      vector[i % DIMENSION] += text.charCodeAt(i) / 255;
    }
    return this.normalize(vector);
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.generateEmbedding(t)));
  }

  similarity(vectorA: number[], vectorB: number[]): number {
    const dot = vectorA.reduce((sum, v, i) => sum + v * (vectorB[i] || 0), 0);
    return Math.round(dot * 100) / 100;
  }

  private normalize(v: number[]): number[] {
    const norm = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0)) || 1;
    return v.map((x) => x / norm);
  }
}
