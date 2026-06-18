// GroIntel AI Core v4 - Embedding Provider Factory
// Creates embedding provider based on configuration. Falls back to mock.

import { EmbeddingProvider } from "./provider";
import { MockEmbeddingProvider } from "./mock";
import { OpenAIEmbeddingProvider } from "./openai";

const MOCK = new MockEmbeddingProvider();

let openAIInstance: OpenAIEmbeddingProvider | null = null;

export function getEmbeddingProvider(): EmbeddingProvider {
  const providerName = process.env.EMBEDDING_PROVIDER || "mock";

  switch (providerName) {
    case "openai": {
      if (!openAIInstance) {
        openAIInstance = new OpenAIEmbeddingProvider();
      }
      return openAIInstance;
    }
    case "mock":
    default:
      return MOCK;
  }
}

export function getProviderMetadata(): { provider: string; model: string; fallbackUsed: boolean } {
  const providerName = process.env.EMBEDDING_PROVIDER || "mock";
  const fallbackUsed = providerName === "openai" && (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith("sk-"));

  return {
    provider: fallbackUsed ? "mock" : providerName,
    model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
    fallbackUsed,
  };
}
