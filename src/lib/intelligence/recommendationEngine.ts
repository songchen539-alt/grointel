// GroIntel Intelligence Engine - Recommendation Engine
// Generates deterministic recommendations based on company profile and scores.

import { CompanyProfile } from "./companyProfiles";
import { CompanyScores } from "./scoringEngine";
import {
  GrowthOpportunity,
  KeyRisk,
  MarketRecommendation,
  HiringRecommendation,
  ActionPlanItem,
} from "./types";

export function generateOpportunities(
  profile: CompanyProfile,
  scores: CompanyScores
): GrowthOpportunity[] {
  const opportunities: GrowthOpportunity[] = [];

  if (profile.industry === "Financial Technology") {
    opportunities.push(
      { title: "Expand in Southeast Asia", description: "SEA digital payments growing at 25% CAGR. Untapped enterprise and SME market opportunity.", confidence: 82, expectedImpact: "High", difficulty: "Medium", estimatedTimeframe: "3-4 months" },
      { title: "Deepen Enterprise Suite", description: "Enterprise revenue represents 60% of addressable opportunity. Build dedicated enterprise features.", confidence: 85, expectedImpact: "High", difficulty: "Hard", estimatedTimeframe: "6-8 months" },
      { title: "Embedded Finance API", description: "Embedded finance market projected to reach $185B. Enable platforms to offer financial services.", confidence: 78, expectedImpact: "High", difficulty: "Medium", estimatedTimeframe: "4-6 months" },
      { title: "Developer Advocacy Program", description: "Developer communities drive 3x higher retention. Invest in advocacy and community programs.", confidence: 75, expectedImpact: "Medium", difficulty: "Easy", estimatedTimeframe: "1-2 months" },
      { title: "Strategic Acquisitions", description: "Acquire complementary fintech tools to accelerate product roadmap and acquire talent.", confidence: 68, expectedImpact: "High", difficulty: "Hard", estimatedTimeframe: "6-12 months" }
    );
  } else if (profile.industry === "AI Infrastructure") {
    opportunities.push(
      { title: "Enterprise AI Adoption", description: "Enterprise AI spending expected to grow 35% annually. Position as enterprise-grade AI infrastructure provider.", confidence: 80, expectedImpact: "High", difficulty: "Medium", estimatedTimeframe: "4-6 months" },
      { title: "Developer Ecosystem Growth", description: "Build comprehensive SDK and API offerings to attract developer community.", confidence: 76, expectedImpact: "High", difficulty: "Medium", estimatedTimeframe: "3-5 months" },
      { title: "Strategic Partnerships", description: "Partner with cloud providers and hardware manufacturers to expand distribution.", confidence: 72, expectedImpact: "Medium", difficulty: "Medium", estimatedTimeframe: "2-4 months" }
    );
  } else if (profile.industry === "L1 Blockchain") {
    opportunities.push(
      { title: "DeFi Ecosystem Expansion", description: "DeFi total value locked growing across L1s. Attract DeFi protocols with low fees and high throughput.", confidence: 80, expectedImpact: "High", difficulty: "Medium", estimatedTimeframe: "3-6 months" },
      { title: "Developer Grants Program", description: "Incentivize dApp development through grants and hackathons.", confidence: 75, expectedImpact: "Medium", difficulty: "Easy", estimatedTimeframe: "1-2 months" },
      { title: "Cross-Chain Interoperability", description: "Enable seamless asset bridging and communication with other chains.", confidence: 70, expectedImpact: "High", difficulty: "Hard", estimatedTimeframe: "6-9 months" }
    );
  } else if (profile.stage === "Early Stage") {
    opportunities.push(
      { title: "Product-Market Fit Refinement", description: "Double down on highest engagement features. Iterate based on early customer feedback.", confidence: 75, expectedImpact: "High", difficulty: "Medium", estimatedTimeframe: "1-3 months" },
      { title: "Content-Led GTM", description: "Build technical content and thought leadership to attract early adopters organically.", confidence: 72, expectedImpact: "Medium", difficulty: "Easy", estimatedTimeframe: "1-2 months" },
      { title: "Seed Enterprise Pilots", description: "Identify 3-5 enterprise prospects for pilot programs to validate enterprise use case.", confidence: 65, expectedImpact: "High", difficulty: "Hard", estimatedTimeframe: "3-6 months" }
    );
  } else {
    // Generic growth stage company
    opportunities.push(
      { title: "Expand into Adjacent Markets", description: "Identify adjacent market segments with similar customer needs and lower acquisition costs.", confidence: 72, expectedImpact: "High", difficulty: "Medium", estimatedTimeframe: "3-6 months" },
      { title: "Scale Customer Acquisition", description: "Invest in scalable acquisition channels including content marketing and paid acquisition.", confidence: 68, expectedImpact: "Medium", difficulty: "Medium", estimatedTimeframe: "2-4 months" },
      { title: "Build Strategic Partnerships", description: "Develop partnership program to expand reach through complementary products.", confidence: 65, expectedImpact: "Medium", difficulty: "Medium", estimatedTimeframe: "3-5 months" }
    );
  }

  return opportunities;
}

