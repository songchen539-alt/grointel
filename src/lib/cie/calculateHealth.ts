// GroIntel Capability Intelligence Engine - Health & Completeness Calculator

import { PassportData, HealthResult, HealthFactor, CompletenessResult, EvidenceItem } from "./types";

export function calculateHealth(
  passport: PassportData,
  evidence: EvidenceItem[],
  capabilityScore: number,
  confidence: number,
): HealthResult {
  const factors: HealthFactor[] = [
    {
      name: "Capability Score",
      score: capabilityScore,
      weight: 0.35,
      detail: capabilityScore >= 70 ? "Strong capability profile" : capabilityScore >= 40 ? "Moderate capability" : "Needs capability development",
    },
    {
      name: "Confidence",
      score: confidence,
      weight: 0.20,
      detail: confidence >= 70 ? "High data confidence" : confidence >= 40 ? "Moderate data quality" : "Low data quality - more evidence needed",
    },
    {
      name: "Profile Completeness",
      score: calculateRawCompleteness(passport),
      weight: 0.15,
      detail: getCompletenessDetail(passport),
    },
    {
      name: "Evidence Depth",
      score: calculateEvidenceDepthScore(evidence),
      weight: 0.15,
      detail: evidence.length > 5 ? "Rich evidence base" : evidence.length > 0 ? "Some evidence present" : "No evidence yet",
    },
    {
      name: "Entity Stability",
      score: calculateStability(passport),
      weight: 0.15,
      detail: passport.year_founded ? `Founded ${new Date().getFullYear() - passport.year_founded}+ years ago` : "Unknown founding date",
    },
  ];

  const health = Math.round(
    factors.reduce((sum, f) => sum + f.score * f.weight, 0)
  );

  return {
    health_score: Math.min(100, Math.max(0, health)),
    completeness_score: calculateRawCompleteness(passport),
    factors,
  };
}

function getPassportField(p: PassportData, field: string): unknown {
  const m = p as unknown as Record<string, unknown>;
  return m[field];
}

function calculateRawCompleteness(passport: PassportData): number {
  const required: (keyof PassportData)[] = [
    "headline", "description", "primary_industry", "primary_region",
    "company_size", "pricing_level", "availability",
    "secondary_industries", "service_regions", "mission",
  ];
  let filled = 0;
  for (const field of required) {
    const val = passport[field];
    if (val && (Array.isArray(val) ? val.length > 0 : true)) {
      filled++;
    }
  }
  return Math.round((filled / required.length) * 100);
}

function getCompletenessDetail(p: PassportData): string {
  const score = calculateRawCompleteness(p);
  if (score >= 80) return "Comprehensive profile";
  if (score >= 50) return "Partially complete";
  return "Minimal profile data";
}

function calculateEvidenceDepthScore(evidence: EvidenceItem[]): number {
  if (evidence.length === 0) return 10;
  return Math.min(100, 20 + evidence.length * 8);
}

function calculateStability(p: PassportData): number {
  let score = 40;
  if (p.year_founded) {
    const age = new Date().getFullYear() - p.year_founded;
    score += Math.min(40, age * 3);
  }
  if (p.team_size) {
    if (p.team_size > 50) score += 20;
    else if (p.team_size > 10) score += 15;
    else if (p.team_size > 5) score += 10;
    else score += 5;
  }
  return Math.min(100, score);
}

export function calculateCompleteness(passport: PassportData): CompletenessResult {
  const required = [
    "headline", "description", "mission",
    "primary_industry", "secondary_industries",
    "primary_region", "service_regions",
    "company_size", "pricing_level", "availability",
  ];
  const total = required.length;
  const filled: string[] = [];
  const missing: string[] = [];

  for (const field of required) {
    const val = getPassportField(passport, field);
    if (val && (Array.isArray(val) ? val.length > 0 : true)) {
      filled.push(field);
    } else {
      missing.push(field);
    }
  }

  return {
    completeness_score: Math.round((filled.length / total) * 100),
    filled_fields: filled,
    missing_fields: missing,
    total_required: total,
    total_filled: filled.length,
  };
}
