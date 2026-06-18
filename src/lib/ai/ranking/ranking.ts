// GroIntel AI Core - Ranking Layer
// Abstraction for re-ranking recommendations.
// Initial implementation: identity ranking (no re-ranking).
// Future: Learning-to-Rank, contextual bandits, or AI reranking.

import { Recommendation, HistoricalOutcome } from "../recommendation/types";

export function rankRecommendations(
  recommendations: Recommendation[],
  _historicalOutcomes?: HistoricalOutcome[]
): Recommendation[] {
  // Identity ranking: preserve input order (already sorted by score)
  // Future: apply learned weights, boost channels with positive history
  return recommendations;
}

export function boostByHistory(
  recommendations: Recommendation[],
  outcomes: HistoricalOutcome[]
): Recommendation[] {
  const channelOutcomes = aggregateOutcomes(outcomes);

  return recommendations.map((rec) => {
    const history = channelOutcomes.get(rec.channelId);
    if (!history) return rec;

    // Boost score based on historical win rate
    const winRate = history.wins / (history.total || 1);
    const boost = winRate * 5; // Up to 5 points
    return {
      ...rec,
      overallScore: Math.min(100, rec.overallScore + Math.round(boost)),
    };
  });
}

function aggregateOutcomes(outcomes: HistoricalOutcome[]): Map<string, { wins: number; total: number }> {
  const map = new Map<string, { wins: number; total: number }>();
  for (const o of outcomes) {
    const entry = map.get(o.channelId) || { wins: 0, total: 0 };
    entry.total++;
    if (o.outcome === "won") entry.wins++;
    map.set(o.channelId, entry);
  }
  return map;
}
