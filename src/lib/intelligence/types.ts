// GroIntel Intelligence Engine - Type Definitions
// Deterministic, no random values. Same input always returns same output.

export interface GrowthOpportunity {
  title: string;
  description: string;
  confidence: number;
  expectedImpact: "High" | "Medium" | "Low";
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTimeframe: string;
}

export interface KeyRisk {
  title: string;
  description: string;
  severity: "High" | "Medium" | "Low";
  recommendation: string;
}

export interface MarketRecommendation {
  market: string;
  rationale: string;
  readinessScore: number;
  recommendedStrategy: string;
}

export interface HiringRecommendation {
  role: string;
  urgency: "Critical" | "High" | "Medium" | "Low";
  rationale: string;
}

export interface CompetitiveSignal {
  signal: string;
  source: string;
  relevance: "High" | "Medium" | "Low";
}

export interface TechnologySignal {
  signal: string;
  category: string;
  priority: "High" | "Medium" | "Low";
}

export interface ActionPlanItem {
  week: number;
  actions: string[];
  expectedOutcome: string;
}

export interface CompanyMRI {
  reportId: string;
  companyName: string;
  website: string;
  industry: string;
  stage: string;
  overallScore: number;
  growthScore: number;
  marketReadiness: number;
  competitionRisk: number;
  hiringMomentum: number;
  technologyHealth: number;
  expansionReadiness: number;
  aiConfidence: number;
  topOpportunity: string;
  topRisk: string;
  recommendedNextAction: string;
  overview: string;
  growthOpportunities: GrowthOpportunity[];
  keyRisks: KeyRisk[];
  marketRecommendations: MarketRecommendation[];
  hiringRecommendations: HiringRecommendation[];
  competitiveSignals: CompetitiveSignal[];
  technologySignals: TechnologySignal[];
  next30DaysActionPlan: ActionPlanItem[];
}