export function generateRisks(
  profile: CompanyProfile,
  scores: CompanyScores
): KeyRisk[] {
  const risks: KeyRisk[] = [];

  if (profile.industry === "Financial Technology") {
    risks.push(
      { title: "Intense Competition", description: "PayPal, Adyen, Square competing aggressively for market share.", severity: "High", recommendation: "Accelerate platform differentiation through unique features and vertical specialization." },
      { title: "Regulatory Pressure", description: "Global payment regulations becoming more complex across jurisdictions.", severity: "Medium", recommendation: "Invest in compliance automation and regulatory tracking systems." },
      { title: "Margin Compression", description: "Competition driving down payment processing margins industry-wide.", severity: "Medium", recommendation: "Focus on value-added services and higher-margin products." }
    );
  } else if (profile.industry === "AI Infrastructure") {
    risks.push(
      { title: "Technology Stack Shifts", description: "Rapid evolution of AI frameworks and infrastructure creates technology risk.", severity: "High", recommendation: "Maintain modular architecture to adapt to new frameworks." },
      { title: "Funding Environment", description: "Early-stage AI infrastructure requiring sustained capital investment.", severity: "Medium", recommendation: "Extend runway through strategic partnerships and government grants." }
    );
  } else if (profile.industry === "L1 Blockchain") {
    risks.push(
      { title: "Ecosystem Competition", description: "Intense competition among L1 blockchains for developer mindshare and users.", severity: "High", recommendation: "Differentiate through unique technical capabilities and developer experience." },
      { title: "Market Volatility", description: "Crypto market cycles affect ecosystem activity and token-based incentives.", severity: "Medium", recommendation: "Build sustainable treasury management and multi-cycle growth strategy." }
    );
  } else if (profile.stage === "Early Stage") {
    risks.push(
      { title: "Cash Runway", description: "Early-stage company with limited operating history and funding runway.", severity: "High", recommendation: "Focus on capital-efficient growth and milestone-driven fundraising." },
      { title: "Product-Market Risk", description: "Risk of insufficient product-market fit in competitive market.", severity: "Medium", recommendation: "Implement rapid customer feedback loops and iterative product development." },
      { title: "Talent Acquisition", description: "Attracting engineering talent as an early-stage company.", severity: "Medium", recommendation: "Leverage remote work and equity compensation to compete with larger firms." }
    );
  } else {
    risks.push(
      { title: "Market Competition", description: "Competing against established players and well-funded startups.", severity: "Medium", recommendation: "Identify and double down on unique competitive advantages." },
      { title: "Scaling Challenges", description: "Growing team and operations while maintaining culture and quality.", severity: "Medium", recommendation: "Invest in processes and systems that scale with growth." }
    );
  }

  return risks;
}

export function generateMarketRecommendations(
  profile: CompanyProfile,
  scores: CompanyScores
): MarketRecommendation[] {
  return [
    {
      market: "North America",
      rationale: "Largest addressable market with highest willingness to pay for technology solutions.",
      readinessScore: 85,
      recommendedStrategy: "Maintain and expand current market position with targeted enterprise outreach.",
    },
    {
      market: "Europe",
      rationale: "Growing technology adoption with increasing regulatory requirements.",
      readinessScore: scores.expansionReadiness > 70 ? 72 : 55,
      recommendedStrategy: scores.expansionReadiness > 70
        ? "Expand presence through local partnerships and compliance-ready infrastructure."
        : "Monitor regulatory developments and enter through partnerships.",
    },
    {
      market: "Southeast Asia",
      rationale: "Rapidly digitizing economies with underserved business needs.",
      readinessScore: 45,
      recommendedStrategy: "Explore pilot programs with local partners before full market entry.",
    },
  ];
}

export function generateHiringRecommendations(
  profile: CompanyProfile,
  scores: CompanyScores
): HiringRecommendation[] {
  return [
    { role: "VP of Engineering / CTO", urgency: "High", rationale: "Technical leadership critical for platform development and scaling engineering team." },
    { role: "Head of Product", urgency: "High", rationale: "Product-led growth requires experienced product leadership to drive roadmap and user research." },
    { role: "Developer Advocate", urgency: "Medium", rationale: "Community engagement and developer education essential for ecosystem growth." },
  ];
}

export function generateActionPlan(
  profile: CompanyProfile,
  scores: CompanyScores
): ActionPlanItem[] {
  return [
    {
      week: 1,
      actions: [
        "Assess current market position and competitive landscape",
        "Identify top 3 growth opportunities with quickest time-to-value",
        "Set up growth metrics dashboard",
      ],
      expectedOutcome: "Clear growth priorities identified and measurable",
    },
    {
      week: 2,
      actions: [
        "Launch targeted content program (2 technical blog posts, 1 case study)",
        "Reach out to 10 potential enterprise or strategic partners",
        "Begin hiring for critical technical roles",
      ],
      expectedOutcome: "Pipeline building and brand awareness campaign active",
    },
    {
      week: 3,
      actions: [
        "Finalize partnership agreements with 2 strategic partners",
        "Run first customer feedback session to validate growth hypotheses",
        "Publish developer documentation or API improvements",
      ],
      expectedOutcome: "Partnerships confirmed and customer validation collected",
    },
    {
      week: 4,
      actions: [
        "Analyze growth metrics and adjust strategy based on data",
        "Generate Q2 growth plan with specific targets and budgets",
        "Present findings to stakeholders and align on priorities",
      ],
      expectedOutcome: "Data-driven quarterly growth plan ready for execution",
    },
  ];
}
