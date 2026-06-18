// GroIntel AI Core v3 - Hybrid Recommendation Pipeline
// Rule Score × 0.80 + Embedding Score × 0.20

import { GrowthNeed, Channel, ChannelService, Recommendation, ScoreBreakdown, Reason } from "./types";
import { extractFeatures } from "./features";
import { evaluate } from "./ruleEngine";
import { generateExplanation } from "./explain";
import { rankRecommendations } from "../ranking/ranking";
import { computeHybridScore } from "../scoring/hybrid";

function buildNeedText(need: GrowthNeed): string {
  const parts = [
    need.companyName,
    need.industry,
    need.region,
    need.growthGoal,
    need.currentChallenge,
    need.targetMarket,
    `budget ${need.currency} ${need.budgetMin}-${need.budgetMax}`,
    need.timeline,
  ];
  return parts.filter(Boolean).join(" ");
}

function buildServiceText(channel: Channel, service: ChannelService | null): string {
  if (!service) {
    return [
      channel.channelName,
      (channel.targetIndustries || []).join(", "),
      channel.region,
      (channel.serviceTypes || []).join(", "),
    ].filter(Boolean).join(" ");
  }
  return [
    service.serviceName,
    service.serviceType,
    service.problemSolved,
    service.growthOutcome,
    service.deliverables,
    service.targetIndustry,
    service.targetRegion,
    service.successMetrics,
    service.caseStudy,
  ].filter(Boolean).join(" ");
}

export interface HybridRecommendation extends Recommendation {
  ruleScore: number;
  embeddingScore: number;
  hybridScore: number;
  scoringMode: "hybrid" | "rule_fallback";
}

export async function recommendHybrid(
  need: GrowthNeed,
  channels: Channel[],
  services: ChannelService[]
): Promise<HybridRecommendation[]> {
  const features = extractFeatures(need);
  const needText = buildNeedText(need);
  const results: HybridRecommendation[] = [];

  for (const channel of channels) {
    const channelServices = services.filter((s) => s.channelId === channel.id);
    const targetServices = channelServices.length > 0 ? channelServices : [null];

    for (const service of targetServices) {
      const ruleResult = evaluate({ features, channel, service });
      const explanation = generateExplanation(ruleResult.overall, ruleResult.scores, ruleResult.reasons, ruleResult.confidence);

      const channelText = buildServiceText(channel, service);
      const hybridResult = await computeHybridScore({
        ruleScore: ruleResult.overall,
        needText,
        channelText,
      });

      // Determine final score and mode
      const finalScore = hybridResult.hybridScore;
      const mode = hybridResult.embeddingScore > 0 ? "hybrid" : "rule_fallback";

      const reasons: Reason[] = [
        ...ruleResult.reasons,
        { category: "embedding", message: `Semantic similarity: ${hybridResult.embeddingScore}/100`, weight: 20 },
      ];

      results.push({
        channelId: channel.id,
        serviceId: service?.id || null,
        overallScore: finalScore,
        ruleScore: hybridResult.ruleScore,
        embeddingScore: hybridResult.embeddingScore,
        hybridScore: finalScore,
        scoringMode: mode,
        featureScores: ruleResult.scores,
        confidence: ruleResult.confidence,
        reasons,
        matchReason: explanation.summary,
        recommendedSolutionType: service?.serviceType || channel.category || "",
      });
    }
  }

  // Sort by hybrid score descending
  results.sort((a, b) => b.hybridScore - a.hybridScore);

  // Rank (identity)
  return rankRecommendations(results) as HybridRecommendation[];
}

export { buildNeedText, buildServiceText };
