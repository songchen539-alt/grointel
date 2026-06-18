// GroIntel AI Core v2 - Evaluation Framework
// Compares recommendation engines and computes quality metrics.

import { Recommendation } from "./recommendation/types";
import { OutcomeRecord } from "./learning/history";

export interface EvaluationResult {
  engine: string;
  precision: number;
  recall: number;
  acceptanceRate: number;
  coverage: number;
  avgScore: number;
  totalRecommendations: number;
}

export function evaluateRecommendations(
  recommendations: Recommendation[],
  outcomes: OutcomeRecord[]
): EvaluationResult {
  const total = recommendations.length;
  const channelIds = recommendations.map((r) => r.channelId);
  const relevantOutcomes = outcomes.filter((o) => channelIds.includes(o.channelId));

  const accepted = relevantOutcomes.filter((o) => o.outcome === "accepted" || o.outcome === "won").length;
  const rejected = relevantOutcomes.filter((o) => o.outcome === "rejected" || o.outcome === "lost").length;
  const viewed = relevantOutcomes.filter((o) => o.outcome === "viewed").length;

  return {
    engine: "rule",
    precision: (accepted + rejected) > 0 ? accepted / (accepted + rejected) : 0,
    recall: total > 0 ? accepted / total : 0,
    acceptanceRate: total > 0 ? accepted / total : 0,
    coverage: total > 0 ? relevantOutcomes.length / total : 0,
    avgScore: total > 0 ? recommendations.reduce((s, r) => s + r.overallScore, 0) / total : 0,
    totalRecommendations: total,
  };
}

export function compareEngines(
  rule: EvaluationResult,
  hybrid: EvaluationResult
): Record<string, string> {
  const result: Record<string, string> = {};
  (["precision", "recall", "acceptanceRate", "coverage", "avgScore"] as const).forEach((key) => {
    const diff = ((hybrid[key] - rule[key]) / (rule[key] || 1)) * 100;
    result[key] = `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`;
  });
  return result;
}

export function evaluateRanking(
  recommendations: Recommendation[],
  groundTruth: string[] // ordered list of channel IDs that should rank highest
): number {
  if (groundTruth.length === 0 || recommendations.length === 0) return 0;
  const mrr = groundTruth.reduce((sum, chId, idx) => {
    const rank = recommendations.findIndex((r) => r.channelId === chId);
    return sum + (rank >= 0 ? 1 / (rank + 1) : 0);
  }, 0) / groundTruth.length;
  return Math.round(mrr * 100) / 100;
}
