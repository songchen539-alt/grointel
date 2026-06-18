// GroIntel AI Core - Constants

export const MATCHING_WEIGHTS = {
  industry: 0.30,
  problem: 0.25,
  region: 0.15,
  budget: 0.15,
  timeline: 0.10,
  history: 0.05,
};

export const CONFIDENCE_THRESHOLDS = {
  high: 65,
  medium: 35,
  low: 0,
};

export const MOCK_EMBEDDING_DIMENSION = 8;

export const SOLUTION_TYPES = [
  "LinkedIn Outbound",
  "B2B Lead Generation",
  "APAC Market Entry",
  "PR / Media Exposure",
  "Newsletter Sponsorship",
  "Web3 Ecosystem Launch",
  "RevOps Consulting",
  "Partnership Introduction",
  "SEO / Content Growth",
  "Paid Ads",
  "Community Growth",
  "Sales Agency",
] as const;
