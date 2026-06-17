// GroIntel Intelligence Engine - Supabase Adapter
// Converts between CompanyMRI type and company_mri_reports table row format.

import type { CompanyMRI } from "./types";
import type { CompanyMRIReport, DimensionScore, Opportunity, Risk, WeekPlan, GrowthChannel } from "@/types/company";

export interface SupabaseReportRow {
  report_id: string;
  company_name: string;
  website: string;
  domain: string;
  industry: string;
  stage: string;
  overall_score: number;
  growth_score: number;
  market_readiness: number;
  competition_risk: number;
  hiring_momentum: number;
  technology_health: number;
  expansion_readiness: number;
  ai_confidence: number;
  top_opportunity: string;
  top_risk: string;
  recommended_next_action: string;
  overview: string;
  report_json: Record<string, unknown>;
  source: string;
  created_at: string;
  updated_at: string;
}

function extractDomain(website: string): string {
  return website.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
}

export function convertToSupabaseRow(mri: CompanyMRI): SupabaseReportRow {
  const now = new Date().toISOString();
  return {
    report_id: mri.reportId,
    company_name: mri.companyName,
    website: mri.website,
    domain: extractDomain(mri.website),
    industry: mri.industry,
    stage: mri.stage,
    overall_score: mri.overallScore,
    growth_score: mri.growthScore,
    market_readiness: mri.marketReadiness,
    competition_risk: mri.competitionRisk,
    hiring_momentum: mri.hiringMomentum,
    technology_health: mri.technologyHealth,
    expansion_readiness: mri.expansionReadiness,
    ai_confidence: mri.aiConfidence,
    top_opportunity: mri.topOpportunity,
    top_risk: mri.topRisk,
    recommended_next_action: mri.recommendedNextAction,
    overview: mri.overview,
    report_json: mri as unknown as Record<string, unknown>,
    source: "engine_v1",
    created_at: now,
    updated_at: now,
  };
}

export function convertToReportFormat(mri: CompanyMRI): CompanyMRIReport {
  const dimensionScores: DimensionScore[] = [
    { name: "Growth Score", score: mri.growthScore, detail: "Overall growth trajectory" },
    { name: "Market Readiness", score: mri.marketReadiness, detail: "Market preparedness" },
    { name: "Technology Health", score: mri.technologyHealth, detail: "Technical capability" },
    { name: "Hiring Momentum", score: mri.hiringMomentum, detail: "Team growth velocity" },
    { name: "Expansion Readiness", score: mri.expansionReadiness, detail: "Ability to scale" },
    { name: "Competition Risk (inv)", score: 100 - mri.competitionRisk, detail: "Inverse: lower competition is better" },
    { name: "AI Confidence", score: mri.aiConfidence, detail: "AI-driven growth potential" },
    { name: "Overall Score", score: mri.overallScore, detail: "Weighted composite score" },
  ];

  const opportunities: Opportunity[] = mri.growthOpportunities.map((o) => ({
    title: o.title,
    description: o.description,
    confidence: o.confidence,
    expectedImpact: o.expectedImpact,
    difficulty: o.difficulty,
    estimatedTime: o.estimatedTimeframe,
  }));

  const risks: Risk[] = mri.keyRisks.map((r) => ({
    title: r.title,
    description: r.description,
    severity: r.severity,
    recommendation: r.recommendation,
  }));

  const plan: WeekPlan[] = mri.next30DaysActionPlan.map((p) => ({
    week: p.week,
    goals: p.actions,
    actions: p.actions,
    expectedResult: p.expectedOutcome,
  }));

  const channels: GrowthChannel[] = [
    { name: "Content Marketing", category: "Content", priority: "High", reason: "Long-term organic acquisition", estimatedROI: "High" },
    { name: "Developer Community", category: "Developer", priority: "Critical", reason: "Core ecosystem growth driver", estimatedROI: "Very High" },
    { name: "Enterprise Sales", category: "Enterprise", priority: "Critical", reason: "High-value revenue channel", estimatedROI: "Very High" },
    { name: "Strategic Partnerships", category: "Media", priority: "Medium", reason: "Access new customer segments", estimatedROI: "Medium" },
  ];

  const snapshot = {
    company: mri.companyName,
    industry: mri.industry,
    businessModel: "Technology",
    headquarters: mri.industry.includes("Financial") ? "San Francisco, CA" : "Remote",
    estimatedStage: mri.stage,
    fundingStage: mri.stage === "Growth Stage" ? "Growth ($50M+)" : "Seed / Series A",
    employeeSize: "Unknown",
    targetCustomer: "Technology companies",
    productDescription: mri.overview.slice(0, 200),
    summary: mri.overview.slice(0, 300),
  };

  return {
    companySnapshot: snapshot,
    growthScores: dimensionScores,
    overallGrowthScore: mri.overallScore,
    benchmark: {
      yourScore: mri.overallScore,
      industryAverage: 72,
      top10: 92,
      bottom20: 55,
      dimensions: [],
    },
    topOpportunities: opportunities,
    topRisks: risks,
    recommendedChannels: channels,
    similarCompanies: [],
    thirtyDayPlan: plan,
    summary: {
      biggestOpportunity: mri.topOpportunity,
      biggestWeakness: mri.topRisk,
      oneThing: mri.recommendedNextAction.slice(0, 120),
    },
  };
}
