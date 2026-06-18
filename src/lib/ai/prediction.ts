// GroIntel AI Core v2 - Success Prediction
// Abstraction for predicting recommendation success probability.
// Mock implementation for future ML integration.

import { Recommendation } from "./recommendation/types";
import { OutcomeRecord } from "./learning/history";

export interface SuccessPrediction {
  probability: number; // 0-1
  confidence: "High" | "Medium" | "Low";
  factors: SuccessFactor[];
}

export interface SuccessFactor {
  name: string;
  contribution: number; // positive = increases probability, negative = decreases
  description: string;
}

export function predictSuccess(
  recommendation: Recommendation,
  history: OutcomeRecord[]
): SuccessPrediction {
  const factors: SuccessFactor[] = [];
  let baseProbability = recommendation.overallScore / 100;

  // Factor: overall score
  factors.push({
    name: "Overall Score",
    contribution: baseProbability - 0.5,
    description: `Score of ${recommendation.overallScore}/100`,
  });

  // Factor: historical performance of channel
  const channelOutcomes = history.filter((h) => h.channelId === recommendation.channelId);
  if (channelOutcomes.length > 0) {
    const winRate = channelOutcomes.filter((h) => h.outcome === "won").length / channelOutcomes.length;
    baseProbability = baseProbability * 0.7 + winRate * 0.3;
    factors.push({
      name: "Historical Performance",
      contribution: winRate - 0.5,
      description: `${(winRate * 100).toFixed(0)}% win rate (${channelOutcomes.length} outcomes)`,
    });
  } else {
    factors.push({
      name: "Historical Performance",
      contribution: 0,
      description: "No historical data for this channel",
    });
  }

  // Factor: confidence
  const confidenceBoost = recommendation.confidence === "High" ? 0.1 : recommendation.confidence === "Medium" ? 0 : -0.1;
  baseProbability = Math.min(1, Math.max(0, baseProbability + confidenceBoost));
  factors.push({
    name: "Confidence Level",
    contribution: confidenceBoost,
    description: `Confidence: ${recommendation.confidence}`,
  });

  const confidence = baseProbability >= 0.6 ? "High" : baseProbability >= 0.3 ? "Medium" : "Low";

  return {
    probability: Math.round(baseProbability * 100) / 100,
    confidence,
    factors,
  };
}
