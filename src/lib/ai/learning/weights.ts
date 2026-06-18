// GroIntel AI Core v2 - Weight Learning
// Abstraction for learning optimal scoring weights from historical data.

export interface WeightVector {
  industry: number;
  problem: number;
  region: number;
  budget: number;
  timeline: number;
  history: number;
}

export const DEFAULT_WEIGHTS: WeightVector = {
  industry: 0.30,
  problem: 0.25,
  region: 0.15,
  budget: 0.15,
  timeline: 0.10,
  history: 0.05,
};

export function applyWeights(scores: Record<string, number>, weights: WeightVector): number {
  return Object.keys(weights).reduce((sum, key) => {
    return sum + (scores[key] || 0) * (weights[key as keyof WeightVector] || 0);
  }, 0);
}

export function adjustWeights(
  current: WeightVector,
  error: number,
  learningRate: number
): WeightVector {
  const adjusted: WeightVector = { ...current };
  for (const key of Object.keys(adjusted) as (keyof WeightVector)[]) {
    adjusted[key] = Math.max(0, Math.min(1, adjusted[key] + error * learningRate));
  }
  return normalizeWeights(adjusted);
}

function normalizeWeights(w: WeightVector): WeightVector {
  const sum = Object.values(w).reduce((a, b) => a + b, 0);
  if (sum === 0) return w;
  const result: WeightVector = { ...w };
  for (const key of Object.keys(result) as (keyof WeightVector)[]) {
    result[key] = result[key] / sum;
  }
  return result;
}
