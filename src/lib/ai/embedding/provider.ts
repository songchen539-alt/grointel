// GroIntel AI Core - Embedding Provider Interface
// Abstraction layer for embedding providers.
// Implementations: OpenAI, Voyage, Cohere, Jina, Local
// Current: Mock (returns deterministic vectors for testing)

export interface EmbeddingProvider {
  name: string;
  generateEmbedding(text: string): Promise<number[]>;
  similarity(a: number[], b: number[]): number;
}

export type EmbeddingProviderType = "mock" | "openai" | "voyage" | "cohere" | "jina" | "local";
