import { GATEWAY_CONFIG } from "@/lib/ai/gateway/config";
import { getProvider } from "@/lib/ai/providers/registry";
import type { AIResponse } from "@/lib/ai/gateway/types";
import type { Web3CollaborationBrief } from "./web3CollaborationBrief";
import type { Web3GrowthDecision, Web3GrowthDemand } from "./web3Decision";

export interface Web3AIGrowthInsight {
  enabled: boolean;
  provider: string;
  model?: string;
  fallbackUsed: boolean;
  growthState: string;
  opportunity: string;
  risk: string;
  recommendedMove: string;
  missingEvidence: string[];
  operatorNote: string;
}

function fallbackInsight(demand: Web3GrowthDemand, decision: Web3GrowthDecision, provider = "deterministic"): Web3AIGrowthInsight {
  const topPartner = decision.recommendedConcretePartners[0];
  return {
    enabled: false,
    provider,
    fallbackUsed: true,
    growthState: `${demand.projectName} has a Web3 growth demand that can be tested through a controlled partner pilot.`,
    opportunity: topPartner
      ? `Start with ${topPartner.name} or a similar ${topPartner.supplyType} partner because the current fit score is ${topPartner.fitScore}.`
      : "Use a mixed KOL, media, and research shortlist before buying broad attention.",
    risk: decision.risks[0] || "The main risk is spending on attention before proving qualified user actions.",
    recommendedMove: decision.nextActions[0] || "Clarify one measurable growth outcome, then run a small tracked pilot.",
    missingEvidence: decision.qualificationQuestions.slice(0, 3),
    operatorNote: "Deterministic fallback insight. Real AI can refine this when a provider is healthy.",
  };
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean).slice(0, 5) : [];
}

function normalizeInsight(value: Record<string, unknown>, ai: AIResponse, demand: Web3GrowthDemand, decision: Web3GrowthDecision): Web3AIGrowthInsight {
  const fallback = fallbackInsight(demand, decision, ai.provider);
  return {
    enabled: ai.provider !== "mock" && !ai.fallbackUsed,
    provider: ai.provider,
    model: ai.model,
    fallbackUsed: ai.fallbackUsed,
    growthState: String(value.growthState || fallback.growthState),
    opportunity: String(value.opportunity || fallback.opportunity),
    risk: String(value.risk || fallback.risk),
    recommendedMove: String(value.recommendedMove || fallback.recommendedMove),
    missingEvidence: asStringArray(value.missingEvidence).length > 0 ? asStringArray(value.missingEvidence) : fallback.missingEvidence,
    operatorNote: String(value.operatorNote || fallback.operatorNote),
  };
}

function buildPrompt(demand: Web3GrowthDemand, decision: Web3GrowthDecision, brief?: Web3CollaborationBrief) {
  const partners = decision.recommendedConcretePartners.slice(0, 5).map((partner) => ({
    name: partner.name,
    type: partner.supplyType,
    fitScore: partner.fitScore,
    fitReason: partner.fitReason,
    metric: partner.keyMetric,
    risk: partner.primaryRisk,
  }));
  return JSON.stringify({
    task: "Act as GroIntel's Web3 growth intelligence engine. Produce a concise operator-ready judgement.",
    demand,
    confidence: decision.confidence,
    partners,
    patterns: decision.collaborationPatterns.slice(0, 4),
    risks: decision.risks.slice(0, 5),
    measurementPlan: decision.measurementPlan.slice(0, 5),
    briefObjective: brief?.objective,
    requiredJsonShape: {
      growthState: "one sentence",
      opportunity: "one sentence",
      risk: "one sentence",
      recommendedMove: "one sentence",
      missingEvidence: ["3 short questions or evidence items"],
      operatorNote: "one sentence",
    },
  });
}

export async function generateWeb3AIGrowthInsight(
  demand: Web3GrowthDemand,
  decision: Web3GrowthDecision,
  brief?: Web3CollaborationBrief,
): Promise<Web3AIGrowthInsight> {
  const providerName = GATEWAY_CONFIG.AI_CHAT_PROVIDER;
  try {
    const provider = getProvider(providerName);
    const ai = await provider.chat({
      system: [
        "You are GroIntel, a professional Web3 growth intelligence engine.",
        "Return valid compact JSON only. Do not include markdown.",
        "Be specific, operator-ready, and conservative about uncertainty.",
      ].join("\n"),
      prompt: buildPrompt(demand, decision, brief),
      temperature: 0.2,
      maxTokens: 500,
    });
    const parsed = JSON.parse(ai.content) as Record<string, unknown>;
    return normalizeInsight(parsed, ai, demand, decision);
  } catch {
    return fallbackInsight(demand, decision, providerName || "deterministic");
  }
}
