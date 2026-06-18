// GroIntel AI Core - Feature Extraction
// Converts raw growth need data into a normalized feature vector.
// Future AI modules must reuse this extraction layer.

import { GrowthNeed, FeatureVector } from "./types";

export function extractFeatures(need: GrowthNeed): FeatureVector {
  const problems = parseProblems(need.currentChallenge);
  const companySize = estimateCompanySize(need.website, need.budgetMax);

  return {
    industry: normalizeIndustry(need.industry || guessIndustry(need)),
    region: normalizeRegion(need.region || need.targetMarket || ""),
    budgetMin: need.budgetMin || 0,
    budgetMax: need.budgetMax || 0,
    timeline: normalizeTimeline(need.timeline),
    stage: normalizeStage(need.stage),
    growthGoal: need.growthGoal || "",
    targetMarket: need.targetMarket || "",
    problems,
    companySize,
  };
}

function parseProblems(challenge: string): string[] {
  if (!challenge) return [];
  const keywords = ["market entry", "user acquisition", "brand awareness", "revenue", "partnership", "community", "talent", "fundraising", "product launch", "expansion", "retention", "growth", "scaling", "sales", "leads", "conversion", "onboarding", "engagement", "international", "localization"];
  return keywords.filter((k) => challenge.toLowerCase().includes(k));
}

function estimateCompanySize(website: string, budgetMax: number): string {
  if (budgetMax >= 100000) return "Enterprise";
  if (budgetMax >= 30000) return "Mid-Market";
  if (budgetMax >= 5000) return "SMB";
  return "Startup";
}

function normalizeIndustry(input: string): string {
  const map: Record<string, string> = {
    fintech: "Financial Technology",
    saas: "SaaS",
    web3: "Web3 / Blockchain",
    ai: "Artificial Intelligence",
    "ai/ml": "Artificial Intelligence",
    "developer tools": "Developer Tools",
    security: "Cybersecurity",
    healthcare: "Health Technology",
    ecommerce: "E-Commerce",
    marketplace: "Marketplace",
  };
  const key = input.toLowerCase().trim();
  return map[key] || input || "Technology";
}

function normalizeRegion(input: string): string {
  const norm = input.toLowerCase().trim();
  if (norm.includes("sea") || norm.includes("southeast") || norm.includes("apac") || norm.includes("asia")) return "APAC / SEA";
  if (norm.includes("north america") || norm.includes("us") || norm.includes("canada") || norm.includes("america")) return "North America";
  if (norm.includes("europe") || norm.includes("eu") || norm.includes("uk")) return "Europe";
  if (norm.includes("middle east") || norm.includes("mea")) return "Middle East";
  if (norm.includes("latam") || norm.includes("latin america") || norm.includes("south america")) return "Latin America";
  if (norm.includes("global") || norm.includes("worldwide")) return "Global";
  return input || "Unknown";
}

function normalizeTimeline(input: string): string {
  if (!input) return "3-6 months";
  const match = input.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num <= 30) return "1 month";
    if (num <= 60) return "1-2 months";
    if (num <= 90) return "3 months";
    if (num <= 180) return "3-6 months";
    return "6-12 months";
  }
  return input;
}

function normalizeStage(input: string): string {
  const norm = (input || "").toLowerCase();
  if (norm.includes("early") || norm.includes("seed") || norm.includes("series a")) return "Early Stage";
  if (norm.includes("growth") || norm.includes("series b") || norm.includes("series c")) return "Growth Stage";
  if (norm.includes("mature") || norm.includes("enterprise") || norm.includes("public")) return "Mature";
  return "Growth Stage";
}

function guessIndustry(need: GrowthNeed): string {
  const combined = (need.companyName + " " + need.website + " " + need.growthGoal + " " + need.currentChallenge).toLowerCase();
  if (combined.includes("ai") || combined.includes("ml") || combined.includes("deep learning")) return "Artificial Intelligence";
  if (combined.includes("blockchain") || combined.includes("crypto") || combined.includes("web3") || combined.includes("defi")) return "Web3 / Blockchain";
  if (combined.includes("fintech") || combined.includes("pay") || combined.includes("bank") || combined.includes("invest")) return "Financial Technology";
  if (combined.includes("saas") || combined.includes("software") || combined.includes("platform")) return "SaaS";
  return "Technology";
}
