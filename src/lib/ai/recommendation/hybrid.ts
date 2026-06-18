// GroIntel AI Core v4 - Hybrid Recommendation Pipeline
// Rule Score × 0.80 + Embedding Score × 0.20
// Uses configured embedding provider with fallback to mock.

import { GrowthNeed, Channel, ChannelService, Recommendation, Reason } from "./types";
import { extractFeatures } from "./features";
import { evaluate } from "./ruleEngine";
import { generateExplanation } from "./explain";
import { rankRecommendations } from "../ranking/ranking";
import { computeHybridScore } from "../scoring/hybrid";
import { getEmbeddingProvider, getProviderMetadata } from "../embedding/factory";
import { AI_CONFIG } from "../config";

export interface HybridRecommendation extends Recommendation {
  ruleScore: number;
  embeddingScore: number;
  hybridScore: number;
  scoringMode: "hybrid" | "rule_fallback";
  embeddingProvider: string;
  embeddingModel: string;
  fallbackUsed: boolean;
}

export function buildNeedText(need: GrowthNeed): string {
  return [
    need.companyName, need.industry, need.region, need.growthGoal,
    need.currentChallenge, need.targetMarket,
    `budget ${need.currency} ${need.budgetMin}-${need.budgetMax}`, need.timeline,
  ].filter(Boolean).join(" ");
}

export function buildServiceText(channel: Channel, service: ChannelService | null): string {
  if (!service) {
    return [channel.channelName, (channel.targetIndustries || []).join(", "), channel.region, (channel.serviceTypes || []).join(", ")].filter(Boolean).join(" ");
  }
  return [
    service.serviceName, service.serviceType, service.problemSolved, service.growthOutcome,
    service.deliverables, service.targetIndustry, service.targetRegion, service.successMetrics, service.caseStudy,
  ].filter(Boolean).join(" ");
}

export async function recommendHybrid(
  need: GrowthNeed,
  channels: Channel[],
  services: ChannelService[]
): Promise<HybridRecommendation[]> {
  const features = extractFeatures(need);
  const needText = buildNeedText(need);
  const providerInfo = getProviderMetadata();
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

      const finalScore = hybridResult.hybridScore;
      const mode = hybridResult.embeddingScore > 0 ? "hybrid" : "rule_fallback";

      const reasons: Reason[] = [
        ...ruleResult.reasons,
        { category: "embedding", message: `Semantic similarity: ${hybridResult.embeddingScore}/100`, weight: 20 },
        { category: "provider", message: `Embedding: ${providerInfo.provider}${providerInfo.fallbackUsed ? " (fallback)" : ""}`, weight: 0 },
      ];

      results.push({
        channelId: channel.id,
        serviceId: service?.id || null,
        overallScore: finalScore,
        ruleScore: hybridResult.ruleScore,
        embeddingScore: hybridResult.embeddingScore,
        hybridScore: finalScore,
        scoringMode: mode,
        embeddingProvider: providerInfo.provider,
        embeddingModel: providerInfo.model,
        fallbackUsed: providerInfo.fallbackUsed,
        featureScores: ruleResult.scores,
        confidence: ruleResult.confidence,
        reasons,
        matchReason: explanation.summary,
        recommendedSolutionType: service?.serviceType || channel.category || "",
      });
    }
  }

  results.sort((a, b) => b.hybridScore - a.hybridScore);
  return rankRecommendations(results) as HybridRecommendation[];
}
