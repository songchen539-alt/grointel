// GroIntel AI Core - Confidence Scoring
// Computes confidence level for recommendations based on data quality.

import { ScoreBreakdown } from "../recommendation/types";

export interface ConfidenceInput {
  scores: ScoreBreakdown;
  dataCompleteness: number; // 0-100: how complete the input data is
  historicalData: boolean;  // whether historical outcomes exist
}

export function computeConfidence(input: ConfidenceInput): "High" | "Medium" | "Low" {
  const scoreConfidence = averageScore(input.scores);
  const completenessWeight = input.dataCompleteness / 100;
  const historyBonus = input.historicalData ? 10 : 0;

  const total = scoreConfidence * completenessWeight + historyBonus;

  if (total >= 65) return "High";
  if (total >= 35) return "Medium";
  return "Low";
}

function averageScore(scores: ScoreBreakdown): number {
  return (scores.industry + scores.problem + scores.region + scores.budget + scores.timeline + scores.history) / 6;
}
