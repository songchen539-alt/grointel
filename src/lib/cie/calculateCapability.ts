// GroIntel Capability Intelligence Engine - Capability Calculator
// Calculates capability scores from passport + entity data using provider-agnostic rules

import { CapabilityScores, PassportData, EntityData, CapabilityCalculationResult } from "./types";

const EVIDENCE_WEIGHT_PRESET: Record<string, number> = {
  website: 5, linkedin: 10, x: 5, github: 15, youtube: 10,
  podcast: 15, newsletter: 10, case_study: 25, review: 20,
  media_mention: 15, public_dataset: 10, other: 5,
};

const INDUSTRY_EXPERTISE_INDUSTRIES: Record<string, number> = {
  fintech: 90, ai: 85, "developer tools": 75, saas: 80,
  "hr saas": 70, "gtm ai": 75, "ai audio": 65, "ai video": 70,
  "enterprise ai": 80, web3: 60, "l1 blockchain": 50,
  "legal ai": 65, "ai infrastructure": 85,
};

export function calculateCapability(
  passport: PassportData,
  entity: EntityData,
  evidenceCounts: Record<string, number>,
  socialCounts: Record<string, number>,
  caseStudyCount: number,
): CapabilityCalculationResult {
  const dims = calculateDimensionScores(passport, entity, evidenceCounts, socialCounts, caseStudyCount);
  const overall = calculateOverall(dims);
  const confidence = calculateConfidenceScore(passport, evidenceCounts);
  const evidenceCount = Object.values(evidenceCounts).reduce((a, b) => a + b, 0);

  return {
    scores: { ...dims, overall_score: overall, extra_dimensions: {} },
    confidence,
    evidence_count: evidenceCount,
    calculation_version: 1,
    history_entry: {
      capability_snapshot: dims,
      overall_score: overall,
      confidence,
      reason: buildReason(entity.display_name, dims, overall),
      evidence_used: Object.entries(evidenceCounts)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => `${count}x ${type}`),
      calculated_at: new Date().toISOString(),
    },
  };
}

function calculateDimensionScores(
  passport: PassportData,
  entity: EntityData,
  evidenceCounts: Record<string, number>,
  socialCounts: Record<string, number>,
  caseStudyCount: number,
): Omit<CapabilityScores, "overall_score" | "extra_dimensions"> {
  const execScore = calcExecution(entity, evidenceCounts, caseStudyCount);
  const trustScore = calcTrust(evidenceCounts, socialCounts);
  const authScore = calcAuthority(entity, socialCounts, caseStudyCount);
  const reachScore = calcReach(socialCounts);
  const audFitScore = calcAudienceFit(passport);
  const indExpScore = calcIndustryExpertise(passport);
  const pricingScore = calcPricing(passport);
  const availScore = calcAvailability(passport);
  const innovScore = calcInnovation(entity, caseStudyCount);
  const roiScore = calcROI(caseStudyCount, evidenceCounts);

  return {
    execution_score: execScore,
    trust_score: trustScore,
    authority_score: authScore,
    reach_score: reachScore,
    audience_fit_score: audFitScore,
    industry_expertise_score: indExpScore,
    pricing_score: pricingScore,
    availability_score: availScore,
    innovation_score: innovScore,
    roi_score: roiScore,
  };
}

function calcExecution(entity: EntityData, evidence: Record<string, number>, caseStudies: number): number {
  // Base: entity type maturity
  const base: Record<string, number> = { company: 75, agency: 70, creator: 65, community: 60, media: 60, newsletter: 55, podcast: 55 };
  let score = base[entity.entity_type] || 50;
  // Evidence boosts
  const weight = Object.entries(evidence).reduce((sum, [type, count]) => sum + (EVIDENCE_WEIGHT_PRESET[type] || 5) * count, 0);
  score += Math.min(25, weight / 20);
  // Case studies
  score += Math.min(10, caseStudies * 3);
  return Math.round(Math.min(100, score));
}

function calcTrust(evidence: Record<string, number>, socials: Record<string, number>): number {
  let score = 40;
  if (evidence.case_study > 0) score += 15;
  if (evidence.review > 0) score += 10;
  if (evidence.media_mention > 0) score += 5;
  if ((socials.linkedin || 0) > 0) score += 10;
  if ((socials.x || 0) > 0) score += 5;
  if ((socials.github || 0) > 0) score += 10;
  return Math.round(Math.min(100, score));
}

function calcAuthority(entity: EntityData, socials: Record<string, number>, caseStudies: number): number {
  let score = 30;
  if (entity.website) score += 10;
  if (entity.country) score += 5;
  const socialTypes = Object.keys(socials).length;
  score += Math.min(20, socialTypes * 5);
  score += Math.min(15, caseStudies * 5);
  return Math.round(Math.min(100, score));
}

