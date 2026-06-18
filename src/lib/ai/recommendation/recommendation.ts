// GroIntel AI Core - Recommendation Pipeline
// The main pipeline that chains feature extraction, rule engine, ranking, and explanation.

import { GrowthNeed, Channel, ChannelService, Recommendation, RecommendationRequest } from "./types";
import { extractFeatures } from "./features";
import { evaluate } from "./ruleEngine";
import { generateExplanation } from "./explain";
import { rankRecommendations } from "../ranking/ranking";

export function recommend(request: RecommendationRequest): Recommendation[] {
  const features = extractFeatures(request.growthNeed);
  const results: Recommendation[] = [];

  for (const channel of request.channels) {
    const services = request.services.filter((s) => s.channelId === channel.id);
    const targetServices = services.length > 0 ? services : [null];

    for (const service of targetServices) {
      const output = evaluate({ features, channel, service });
      const explanation = generateExplanation(output.overall, output.scores, output.reasons, output.confidence);

      results.push({
        channelId: channel.id,
        serviceId: service?.id || null,
        overallScore: output.overall,
        featureScores: output.scores,
        confidence: output.confidence,
        reasons: output.reasons,
        matchReason: explanation.summary,
        recommendedSolutionType: service?.serviceType || channel.category,
      });
    }
  }

  // Sort by score descending, then rank
  results.sort((a, b) => b.overallScore - a.overallScore);
  return rankRecommendations(results, request.historicalOutcomes);
}

export function explain(recommendation: Recommendation): string {
  return recommendation.matchReason;
}
