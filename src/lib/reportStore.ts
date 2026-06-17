// GroIntel Report Store
// Bridges the intelligence engine with the report view UI.
// Reports are generated deterministically by the engine.

import type { CompanyMRIReport, DimensionScore, Opportunity, Risk, WeekPlan, GrowthChannel } from "@/types/company";
import { generateReport, getReportById } from "./intelligence/reportGenerator";
import type { CompanyMRI } from "./intelligence/types";

const reportStore = new Map<string, CompanyMRIReport>();

function convertToReportFormat(mri: CompanyMRI): CompanyMRIReport {
  const dimensionScores: DimensionScore[] = [
    { name: "Growth Score", score: mri.growthScore, detail: "Overall growth trajectory" },
    { name: "Market Readiness", score: mri.marketReadiness, detail: "Market preparedness" },
    { name: "Technology Health", score: mri.technologyHealth, detail: "Technical capability" },
    { name: "Hiring Momentum", score: mri.hiringMomentum, detail: "Team growth velocity" },
    { name: "Expansion Readiness", score: mri.expansionReadiness, detail: "Ability to scale" },
    { name: "Competition Risk", score: 100 - mri.competitionRisk, detail: "Inverse: lower competition is better" },
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

function ensureStored(mri: CompanyMRI): CompanyMRIReport {
  const existing = reportStore.get(mri.reportId);
  if (existing) return existing;
  const converted = convertToReportFormat(mri);
  reportStore.set(mri.reportId, converted);
  return converted;
}

export function saveReport(input: string | CompanyMRIReport): string {
  if (typeof input === "string") {
    // Generate report from domain
    const mri = generateReport(input);
    ensureStored(mri);
    return mri.reportId;
  }
  // Legacy: store a pre-built report
  const id = input.companySnapshot.company.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString(36);
  reportStore.set(id, input);
  return id;
}

export function getReport(id: string): CompanyMRIReport | undefined {
  // Check store first
  const existing = reportStore.get(id);
  if (existing) return existing;

  // Try engine
  const mri = getReportById(id);
  if (mri) {
    return ensureStored(mri);
  }

  // Try generating from domain in ID
  const domainFromId = id.replace(/-/g, ".");
  try {
    const mri = generateReport(domainFromId);
    return ensureStored(mri);
  } catch {
    return undefined;
  }
}

export function getAllReportIds(): string[] {
  return Array.from(reportStore.keys());
}
