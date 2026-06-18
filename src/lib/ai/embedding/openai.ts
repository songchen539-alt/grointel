// GroIntel AI Core v4 - OpenAI Embedding Provider
// Real embedding provider using OpenAI's text-embedding-3-small API.
// No SDK dependency. Uses fetch with timeout and graceful fallback.

import { EmbeddingProvider } from "./provider";
import { MockEmbeddingProvider } from "./mock";
import { AI_CONFIG } from "../config";

const MOCK = new MockEmbeddingProvider();

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly name = "openai";

  private apiKey: string;
  private model: string;
  private baseUrl = "https://api.openai.com/v1/embeddings";

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
    this.model = AI_CONFIG.EMBEDDING_MODEL;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0 && this.apiKey.startsWith("sk-");
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const result = await this.callAPI([text]);
    return result[0] || [];
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const batches = this.chunk(texts, AI_CONFIG.EMBEDDING_BATCH_SIZE);
    const results: number[][] = [];
    for (const batch of batches) {
      const embeddings = await this.callAPI(batch);
      results.push(...embeddings);
    }
    return results;
  }

  similarity(vectorA: number[], vectorB: number[]): number {
    if (!this.isConfigured() || vectorA.length === 0 || vectorB.length === 0) {
      return MOCK.similarity(vectorA, vectorB);
    }
    const dot = vectorA.reduce((sum, v, i) => sum + v * (vectorB[i] || 0), 0);
    const magA = Math.sqrt(vectorA.reduce((sum, v) => sum + v * v, 0));
    const magB = Math.sqrt(vectorB.reduce((sum, v) => sum + v * v, 0));
    if (magA === 0 || magB === 0) return 0;
    return Math.round((dot / (magA * magB)) * 100) / 100;
  }

  private async callAPI(texts: string[]): Promise<number[][]> {
    if (!this.isConfigured()) {
      return Promise.all(texts.map((t) => MOCK.generateEmbedding(t)));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_CONFIG.EMBEDDING_TIMEOUT_MS);

    try {
      const res = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + this.apiKey,
        },
        body: JSON.stringify({
          model: this.model,
          input: texts,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        console.warn("[OpenAI Embedding] API error:", res.status);
        return Promise.all(texts.map((t) => MOCK.generateEmbedding(t)));
      }

      const data = await res.json();
      if (!data.data) {
        return Promise.all(texts.map((t) => MOCK.generateEmbedding(t)));
      }

      return data.data
        .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
        .map((item: { embedding?: number[] }) => item.embedding || []);
    } catch (err) {
      clearTimeout(timeout);
      console.warn("[OpenAI Embedding] Request failed, falling back to mock:", err);
      return Promise.all(texts.map((t) => MOCK.generateEmbedding(t)));
    }
  }

  private chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }
}
