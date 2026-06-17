// GroIntel Intelligence Engine - Scoring Engine
// Deterministic scoring based on company profile heuristics.
// Same company always returns same scores.

import { CompanyProfile } from "./companyProfiles";

export interface CompanyScores {
  growthScore: number;
  marketReadiness: number;
  competitionRisk: number;
  hiringMomentum: number;
  technologyHealth: number;
  expansionReadiness: number;
  overallScore: number;
  aiConfidence: number;
}

function scoreByIndustry(industry: string, stage: string): CompanyScores {
  // Financial Technology
  if (industry === "Financial Technology") {
    return {
      growthScore: stage === "Growth Stage" ? 92 : 72,
      marketReadiness: stage === "Growth Stage" ? 85 : 65,
      competitionRisk: 70, // Lower is better (70 = moderate competition)
      hiringMomentum: stage === "Growth Stage" ? 80 : 50,
      technologyHealth: 88,
      expansionReadiness: stage === "Growth Stage" ? 82 : 55,
      aiConfidence: 86,
      overallScore: 0, // calculated below
    };
  }

  // AI Infrastructure
  if (industry === "AI Infrastructure") {
    return {
      growthScore: 80,
      marketReadiness: 65,
      competitionRisk: 55,
      hiringMomentum: 75,
      technologyHealth: 85,
      expansionReadiness: 60,
      aiConfidence: 78,
      overallScore: 0,
    };
  }

  // L1 Blockchain
  if (industry === "L1 Blockchain") {
    return {
      growthScore: 78,
      marketReadiness: 60,
      competitionRisk: 50, // Very competitive
      hiringMomentum: 70,
      technologyHealth: 82,
      expansionReadiness: 65,
      aiConfidence: 55,
      overallScore: 0,
    };
  }

  // SaaS / Business Intelligence
  if (industry === "SaaS / Business Intelligence") {
    return {
      growthScore: 76,
      marketReadiness: 55,
      competitionRisk: 65,
      hiringMomentum: 60,
      technologyHealth: 78,
      expansionReadiness: 58,
      aiConfidence: 72,
      overallScore: 0,
    };
  }

  // Web3 / Blockchain
  if (industry === "Web3 / Blockchain") {
    return {
      growthScore: 70,
      marketReadiness: 55,
      competitionRisk: 45,
      hiringMomentum: 60,
      technologyHealth: 75,
      expansionReadiness: 55,
      aiConfidence: 50,
      overallScore: 0,
    };
  }

  // Generic Technology
  return {
    growthScore: 65,
    marketReadiness: 55,
    competitionRisk: 60,
    hiringMomentum: 50,
    technologyHealth: 68,
    expansionReadiness: 52,
    aiConfidence: 55,
    overallScore: 0,
  };
}

export function computeScores(profile: CompanyProfile): CompanyScores {
  const stage = profile.stage;
  const scores = scoreByIndustry(profile.industry, stage);

  // Overall score is weighted average of all dimensions
  scores.overallScore = Math.round(
    (scores.growthScore * 0.25 +
      scores.marketReadiness * 0.15 +
      (100 - scores.competitionRisk) * 0.10 +
      scores.hiringMomentum * 0.10 +
      scores.technologyHealth * 0.15 +
      scores.expansionReadiness * 0.10 +
      scores.aiConfidence * 0.15)
  );

  return scores;
}
