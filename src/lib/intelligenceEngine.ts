// GroIntel Intelligence Engine — Central Data Hub
// All homepage data flows through this module.

export interface IntelligenceScore {
  name: string;
  score: number;
  maxScore: number;
  status: "excellent" | "good" | "average" | "poor";
  trend: "up" | "down" | "stable";
}

export interface SignalItem {
  type: string;
  icon: string;
  company: string;
  confidence: number;
  impact: "High" | "Medium" | "Low";
  whyItMatters: string;
  time: string;
}

export interface GrowthRecommendation {
  title: string;
  confidence: "High" | "Medium" | "Low";
  expectedROI: string;
  marketSize?: string;
  timeline: string;
  priority: string;
  reason: string;
  expectedImpact: string;
}

export const companyScores: IntelligenceScore[] = [
  { name: "Growth Score", score: 87, maxScore: 100, status: "excellent", trend: "up" },
  { name: "Market Readiness", score: 78, maxScore: 100, status: "good", trend: "up" },
  { name: "Competition Risk", score: 34, maxScore: 100, status: "good", trend: "down" },
  { name: "Hiring Momentum", score: 82, maxScore: 100, status: "excellent", trend: "up" },
  { name: "Technology Health", score: 91, maxScore: 100, status: "excellent", trend: "stable" },
  { name: "Expansion Readiness", score: 65, maxScore: 100, status: "average", trend: "up" },
  { name: "AI Confidence", score: 88, maxScore: 100, status: "excellent", trend: "up" },
  { name: "Overall Company Score", score: 83, maxScore: 100, status: "excellent", trend: "up" },
];

export const liveSignals: SignalItem[] = [
  { type: "Hiring Surge", icon: "👥", company: "OpenGradient", confidence: 92, impact: "High", whyItMatters: "8 new engineering roles in AI infrastructure signals strong product investment", time: "2h ago" },
  { type: "Funding Announcement", icon: "💰", company: "Monad", confidence: 95, impact: "High", whyItMatters: "$50M Series B positions Monad as the leading EVM-compatible L1", time: "4h ago" },
  { type: "Traffic Growth", icon: "📈", company: "Phantom", confidence: 78, impact: "Medium", whyItMatters: "Organic traffic up 45% MoM driven by cross-chain feature launch", time: "6h ago" },
  { type: "Technology Migration", icon: "🔄", company: "Squads", confidence: 71, impact: "Medium", whyItMatters: "Migration to smart accounts signals institutional product maturity", time: "8h ago" },
  { type: "Pricing Change", icon: "💵", company: "Fun.xyz", confidence: 65, impact: "Low", whyItMatters: "New freemium tier targeting SEA user acquisition", time: "12h ago" },
  { type: "Executive Hire", icon: "👤", company: "Immunefi", confidence: 88, impact: "High", whyItMatters: "New CRO from HackerOne signals enterprise sales expansion", time: "14h ago" },
  { type: "Product Launch", icon: "🚀", company: "NEAR", confidence: 85, impact: "High", whyItMatters: "Sharding upgrade improves TPS by 10x for developer adoption", time: "1d ago" },
  { type: "Strategic Partnership", icon: "🤝", company: "Sui", confidence: 82, impact: "Medium", whyItMatters: "Gaming partnership with Korean studio opens Asian market", time: "1d ago" },
];

export const growthRecommendations: GrowthRecommendation[] = [
  {
    title: "Expand into Indonesia",
    confidence: "High",
    expectedROI: "3.2x in 6 months",
    marketSize: "$2.1B TAM",
    timeline: "3-4 months",
    priority: "High",
    reason: "SEA crypto adoption rate is 38% — highest globally outside US",
    expectedImpact: "15-20K new monthly active users",
  },
  {
    title: "Hire Enterprise Sales Lead",
    confidence: "High",
    expectedROI: "5x in 12 months",
    timeline: "1-2 months",
    priority: "Critical",
    reason: "Enterprise deals represent 70% of revenue opportunity in your segment",
    expectedImpact: "$500K+ in enterprise pipeline within Q3",
  },
  {
    title: "Increase SEO Investment",
    confidence: "Medium",
    expectedROI: "2.5x in 3 months",
    marketSize: "150K monthly impressions",
    timeline: "Ongoing",
    priority: "Medium",
    reason: "Current domain authority (38) is below industry average (52) for your sector",
    expectedImpact: "40% increase in organic inbound leads",
  },
  {
    title: "Run Developer Ambassador Program",
    confidence: "High",
    expectedROI: "4x in 6 months",
    marketSize: "$800K community value",
    timeline: "2-3 months",
    priority: "High",
    reason: "Developer communities drive 3x higher retention for platform businesses",
    expectedImpact: "200+ active ambassador-driven contributions",
  },
];

export const pipelineSteps = [
  { name: "Website", description: "Enter any company website to begin analysis" },
  { name: "Data Collection", description: "Systems scan 50+ public data sources across the web" },
  { name: "Signal Detection", description: "AI identifies growth signals, risks, and patterns" },
  { name: "Knowledge Graph", description: "Relationships are mapped: people, products, markets" },
  { name: "AI Reasoning", description: "Multi-model inference on company trajectory" },
  { name: "Growth Intelligence", description: "Actionable insights extracted from analysis" },
  { name: "Company MRI", description: "Comprehensive report with scores and benchmarks" },
  { name: "Recommendations", description: "Prioritized actions with expected outcomes" },
];

export const graphNodes = [
  { category: "People", items: ["Founders", "Employees", "Investors", "Board Members"] },
  { category: "Business", items: ["Competitors", "Customers", "Partners", "Suppliers"] },
  { category: "Markets", items: ["Countries", "Regions", "Segments", "Verticals"] },
  { category: "Technology", items: ["Products", "Platforms", "Stack", "Patents"] },
  { category: "Intelligence", items: ["Signals", "Risks", "Opportunities", "Trends"] },
];

export const whyGroIntelPillars = [
  {
    title: "Company MRI",
    description: "Comprehensive intelligence reports that analyze every dimension of a company — from financial health to technology stack, market position to team dynamics.",
    metric: "10,000+",
    metricLabel: "Companies Analyzed",
  },
  {
    title: "Signal Intelligence",
    description: "Real-time detection of growth signals, competitive moves, market shifts, and emerging risks across 50+ public data sources.",
    metric: "50+",
    metricLabel: "Data Sources Monitored",
  },
  {
    title: "Company Graph",
    description: "A living knowledge graph of business relationships connecting companies, people, markets, technologies, and signals into a single intelligence layer.",
    metric: "1M+",
    metricLabel: "Business Relationships Mapped",
  },
  {
    title: "Growth Intelligence",
    description: "AI-powered recommendations that tell companies exactly what actions to take, which markets to enter, and how to execute their growth strategy.",
    metric: "92%",
    metricLabel: "Recommendation Accuracy",
  },
];

export const enterpriseFeatures = [
  "API First", "SOC2 Ready", "Role-Based Access",
  "Global Coverage", "Daily Intelligence", "Enterprise Security",
  "Real-time Monitoring", "Custom Integrations", "Dedicated Support",
];
