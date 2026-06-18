// GroIntel AI Core v4 - Central Configuration

export const AI_CONFIG = {
  RULE_WEIGHT: 0.80,
  EMBEDDING_WEIGHT: 0.20,
  MAX_RECOMMENDATIONS: 10,
  MIN_CONFIDENCE_HIGH: 60,
  MIN_CONFIDENCE_MEDIUM: 30,
  DEFAULT_SIMILARITY_METRIC: "cosine" as SimilarityMetric,
  EMBEDDING_PROVIDER: (process.env.EMBEDDING_PROVIDER || "mock") as string,
  EMBEDDING_MODEL: (process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small") as string,
  EMBEDDING_TIMEOUT_MS: 8000,
  EMBEDDING_BATCH_SIZE: 50,
  FALLBACK_TO_MOCK: true,
  LEARNING_ENABLED: false,
  MIN_HISTORY_FOR_LEARNING: 10,
  DEFAULT_LEARNING_RATE: 0.01,
};

export type SimilarityMetric = "cosine" | "dot" | "euclidean";

export function getConfig(overrides?: Partial<typeof AI_CONFIG>): typeof AI_CONFIG {
  return { ...AI_CONFIG, ...overrides };
}

export function getEmbeddingProviderName(): string {
  return AI_CONFIG.EMBEDDING_PROVIDER || "mock";
}
