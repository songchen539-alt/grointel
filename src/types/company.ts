// GroIntel Company Knowledge Graph - Type Definitions
// Database-ready schema for all Company data.

export interface SocialLinks {
  linkedin: string;
  github: string;
  twitter: string;
  discord?: string;
  telegram?: string;
}

export interface Competitor {
  name: string;
  url: string;
  strength: "Strong" | "Medium" | "Weak";
  whatToLearn: string;
}

export interface Signal {
  type: string;
  label: string;
  description: string;
  weight: number;         // 0-100
  confidence: number;      // 0-100
  updatedAt: string;
}

export interface GrowthChannel {
  name: string;
  category: "Developer" | "Enterprise" | "Community" | "Media" | "Content" | "Events" | "Podcast" | "Newsletter" | "YouTube" | "GitHub" | "X" | "LinkedIn" | "Telegram" | "Discord";
  priority: "Critical" | "High" | "Medium" | "Low";
  reason: string;
  estimatedROI: "Very High" | "High" | "Medium" | "Low";
}

export interface Opportunity {
  title: string;
  description: string;
  confidence: number;
  expectedImpact: "High" | "Medium" | "Low";
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
}

export interface Risk {
  title: string;
  description: string;
  severity: "High" | "Medium" | "Low";
  recommendation: string;
}

export interface DimensionScore {
  name: string;
  score: number;
  detail: string;
}

export interface GrowthBenchmark {
  yourScore: number;
  industryAverage: number;
  top10: number;
  bottom20: number;
  dimensions: { name: string; yourScore: number; average: number }[];
}

export interface WeekPlan {
  week: number;
  goals: string[];
  actions: string[];
  expectedResult: string;
}

export interface SimilarCompany {
  name: string;
  url: string;
  whySimilar: string;
  whatToLearn: string;
}

export interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  category: string;
  country: string;
  headquarters: string;
  businessModel: string;
  estimatedStage: string;
  fundingStage: string;
  employeeSize: string;
  targetCustomer: string;
  productDescription: string;
  description: string;
  markets: string[];
  competitors: Competitor[];
  socialLinks: SocialLinks;
  growthChannels: GrowthChannel[];
  signals: Signal[];
  pricing: string;
  stage: string;
}

export interface CompanyMRIReport {
  companySnapshot: {
    company: string;
    industry: string;
    businessModel: string;
    headquarters: string;
    estimatedStage: string;
    fundingStage: string;
    employeeSize: string;
    targetCustomer: string;
    productDescription: string;
    summary: string;
  };
  growthScores: DimensionScore[];
  overallGrowthScore: number;
  benchmark: GrowthBenchmark;
  topOpportunities: Opportunity[];
  topRisks: Risk[];
  recommendedChannels: GrowthChannel[];
  similarCompanies: SimilarCompany[];
  thirtyDayPlan: WeekPlan[];
  summary: {
    biggestOpportunity: string;
    biggestWeakness: string;
    oneThing: string;
  };
}

export function companyNameFromUrl(url: string): string {
  const domain = url.replace(/https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  return domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1);
}

export function detectIndustry(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("ai") || u.includes("gradient") || u.includes("openai") || u.includes("ml")) return "Artificial Intelligence";
  if (u.includes("monad") || u.includes("phantom") || u.includes("squads") || u.includes("jup")) return "Web3 / Blockchain";
  if (u.includes("immunefi")) return "Cybersecurity";
  if (u.includes("stripe") || u.includes("shopify") || u.includes("kraken")) return "Financial Technology";
  if (u.includes("linear") || u.includes("vercel") || u.includes("notion") || u.includes("helius") || u.includes("near")) return "Developer Tools";
  if (u.includes("fun") || u.includes("canva")) return "SaaS";
  if (u.includes("meteora") || u.includes("drift") || u.includes("margin") || u.includes("ray") || u.includes("magic")) return "Web3 / Blockchain";
  if (u.includes("sui")) return "L1 Blockchain";
  if (u.includes("backpack")) return "Exchange + Wallet";
  if (u.includes("opengradient")) return "AI Infrastructure";
  return "Technology";
}
