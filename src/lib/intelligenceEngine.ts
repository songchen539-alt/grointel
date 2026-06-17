// GroIntel Intelligence Engine - Central Data Hub
// All homepage data flows through this module.
// NOTE: No Unicode special characters - they corrupt in Vercel production.
// Use plain ASCII only: -, >, (c), [icon-text] instead of emoji.

export interface IntelligenceScore {
  name: string;
  score: number;
  maxScore: number;
  status: "excellent" | "good" | "average" | "poor";
  trend: "up" | "down" | "stable";
  detail: string;
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
  { name: "Overall Score", score: 83, maxScore: 100, status: "excellent", trend: "up", detail: "Strong across all dimensions" },
  { name: "Growth Score", score: 87, maxScore: 100, status: "excellent", trend: "up", detail: "Above industry average" },
  { name: "Market Readiness", score: 78, maxScore: 100, status: "good", trend: "up", detail: "Expanding steadily" },
  { name: "Competition Risk", score: 34, maxScore: 100, status: "good", trend: "down", detail: "Low competitive threat" },
  { name: "Hiring Momentum", score: 82, maxScore: 100, status: "excellent", trend: "up", detail: "Strong talent acquisition" },
  { name: "Technology Health", score: 91, maxScore: 100, status: "excellent", trend: "stable", detail: "Modern tech stack" },
  { name: "Expansion Readiness", score: 65, maxScore: 100, status: "average", trend: "up", detail: "Building foundation" },
  { name: "AI Confidence", score: 88, maxScore: 100, status: "excellent", trend: "up", detail: "AI-native company" },
];

export const liveSignals: SignalItem[] = [
  { type: "Hiring Surge", icon: "[team]", company: "OpenGradient", confidence: 92, impact: "High", whyItMatters: "8 new engineering roles in AI infrastructure signals strong product investment and scaling phase.", time: "2h ago" },
  { type: "Funding", icon: "[fund]", company: "Monad", confidence: 95, impact: "High", whyItMatters: "$50M Series B from top-tier VCs positions Monad as the leading EVM-compatible L1 alternative.", time: "4h ago" },
  { type: "Traffic Growth", icon: "[chart]", company: "Phantom", confidence: 78, impact: "Medium", whyItMatters: "Organic traffic up 45% month-over-month driven by cross-chain feature launch and viral social content.", time: "6h ago" },
  { type: "Technology Migration", icon: "[sync]", company: "Squads", confidence: 71, impact: "Medium", whyItMatters: "Migration from basic multisig to smart accounts signals institutional product maturity and enterprise readiness.", time: "8h ago" },
  { type: "Pricing Change", icon: "[dollar]", company: "Fun.xyz", confidence: 65, impact: "Low", whyItMatters: "New freemium tier targeting Southeast Asian user acquisition signals regional expansion strategy.", time: "12h ago" },
  { type: "Executive Hire", icon: "[user]", company: "Immunefi", confidence: 88, impact: "High", whyItMatters: "New Chief Revenue Officer from HackerOne signals enterprise sales motion expansion beyond crypto-native market.", time: "14h ago" },
  { type: "Product Launch", icon: "[rocket]", company: "NEAR", confidence: 85, impact: "High", whyItMatters: "Sharding upgrade improves throughput by 10x, enabling new developer use cases and enterprise adoption.", time: "1d ago" },
  { type: "Strategic Partnership", icon: "[handshake]", company: "Sui", confidence: 82, impact: "Medium", whyItMatters: "Gaming partnership with top Korean studio opens Asian market and drives new developer onboarding pipeline.", time: "1d ago" },
];

