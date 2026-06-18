// GroIntel AI Core - Shared Type Definitions
// These types form the standard AI interface across all GroIntel modules.

export interface GrowthNeed {
  id: string;
  companyName: string;
  website: string;
  industry: string;
  region: string;
  stage: string;
  growthGoal: string;
  targetMarket: string;
  targetCustomer: string;
  currentChallenge: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  timeline: string;
  preferredChannels: string[];
}

export interface Channel {
  id: string;
  channelName: string;
  website: string;
  category: string;
  region: string;
  serviceTypes: string[];
  targetIndustries: string[];
  targetClientStage: string[];
  pricingModel: string;
  minBudget: number;
  maxBudget: number;
  currency: string;
  growthOutcomes: string;
  caseStudies: string;
}

export interface ChannelService {
  id: string;
  channelId: string;
  serviceName: string;
  serviceType: string;
  problemSolved: string;
  growthOutcome: string;
  deliverables: string;
  timeline: string;
  pricingModel: string;
  startingPrice: number;
  maxPrice: number;
  currency: string;
  targetRegion: string;
  targetIndustry: string;
  successMetrics: string;
  caseStudy: string;
}

export interface FeatureVector {
  industry: string;
  region: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
  stage: string;
  growthGoal: string;
  targetMarket: string;
  problems: string[];
  companySize: string;
}

export interface ScoreBreakdown {
  industry: number;
  problem: number;
  region: number;
  budget: number;
  timeline: number;
  history: number;
}

export interface Reason {
  category: string;
  message: string;
  weight: number;
}

export type Confidence = "High" | "Medium" | "Low";

export interface Recommendation {
  channelId: string;
  serviceId: string | null;
  overallScore: number;
  featureScores: ScoreBreakdown;
  confidence: Confidence;
  reasons: Reason[];
  matchReason: string;
  recommendedSolutionType: string;
}

export interface RecommendationRequest {
  growthNeed: GrowthNeed;
  channels: Channel[];
  services: ChannelService[];
  historicalOutcomes?: HistoricalOutcome[];
}

export interface HistoricalOutcome {
  channelId: string;
  serviceId: string | null;
  growthNeedId: string;
  outcome: "won" | "lost" | "declined" | "pending";
  score: number;
}
