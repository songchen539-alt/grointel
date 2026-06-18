// GroIntel AI Core v2 - Learning Metrics
// Evaluation metrics for learning-to-rank and recommendation quality.

import { OutcomeRecord } from "./history";

export interface LearningMetrics {
  precision: number;
  recall: number;
  acceptanceRate: number;
  coverage: number;
  totalRecommendations: number;
  totalAccepted: number;
  totalRejected: number;
  averageScore: number;
}

export function computeMetrics(records: OutcomeRecord[]): LearningMetrics {
  const total = records.length;
  const accepted = records.filter((r) => r.outcome === "accepted" || r.outcome === "won").length;
  const rejected = records.filter((r) => r.outcome === "rejected" || r.outcome === "lost").length;
  const viewed = records.filter((r) => r.outcome === "viewed").length;

  return {
    precision: total > 0 ? accepted / (accepted + rejected) : 0,
    recall: total > 0 ? accepted / total : 0,
    acceptanceRate: total > 0 ? accepted / total : 0,
    coverage: total > 0 ? (accepted + rejected + viewed) / total : 0,
    totalRecommendations: total,
    totalAccepted: accepted,
    totalRejected: rejected,
    averageScore: total > 0 ? records.reduce((s, r) => s + r.hybridScore, 0) / total : 0,
  };
}

function compareEngines(
  ruleMetrics: LearningMetrics,
  hybridMetrics: LearningMetrics
): string[] {
  const diffs: string[] = [];
  const keys: (keyof LearningMetrics)[] = ["precision", "recall", "acceptanceRate", "coverage"];
  for (const key of keys) {
    const rule = ruleMetrics[key] as number;
    const hybrid = hybridMetrics[key] as number;
    const diff = ((hybrid - rule) / (rule || 1)) * 100;
    diffs.push(`${key}: ${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`);
  }
  return diffs;
}