export const growthRecommendations: GrowthRecommendation[] = [
  { title: "Expand into Singapore", confidence: "High", expectedROI: "3.2x in 6 months", marketSize: "$2.1B TAM", timeline: "3-4 months", priority: "High", reason: "Singapore is the #1 crypto hub in APAC with supportive regulation and a growing developer talent pool.", expectedImpact: "15K-20K new monthly active users" },
  { title: "Hire Enterprise Sales Lead", confidence: "High", expectedROI: "5x in 12 months", timeline: "1-2 months", priority: "Critical", reason: "Enterprise deals represent 70% of revenue opportunity in your segment but you have no dedicated enterprise sales function.", expectedImpact: "$500K+ in enterprise pipeline within Q3" },
  { title: "Increase SEO Investment", confidence: "Medium", expectedROI: "2.5x in 3 months", marketSize: "150K monthly impressions", timeline: "Ongoing", priority: "Medium", reason: "Current domain authority (38) is significantly below industry average (52) for your sector, limiting inbound lead generation.", expectedImpact: "40% increase in organic inbound leads" },
  { title: "Run Developer Ambassador Program", confidence: "High", expectedROI: "4x in 6 months", marketSize: "$800K community value", timeline: "2-3 months", priority: "High", reason: "Developer communities drive 3x higher retention for platform businesses and reduce customer acquisition costs.", expectedImpact: "200+ active ambassador-driven contributions" },
];

export const pipelineSteps = [
  { name: "Website", description: "Enter any company website to begin deep intelligence analysis", icon: "01" },
  { name: "Signal Collection", description: "AI scans 50+ public data sources across the open web", icon: "02" },
  { name: "Knowledge Graph", description: "Relationships are mapped - people, products, markets, technologies", icon: "03" },
  { name: "AI Reasoning", description: "Multi-model inference engine analyzes company trajectory", icon: "04" },
  { name: "Company MRI", description: "Comprehensive report with scores, benchmarks, and risk assessment", icon: "05" },
  { name: "Growth Recommendations", description: "Prioritized actions with expected outcomes and ROI estimates", icon: "06" },
];

export const graphCategories = [
  { name: "Leadership", items: ["Founders", "Executives", "Board", "Advisors"] },
  { name: "Capital", items: ["Investors", "Fundraising", "Revenue", "Valuation"] },
  { name: "Ecosystem", items: ["Customers", "Partners", "Competitors", "Integrations"] },
  { name: "Operations", items: ["Employees", "Offices", "Markets", "Countries"] },
  { name: "Technology", items: ["Products", "Platform", "Stack", "Patents"] },
  { name: "Intelligence", items: ["Signals", "Risks", "Trends", "Predictions"] },
];

export const whyGroIntelPillars = [
  { title: "Company MRI", description: "Comprehensive intelligence reports that analyze every dimension of a company - from financial health to technology stack, market position to team dynamics. Understand any company in minutes, not weeks.", metric: "10,000+", metricLabel: "Companies Analyzed", icon: "[search]" },
  { title: "Signal Intelligence", description: "Real-time detection of growth signals, competitive moves, market shifts, and emerging risks across 50+ public data sources. Know what matters before it becomes public knowledge.", metric: "50+", metricLabel: "Data Sources", icon: "[signal]" },
  { title: "Company Graph", description: "A living knowledge graph of business relationships connecting companies, people, markets, technologies, and signals into a single intelligence layer. See the full picture, not isolated data points.", metric: "1M+", metricLabel: "Relationships", icon: "[graph]" },
  { title: "Growth Intelligence", description: "AI-powered recommendations that tell companies exactly what actions to take, which markets to enter, and how to execute their growth strategy. Stop guessing. Start growing.", metric: "92%", metricLabel: "Accuracy Rate", icon: "[target]" },
];

export const enterpriseFeatures = [
  "API First Architecture", "SOC2 Type II Certified", "Role-Based Access Control",
  "Global Coverage (50+ Countries)", "Daily Intelligence Updates", "Enterprise-Grade Security",
  "Real-Time Monitoring", "Custom Integration Support", "Dedicated Account Management",
];

export const footerLinks = [
  { title: "Platform", links: ["Company MRI", "Signal Intelligence", "Company Graph", "API", "Documentation", "Pricing"] },
  { title: "Enterprise", links: ["Enterprise", "Roadmap", "Status", "Changelog", "Security"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Privacy", "Terms", "Contact"] },
];
