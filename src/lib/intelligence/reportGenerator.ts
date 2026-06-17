// GroIntel Intelligence Engine - Report Generator
// Main entry point. Takes a domain input, produces a complete CompanyMRI.
// Deterministic: same input always returns same output.
// No AI API, no database, no random values.

import { normalizeDomain } from "./normalizeDomain";
import { getCompanyProfile } from "./companyProfiles";
import { computeScores } from "./scoringEngine";
import {
  generateOpportunities,
  generateRisks,
  generateMarketRecommendations,
  generateHiringRecommendations,
  generateActionPlan,
} from "./recommendationEngine";
import type { CompanyMRI, CompetitiveSignal, TechnologySignal } from "./types";

const profileCache = new Map<string, CompanyMRI>();

function generateCompetitiveSignals(industry: string): CompetitiveSignal[] {
  const common: CompetitiveSignal[] = [
    { signal: "Industry competitors increasing marketing spend", source: "Market Intelligence", relevance: "Medium" },
    { signal: "New entrants emerging in adjacent segments", source: "Industry Reports", relevance: "Medium" },
  ];

  if (industry === "Financial Technology") {
    return [
      { signal: "PayPal expanding B2B payment solutions", source: "Earnings Reports", relevance: "High" },
      { signal: "Adyen growing enterprise customer base in North America", source: "Industry Analysis", relevance: "High" },
      { signal: "Square launching new financial services features", source: "Product Announcements", relevance: "Medium" },
      ...common,
    ];
  }

  if (industry === "AI Infrastructure") {
    return [
      { signal: "Major cloud providers launching competing AI infrastructure offerings", source: "Industry News", relevance: "High" },
      { signal: "Open-source AI frameworks gaining enterprise adoption", source: "Developer Communities", relevance: "Medium" },
      ...common,
    ];
  }

  if (industry === "L1 Blockchain") {
    return [
      { signal: "Solana ecosystem growing developer activity significantly", source: "Developer Reports", relevance: "High" },
      { signal: "Ethereum Layer 2 solutions gaining TVL and user adoption", source: "Market Data", relevance: "High" },
      { signal: "New L1 blockchains launching with differentiated architectures", source: "Crypto Media", relevance: "Medium" },
      ...common,
    ];
  }

  return common;
}

function generateTechnologySignals(industry: string): TechnologySignal[] {
  const common: TechnologySignal[] = [
    { signal: "AI and machine learning becoming standard in product offerings", category: "AI/ML", priority: "High" },
  ];

  if (industry === "Financial Technology") {
    return [
      { signal: "Open banking APIs becoming regulatory standard", category: "Compliance", priority: "High" },
      { signal: "Blockchain-based payment rails maturing", category: "Infrastructure", priority: "Medium" },
      { signal: "AI-powered fraud detection becoming table stakes", category: "AI/ML", priority: "High" },
      ...common,
    ];
  }

  if (industry === "AI Infrastructure") {
    return [
      { signal: "Edge AI inference hardware improving rapidly", category: "Hardware", priority: "High" },
      { signal: "Decentralized computing networks gaining traction", category: "Infrastructure", priority: "High" },
      { signal: "Privacy-preserving AI techniques advancing", category: "Research", priority: "Medium" },
      ...common,
    ];
  }

  if (industry === "L1 Blockchain") {
    return [
      { signal: "Zero-knowledge proofs improving scalability", category: "Research", priority: "High" },
      { signal: "Parallel execution engines becoming standard", category: "Infrastructure", priority: "High" },
      { signal: "Account abstraction improving user experience", category: "UX", priority: "Medium" },
      ...common,
    ];
  }

  return common;
}

export function generateReport(inputDomain: string): CompanyMRI {
  const normalized = normalizeDomain(inputDomain);

  // Return cached if exists
  const cached = profileCache.get(normalized.reportId);
  if (cached) return cached;

  const profile = getCompanyProfile(normalized);
  const scores = computeScores(profile);
  const opportunities = generateOpportunities(profile, scores);
  const risks = generateRisks(profile, scores);
  const marketRecs = generateMarketRecommendations(profile, scores);
  const hiringRecs = generateHiringRecommendations(profile, scores);
  const competitiveSignals = generateCompetitiveSignals(profile.industry);
  const technologySignals = generateTechnologySignals(profile.industry);
  const actionPlan = generateActionPlan(profile, scores);

  const topOpportunity = opportunities.length > 0 ? opportunities[0].title : "Market expansion";
  const topRisk = risks.length > 0 ? risks[0].title : "Market competition";
  const recommendedNextAction = opportunities.length > 0
    ? "Immediate: " + opportunities[0].title + ". Timeframe: " + opportunities[0].estimatedTimeframe
    : "Conduct strategic planning session to identify priorities.";

  const report: CompanyMRI = {
    reportId: normalized.reportId,
    companyName: profile.name,
    website: profile.website,
    industry: profile.industry,
    stage: profile.stage,
    overallScore: scores.overallScore,
    growthScore: scores.growthScore,
    marketReadiness: scores.marketReadiness,
    competitionRisk: scores.competitionRisk,
    hiringMomentum: scores.hiringMomentum,
    technologyHealth: scores.technologyHealth,
    expansionReadiness: scores.expansionReadiness,
    aiConfidence: scores.aiConfidence,
    topOpportunity,
    topRisk,
    recommendedNextAction,
    overview: profile.description,
    growthOpportunities: opportunities,
    keyRisks: risks,
    marketRecommendations: marketRecs,
    hiringRecommendations: hiringRecs,
    competitiveSignals: competitiveSignals,
    technologySignals: technologySignals,
    next30DaysActionPlan: actionPlan,
  };

  profileCache.set(normalized.reportId, report);
  return report;
}

export function getReportById(reportId: string): CompanyMRI | null {
  // Check cache first
  const cached = profileCache.get(reportId);
  if (cached) return cached;

  // Try to regenerate from known IDs
  const knownDomains: Record<string, string> = {
    "stripe-com": "stripe.com",
    "stripe-demo": "stripe.com",
    "opengradient-demo": "opengradient.ai",
    "opengradient-ai": "opengradient.ai",
    "monad-demo": "monad.xyz",
    "monad-xyz": "monad.xyz",
    "grointel-demo": "grointel.ai",
    "grointel-ai": "grointel.ai",
  };

  const domain = knownDomains[reportId];
  if (domain) {
    return generateReport(domain);
  }

  return null;
}
