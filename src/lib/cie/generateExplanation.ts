// GroIntel Capability Intelligence Engine - Explanation Generator (XAI)
// Generates human-readable explanations for capability scores

import { CapabilityScores, CapabilityExplanation, EvidenceItem } from "./types";

const CURRENT_VERSION = "cie-v1.0";

const DIMENSION_LABELS: Record<string, string> = {
  execution_score: "Execution Capability",
  trust_score: "Trustworthiness",
  authority_score: "Authority",
  reach_score: "Reach",
  audience_fit_score: "Audience Fit",
  industry_expertise_score: "Industry Expertise",
  pricing_score: "Pricing",
  availability_score: "Availability",
  innovation_score: "Innovation",
  roi_score: "ROI Track Record",
};

const DIMENSION_DESCRIPTIONS: Record<string, Record<string, string>> = {
  execution_score: {
    high: "demonstrated strong execution through case studies and evidence",
    mid: "shows moderate execution capability",
    low: "limited execution evidence available",
  },
  trust_score: {
    high: "highly trustworthy with verified evidence and positive reviews",
    mid: "moderately trusted with some verifiable sources",
    low: "limited trust signals; more verification needed",
  },
  authority_score: {
    high: "established authority in their domain",
    mid: "some authority signals present",
    low: "authority not yet established",
  },
  reach_score: {
    high: "significant reach across multiple platforms",
    mid: "moderate audience presence",
    low: "limited audience reach",
  },
  audience_fit_score: {
    high: "excellent alignment with target audience needs",
    mid: "partial audience alignment",
    low: "audience alignment unclear",
  },
  industry_expertise_score: {
    high: "deep industry expertise",
    mid: "some industry knowledge",
    low: "limited industry-specific expertise",
  },
  pricing_score: {
    high: "competitive and clear pricing",
    mid: "moderate pricing competitiveness",
    low: "unclear or non-competitive pricing",
  },
  availability_score: {
    high: "readily available for engagement",
    mid: "moderate availability",
    low: "limited availability or high demand",
  },
  innovation_score: {
    high: "highly innovative approach and offerings",
    mid: "some innovative elements",
    low: "conventional approach",
  },
  roi_score: {
    high: "strong ROI evidence from past engagements",
    mid: "some ROI indicators",
    low: "limited ROI evidence",
  },
};

export function generateExplanation(
  dimensionKey: string,
  score: number,
  confidence: number,
  evidence: EvidenceItem[],
): CapabilityExplanation {
  const label = DIMENSION_LABELS[dimensionKey] || dimensionKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const level = score >= 70 ? "high" : score >= 40 ? "mid" : "low";
  const baseReason = DIMENSION_DESCRIPTIONS[dimensionKey]?.[level] || "scored based on available data";

  const relevantEvidence = evidence.slice(0, 3);
  const evidenceDescriptions = relevantEvidence.map(e =>
    `${e.evidence_type}${e.source_title ? `: ${e.source_title}` : ""}`
  );

  let reason = `${label}: ${score}/100 - ${baseReason}.`;
  if (evidenceDescriptions.length > 0) {
    reason += ` Key evidence: ${evidenceDescriptions.join("; ")}.`;
  }
  reason += ` Confidence: ${confidence}%.`;

  return {
    capability_name: dimensionKey,
    score,
    confidence,
    reason,
    evidence_used: evidence.map(e => e.id || e.evidence_type).filter(Boolean),
    ai_model_version: CURRENT_VERSION,
    generated_at: new Date().toISOString(),
  };
}

export function generateFullExplanation(
  scores: CapabilityScores,
  confidence: number,
  evidence: EvidenceItem[],
): CapabilityExplanation[] {
  const dims = Object.entries(scores).filter(
    ([key]) => key in DIMENSION_LABELS && key !== "overall_score" && key !== "extra_dimensions"
  );

  return dims.map(([key, value]) =>
    generateExplanation(key, value as number, confidence, evidence)
  );
}

export function generateOverallExplanation(
  scores: CapabilityScores,
  confidence: number,
  evidenceCount: number,
  entityName: string,
): CapabilityExplanation {
  const strongDims = Object.entries(scores)
    .filter(([k, v]) => k in DIMENSION_LABELS && (v as number) >= 70)
    .map(([k]) => DIMENSION_LABELS[k] || k);

  const weakDims = Object.entries(scores)
    .filter(([k, v]) => k in DIMENSION_LABELS && (v as number) < 40)
    .map(([k]) => DIMENSION_LABELS[k] || k);

  let reason = `Overall capability score for ${entityName}: ${scores.overall_score}/100. `;
  if (strongDims.length > 0) {
    reason += `Strengths: ${strongDims.join(", ")}. `;
  }
  if (weakDims.length > 0) {
    reason += `Areas for improvement: ${weakDims.join(", ")}. `;
  }
  reason += `Based on ${evidenceCount} evidence items with ${confidence}% confidence.`;

  return {
    capability_name: "overall",
    score: scores.overall_score,
    confidence,
    reason,
    evidence_used: [],
    ai_model_version: CURRENT_VERSION,
    generated_at: new Date().toISOString(),
  };
}
