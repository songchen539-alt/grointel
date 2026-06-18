// GroIntel AI Core v2 - Provider Stubs
// Interface-only implementations for future AI embedding providers.
// No API keys, no external calls.

import { EmbeddingProvider } from "./provider";

export class OpenAIProvider implements EmbeddingProvider {
  readonly name = "openai";
  async generateEmbedding(_text: string): Promise<number[]> {
    throw new Error("OpenAI provider not configured. Set OPENAI_API_KEY and use text-embedding-3-small.");
  }
  async generateEmbeddings(_texts: string[]): Promise<number[][]> {
    throw new Error("OpenAI provider not configured.");
  }
  similarity(_a: number[], _b: number[]): number {
    throw new Error("OpenAI provider not configured.");
  }
}

export class VoyageProvider implements EmbeddingProvider {
  readonly name = "voyage";
  async generateEmbedding(_text: string): Promise<number[]> { throw new Error("Voyage not configured."); }
  async generateEmbeddings(_texts: string[]): Promise<number[][]> { throw new Error("Voyage not configured."); }
  similarity(_a: number[], _b: number[]): number { throw new Error("Voyage not configured."); }
}

export class CohereProvider implements EmbeddingProvider {
  readonly name = "cohere";
  async generateEmbedding(_text: string): Promise<number[]> { throw new Error("Cohere not configured."); }
  async generateEmbeddings(_texts: string[]): Promise<number[][]> { throw new Error("Cohere not configured."); }
  similarity(_a: number[], _b: number[]): number { throw new Error("Cohere not configured."); }
}

export class JinaProvider implements EmbeddingProvider {
  readonly name = "jina";
  async generateEmbedding(_text: string): Promise<number[]> { throw new Error("Jina not configured."); }
  async generateEmbeddings(_texts: string[]): Promise<number[][]> { throw new Error("Jina not configured."); }
  similarity(_a: number[], _b: number[]): number { throw new Error("Jina not configured."); }
}

export class LocalProvider implements EmbeddingProvider {
  readonly name = "local";
  async generateEmbedding(_text: string): Promise<number[]> {
    throw new Error("Local embedding provider not configured. Install all-MiniLM-L6-v2 via ONNX.");
  }
  async generateEmbeddings(_texts: string[]): Promise<number[][]> { throw new Error("Local not configured."); }
  similarity(_a: number[], _b: number[]): number { throw new Error("Local not configured."); }
}
