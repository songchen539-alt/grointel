// GroIntel AI Core - Similarity Computation
// Methods for computing similarity between entities.

import { cosineSimilarity } from "./vector";
import { MockEmbeddingProvider } from "./mock";
import { FeatureVector } from "../recommendation/types";

const mockProvider = new MockEmbeddingProvider();

export async function similarityByEmbedding(textA: string, textB: string): Promise<number> {
  const [embedA, embedB] = await Promise.all([
    mockProvider.generateEmbedding(textA),
    mockProvider.generateEmbedding(textB),
  ]);
  return mockProvider.similarity(embedA, embedB);
}

export function similarityByFeatures(a: FeatureVector, b: FeatureVector): number {
  let score = 0;
  if (a.industry.toLowerCase() === b.industry.toLowerCase()) score += 30;
  if (a.region.toLowerCase() === b.region.toLowerCase()) score += 20;
  if (areBudgetsCompatible(a.budgetMin, a.budgetMax, b.budgetMin, b.budgetMax)) score += 20;
  if (a.stage === b.stage) score += 15;
  if (a.timeline === b.timeline) score += 15;
  return score;
}

function areBudgetsCompatible(minA: number, maxA: number, minB: number, maxB: number): boolean {
  return (maxA >= minB && maxB >= minA) || (minA === 0 && maxA === 0) || (minB === 0 && maxB === 0);
}
