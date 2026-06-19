// GroIntel Constraint Intelligence Engine
// Extracts structured constraint models from Business Knowledge

export interface ConstraintModel {
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  regions: string[];
  languages: string[];
  complianceNeeds: string[];
  companyStage: string | null;
  industryFocus: string[];
  urgency: string | null;
  confidence: number;
}

const COMPANY_STAGES = ["pre-seed", "seed", "series-a", "series-b", "series-c+", "public", "enterprise"];

export function extractConstraintsFromBusinessKnowledge(businessKnowledge: Record<string, unknown>): ConstraintModel {
  const identity = (businessKnowledge.business_identity || {}) as Record<string, unknown>;
  const businessModel = (businessKnowledge.business_model || {}) as Record<string, unknown>;
  const budgetInfo = (businessKnowledge.constraints || {}) as Record<string, unknown>;
  const industry = (identity.industry as string) || "";
  const scale = (businessModel.scale as string) || "";
  const fundingStage = (businessModel.funding_stage as string) || "";

  // Infer company stage
  const stage = inferCompanyStage(scale, fundingStage);

  // Infer budget range
  const { budgetMin, budgetMax } = inferBudget(stage, industry);

  // Infer timeline
  const timeline = (budgetInfo.timeline as string) || inferTimeline(stage);

  // Infer regions
  const regions = inferRegions(industry, identity);

  // Calculate confidence
  const confidence = calculateConstraintConfidence(identity, budgetInfo);

  return {
    budgetMin,
    budgetMax,
    timeline,
    regions,
    languages: ["English"],
    complianceNeeds: inferCompliance(industry),
    companyStage: stage,
    industryFocus: industry ? [industry] : [],
    urgency: inferUrgency(stage),
    confidence,
  };
}

function inferCompanyStage(scale: string, funding: string): string {
  const scaleLower = scale.toLowerCase();
  const fundingLower = funding.toLowerCase();

  if (scaleLower.includes(">$10b") || scaleLower.includes("public") || fundingLower.includes("public")) return "public";
  if (scaleLower.includes("$100m") || fundingLower.includes("series c") || fundingLower.includes("series d")) return "series-c+";
  if (fundingLower.includes("series b") || scaleLower.includes("$50m")) return "series-b";
  if (fundingLower.includes("series a") || fundingLower.includes("venture") || scaleLower.includes("$10m")) return "series-a";
  if (fundingLower.includes("seed")) return "seed";
  return "pre-seed";
}

function inferBudget(stage: string, industry: string): { budgetMin: number; budgetMax: number } {
  const budgetByStage: Record<string, [number, number]> = {
    "pre-seed": [10000, 50000],
    "seed": [30000, 100000],
    "series-a": [50000, 200000],
    "series-b": [100000, 400000],
    "series-c+": [200000, 1000000],
    "public": [500000, 5000000],
    "enterprise": [100000, 500000],
  };
  return {
    budgetMin: budgetByStage[stage]?.[0] || 50000,
    budgetMax: budgetByStage[stage]?.[1] || 200000,
  };
}

function inferTimeline(stage: string): string {
  const timelines: Record<string, string> = {
    "pre-seed": "3-6 months",
    "seed": "3-9 months",
    "series-a": "6-12 months",
    "series-b": "6-18 months",
    "series-c+": "12-24 months",
    "public": "12-36 months",
    "enterprise": "6-18 months",
  };
  return timelines[stage] || "6-12 months";
}

function inferRegions(industry: string, identity: Record<string, unknown>): string[] {
  const regions: string[] = ["North America"];
  const country = (identity.country as string) || "";
  if (country === "SG" || country === "JP" || country === "CN") regions.push("APAC");
  if (country === "UK" || country === "DE" || country === "FR") regions.push("Europe");
  return regions;
}

function inferCompliance(industry: string): string[] {
  const compliance: string[] = [];
  const indLower = industry.toLowerCase();
  if (indLower.includes("fintech") || indLower.includes("payment") || indLower.includes("finance")) compliance.push("PCI DSS", "KYC/AML");
  if (indLower.includes("health") || indLower.includes("medical")) compliance.push("HIPAA");
  if (indLower.includes("legal")) compliance.push("Data privacy");
  if (compliance.length === 0 && indLower.includes("data")) compliance.push("GDPR");
  return compliance;
}

function inferUrgency(stage: string): string {
  const urgencyMap: Record<string, string> = {
    "pre-seed": "high",
    "seed": "high",
    "series-a": "medium",
    "series-b": "medium",
    "series-c+": "low",
    "public": "low",
    "enterprise": "medium",
  };
  return urgencyMap[stage] || "medium";
}

function calculateConstraintConfidence(identity: Record<string, unknown>, budgetInfo: Record<string, unknown>): number {
  let score = 30;
  if (identity.name) score += 15;
  if (identity.industry) score += 10;
  if (budgetInfo.budget) score += 15;
  if (budgetInfo.timeline) score += 10;
  if (Object.keys(budgetInfo).length > 0) score += 10;
  return Math.min(100, score);
}
