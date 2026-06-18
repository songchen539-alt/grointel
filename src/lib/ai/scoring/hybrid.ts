// GroIntel AI Core v2 - Hybrid Scoring Engine
// Combines rule-based scoring with embedding similarity for improved recommendations.

import { AI_CONFIG } from "../config";
import { cosineSimilarity } from "../embedding/vector";
import { MockEmbeddingProvider } from "../embedding/mock";
import { ScoreBreakdown, Recommendation, Reason } from "../recommendation/types";

const provider = new MockEmbeddingProvider();

export interface HybridScoreInput {
  ruleScore: number;
  needText: string;
  channelText: string;
  ruleWeight?: number;
  embeddingWeight?: number;
}

export async function computeHybridScore(input: HybridScoreInput): Promise<{
  hybridScore: number;
  ruleScore: number;
  embeddingScore: number;
}> {
  const ruleWeight = input.ruleWeight ?? AI_CONFIG.RULE_WEIGHT;
  const embeddingWeight = input.embeddingWeight ?? AI_CONFIG.EMBEDDING_WEIGHT;

  const needEmbedding = await provider.generateEmbedding(input.needText);
  const channelEmbedding = await provider.generateEmbedding(input.channelText);
  const embeddingScore = cosineSimilarity(needEmbedding, channelEmbedding);

  // Normalize embedding score to 0-100
  const normalizedEmbedding = Math.round(((embeddingScore + 1) / 2) * 100);

  const hybridScore = Math.round(
    input.ruleScore * ruleWeight + normalizedEmbedding * embeddingWeight
  );

  return { hybridScore, ruleScore: input.ruleScore, embeddingScore: normalizedEmbedding };
}

export async function hybridRecommend(
  baseRecommendation: Recommendation,
  needText: string,
  channelText: string
): Promise<Recommendation & { embeddingScore?: number }> {
  const { hybridScore, embeddingScore } = await computeHybridScore({
    ruleScore: baseRecommendation.overallScore,
    needText,
    channelText,
  });

  return {
    ...baseRecommendation,
    overallScore: hybridScore,
    reasons: [
      ...baseRecommendation.reasons,
      { category: "embedding", message: `Semantic similarity: ${embeddingScore}/100`, weight: AI_CONFIG.EMBEDDING_WEIGHT * 100 },
    ],
    embeddingScore,
  };
}