function calcReach(socials: Record<string, number>): number {
  let score = 20;
  const socialTypes = Object.keys(socials).length;
  score += Math.min(30, socialTypes * 7);
  const totalFollowers = Object.values(socials).reduce((a, b) => a + b, 0);
  if (totalFollowers > 100000) score += 30;
  else if (totalFollowers > 10000) score += 20;
  else if (totalFollowers > 1000) score += 10;
  return Math.round(Math.min(100, score));
}

function calcAudienceFit(passport: PassportData): number {
  let score = 30;
  if (passport.primary_industry) score += 10;
  if (passport.secondary_industries && passport.secondary_industries.length > 0) score += Math.min(15, passport.secondary_industries.length * 3);
  if (passport.primary_region) score += 10;
  if (passport.service_regions && passport.service_regions.length > 0) score += 10;
  if (passport.company_size) score += 5;
  return Math.round(Math.min(100, score));
}

function calcIndustryExpertise(passport: PassportData): number {
  if (!passport.primary_industry) return 30;
  const industry = passport.primary_industry.toLowerCase();
  const base = Object.entries(INDUSTRY_EXPERTISE_INDUSTRIES).find(([k]) => industry.includes(k));
  let score = base ? base[1] : 50;
  if (passport.team_size && passport.team_size > 10) score += 10;
  if (passport.year_founded && passport.year_founded < 2020) score += 10;
  return Math.round(Math.min(100, score));
}

function calcPricing(passport: PassportData): number {
  const preset: Record<string, number> = { premium: 80, "mid-market": 70, affordable: 60, free: 40, enterprise: 85 };
  return passport.pricing_level ? (preset[passport.pricing_level.toLowerCase()] || 60) : 50;
}

function calcAvailability(passport: PassportData): number {
  if (!passport.availability) return 50;
  const a = passport.availability.toLowerCase();
  if (a.includes("high") || a.includes("immediate")) return 90;
  if (a.includes("medium")) return 65;
  if (a.includes("low") || a.includes("waitlist")) return 40;
  return 50;
}

function calcInnovation(entity: EntityData, caseStudies: number): number {
  let score = 40;
  if (entity.entity_type === "company") score += 20;
  if (caseStudies > 0) score += 15;
  if (entity.website) score += 5;
  return Math.round(Math.min(100, score));
}

function calcROI(caseStudies: number, evidence: Record<string, number>): number {
  let score = 30;
  score += Math.min(30, caseStudies * 10);
  score += Math.min(20, (evidence.review || 0) * 5);
  score += Math.min(20, (evidence.media_mention || 0) * 3);
  return Math.round(Math.min(100, score));
}

function calculateOverall(dims: Omit<CapabilityScores, "overall_score" | "extra_dimensions">): number {
  const weights: Record<string, number> = {
    execution_score: 0.20, trust_score: 0.15, authority_score: 0.15,
    reach_score: 0.10, audience_fit_score: 0.10, industry_expertise_score: 0.10,
    pricing_score: 0.05, availability_score: 0.05, innovation_score: 0.05,
    roi_score: 0.05,
  };
  const total = Object.entries(weights).reduce((sum, [key, weight]) => {
    return sum + (dims[key as keyof typeof dims] || 50) * weight;
  }, 0);
  return Math.round(Math.min(100, Math.max(0, total)));
}

function calculateConfidenceScore(passport: PassportData, evidenceCounts: Record<string, number>): number {
  let score = 20;
  if (passport.headline) score += 5;
  if (passport.description) score += 5;
  if (passport.primary_industry) score += 5;
  if (passport.primary_region) score += 5;
  if (passport.company_size) score += 5;
  const totalEvidence = Object.values(evidenceCounts).reduce((a, b) => a + b, 0);
  score += Math.min(30, totalEvidence * 5);
  return Math.round(Math.min(100, score));
}

function buildReason(name: string, dims: Record<string, number>, overall: number): string {
  const strong = Object.entries(dims)
    .filter(([_, v]) => (v as number) >= 70)
    .map(([k]) => k.replace(/_score$/, "").replace(/_/g, " "))
    .slice(0, 3);
  const weak = Object.entries(dims)
    .filter(([_, v]) => (v as number) < 40)
    .map(([k]) => k.replace(/_score$/, "").replace(/_/g, " "))
    .slice(0, 2);
  let r = `Overall score ${overall}/100 for ${name}.`;
  if (strong.length > 0) r += ` Strong in: ${strong.join(", ")}.`;
  if (weak.length > 0) r += ` Needs improvement in: ${weak.join(", ")}.`;
  return r;
}
