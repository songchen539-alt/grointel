// GroIntel AI Core v2 - Configuration
// Central configuration for matching weights, embedding, and learning parameters.

export const AI_CONFIG = {
  // Hybrid scoring weights
  RULE_WEIGHT: 0.80,
  EMBEDDING_WEIGHT: 0.20,

  // Recommendation limits
  MAX_RECOMMENDATIONS: 10,

  // Confidence thresholds
  MIN_CONFIDENCE_HIGH: 60,
  MIN_CONFIDENCE_MEDIUM: 30,

  // Similarity
  DEFAULT_SIMILARITY_METRIC: "cosine" as SimilarityMetric,

  // Embedding
  EMBEDDING_PROVIDER: "mock" as string,
  EMBEDDING_DIMENSION: 8,

  // Learning
  LEARNING_ENABLED: false,
  MIN_HISTORY_FOR_LEARNING: 10,
  DEFAULT_LEARNING_RATE: 0.01,
};

export type SimilarityMetric = "cosine" | "dot" | "euclidean";

export function getConfig(overrides?: Partial<typeof AI_CONFIG>): typeof AI_CONFIG {
  return { ...AI_CONFIG, ...overrides };
}
