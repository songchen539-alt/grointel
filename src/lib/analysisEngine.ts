// GroIntel Analysis Engine v1
// Orchestrates signals, scores, and generates complete MRI report.
// Each sub-engine is independently replaceable with AI/API calls.

import { Company, CompanyMRIReport, Opportunity, Risk, GrowthBenchmark, SimilarCompany, WeekPlan } from "@/types/company";
import { getCompanyByUrl } from "@/lib/companyKnowledgeGraph";
import { generateGrowthScores } from "@/lib/scoreEngine";
import { getCompanySignals } from "@/lib/signalEngine";

// ========== Opportunity Generator ==========

function generateOpportunities(company: Company): Opportunity[] {
  const seed = company.website.length + company.name.length;
  const industry = company.industry;

  const pool: Opportunity[] = [
    {
      title: "Expand into Southeast Asia (SEA)",
      description: "SEA crypto adoption is accelerating. Early mover advantage available for infrastructure projects.",
      confidence: 70 + (seed * 7) % 20,
      expectedImpact: "High",
      difficulty: "Medium",
      estimatedTime: "3-4 months",
    },
    {
      title: "Build Developer Community Program",
      description: "Developer communities drive 3x higher retention for platform businesses.",
      confidence: 72 + (seed * 11) % 18,
      expectedImpact: "High",
      difficulty: "Medium",
      estimatedTime: "2-3 months",
    },
    {
      title: "Founder-Led Content on X & LinkedIn",
      description: "Founder branding correlates with 2x lower CAC in B2B tech.",
      confidence: 75 + (seed * 9) % 15,
      expectedImpact: "Medium",
      difficulty: "Easy",
      estimatedTime: "1-2 months",
    },
    {
      title: "AI Newsletter Sponsorship & Guest Posts",
      description: "Curated newsletters have 40%+ open rates in B2B tech verticals.",
      confidence: 68 + (seed * 13) % 20,
      expectedImpact: "Medium",
      difficulty: "Easy",
      estimatedTime: "2-4 weeks",
    },
    {
      title: "Enterprise Partnership Program",
      description: "Enterprise partnerships unlock 5-10x larger deal sizes.",
      confidence: 62 + (seed * 17) % 22,
      expectedImpact: "High",
      difficulty: "Hard",
      estimatedTime: "4-6 months",
    },
    {
      title: industry.includes("Blockchain") || industry.includes("Web3")
        ? "X Spaces & Podcast Tour"
        : "Podcast Tour (Industry-Specific Shows)",
      description: "Appearing on 5-8 targeted podcasts can establish category leadership.",
      confidence: 65 + (seed * 13) % 20,
      expectedImpact: "Medium",
      difficulty: "Medium",
      estimatedTime: "1-2 months",
    },
    {
      title: "Open Source SDK Launch",
      description: "Open-source SDKs drive bottom-up adoption in developer-first companies.",
      confidence: 60 + (seed * 19) % 22,
      expectedImpact: "High",
      difficulty: "Hard",
      estimatedTime: "3-5 months",
    },
    {
      title: "Strategic Content Partnership",
      description: "Content partnerships with industry media amplify brand reach by 3-5x.",
      confidence: 58 + (seed * 11) % 22,
      expectedImpact: "Medium",
      difficulty: "Medium",
      estimatedTime: "2-3 months",
    },
  ];

  const shuffled = pool.sort(() => (seed * 7 + Math.random()) % 2 - 0.5);
  return shuffled.slice(0, 5);
}

// ========== Risk Generator ==========

function generateRisks(company: Company, scores: { name: string; score: number }[]): Risk[] {
  const risks: Risk[] = [];

  for (const s of scores) {
    if (s.score < 40) {
      risks.push({
        title: `Weak ${s.name}`,
        description: `Current ${s.name.toLowerCase()} score of ${s.score}/100 indicates a significant gap compared to industry peers.`,
        severity: s.score < 25 ? "High" : "Medium",
        recommendation: `Invest in a structured 90-day program to improve ${s.name.toLowerCase()}. Target: 60+ score.`,
      });
    }
  }

  if (risks.length < 3) {
    risks.push(
      {
        title: "Limited Market Diversification",
        description: `Over-reliance on single market (${company.country}). Geographic concentration risk.`,
        severity: "Medium",
        recommendation: "Begin exploratory outreach in 2-3 new markets within the next quarter.",
      },
      {
        title: "Competitive Pressure",
        description: `Competitors in the ${company.industry} space are actively expanding.`,
        severity: "Medium",
        recommendation: "Accelerate differentiation strategy and unique value proposition messaging.",
      }
    );
  }

  return risks.slice(0, 3);
}

// ========== Similar Companies Generator ==========

function generateSimilarCompanies(company: Company): SimilarCompany[] {
  const knownPairs: Record<string, SimilarCompany[]> = {
    opengradient: [
      { name: "Replicate", url: "https://replicate.com", whySimilar: "AI inference platform with developer-first GTM", whatToLearn: "Developer experience and community building" },
      { name: "Anthropic", url: "https://anthropic.com", whySimilar: "AI-native company with strong technical brand", whatToLearn: "Enterprise sales motion in AI infrastructure" },
      { name: "Modal", url: "https://modal.com", whySimilar: "Serverless AI infrastructure targeting developers", whatToLearn: "Content marketing and documentation quality" },
    ],
    monad: [
      { name: "Solana", url: "https://solana.com", whySimilar: "High-throughput L1 with strong developer community", whatToLearn: "Hackathon ecosystem development strategy" },
      { name: "Aptos", url: "https://aptoslabs.com", whySimilar: "Move language L1 with parallel execution focus", whatToLearn: "Developer education and onboarding" },
      { name: "Sui", url: "https://sui.io", whySimilar: "Move-based L1 targeting gaming and DeFi", whatToLearn: "Gaming ecosystem partnerships" },
    ],
    phantom: [
      { name: "MetaMask", url: "https://metamask.io", whySimilar: "Leading self-custodial wallet with massive distribution", whatToLearn: "Browser extension distribution strategy" },
      { name: "Rainbow", url: "https://rainbow.me", whySimilar: "Consumer crypto wallet with design-led growth", whatToLearn: "User experience and brand design" },
    ],
    immunefi: [
      { name: "HackerOne", url: "https://hackerone.com", whySimilar: "Bug bounty platform that grew from crypto to mainstream", whatToLearn: "Enterprise sales and compliance expansion" },
      { name: "GitGuardian", url: "https://gitguardian.com", whySimilar: "Security platform with developer-first GTM", whatToLearn: "Content marketing and developer advocacy" },
    ],
    kraken: [
      { name: "Coinbase", url: "https://coinbase.com", whySimilar: "US-regulated exchange with similar compliance-first approach", whatToLearn: "Retail user experience and international expansion" },
      { name: "Circle", url: "https://circle.com", whySimilar: "Regulated crypto financial services company", whatToLearn: "Regulatory navigation and partnership strategy" },
    ],
  };

  if (knownPairs[company.id]) return knownPairs[company.id];

  return [
    { name: "Linear", url: "https://linear.app", whySimilar: "Developer-first product with exceptional organic growth", whatToLearn: "Product-led growth and brand building" },
    { name: "Supabase", url: "https://supabase.com", whySimilar: "Open-source developer platform with community-led growth", whatToLearn: "Community building and open-source strategy" },
    { name: "Vercel", url: "https://vercel.com", whySimilar: "Developer platform leveraging framework-led growth", whatToLearn: "Ecosystem-led growth and developer advocacy" },
  ].slice(0, 3);
}

// ========== Benchmark Generator ==========

function generateBenchmark(company: Company, scores: { name: string; score: number }[]): GrowthBenchmark {
  const overall = Math.round(scores.reduce((s, d) => s + d.score, 0) / scores.length);
  const industryAvg = company.stage === "Mature" ? 78 : company.stage === "Growth" ? 68 : 55;
  return {
    yourScore: overall,
    industryAverage: industryAvg,
    top10: Math.min(100, industryAvg + 20),
    bottom20: Math.max(0, industryAvg - 20),
    dimensions: scores.map((s) => ({
      name: s.name,
      yourScore: s.score,
      average: Math.max(0, s.score - 8 - Math.floor(Math.random() * 10)),
    })),
  };
}

// ========== Growth Plan Generator ==========

function generateGrowthPlan(company: Company): WeekPlan[] {
  return [
    {
      week: 1,
      goals: ["Establish growth baseline", "Map target communities and channels"],
      actions: [
        "Audit current SEO, social presence, and community metrics",
        "Identify top 10 communities and newsletters in your space",
        "Set up tracking for key growth KPIs",
        "Define target customer personas for each market",
      ],
      expectedResult: "Clear baseline metrics and prioritized channel list with target personas",
    },
    {
      week: 2,
      goals: ["Launch content engine", "Begin community engagement"],
      actions: [
        "Publish 2-3 founder-led technical blog posts",
        "Join and contribute to target community discussions",
        "Reach out to 5-8 newsletter editors for sponsorship",
        "Record first podcast appearance",
      ],
      expectedResult: "Initial content published, community presence established, first sponsorships secured",
    },
    {
      week: 3,
      goals: ["Scale outreach", "Execute first partnerships"],
      actions: [
        "Launch newsletter sponsorship campaign across 3+ publications",
        "Host first X Spaces with industry peers",
        "Begin outreach to enterprise pilot prospects",
        "Launch referral program for existing users",
      ],
      expectedResult: "First inbound leads from content and sponsorship channels",
    },
    {
      week: 4,
      goals: ["Measure and optimize", "Plan month 2"],
      actions: [
        "Analyze channel performance and CAC by source",
        "Identify top-performing channels for budget reallocation",
        "Generate Month 2 growth plan with optimized channel mix",
        "Document learnings and adjust strategy",
      ],
      expectedResult: "Data-driven Month 2 growth plan with optimized channel mix and measurable traction",
    },
  ];
}

// ========== Summary Generator ==========

function generateSummary(company: Company, scores: { name: string; score: number }[]): {
  biggestOpportunity: string;
  biggestWeakness: string;
  oneThing: string;
} {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const weakest = sorted[sorted.length - 1];
  const strongest = sorted[0];

  return {
    biggestOpportunity: `Leverage your strong ${strongest.name.toLowerCase()} (${strongest.score}/100) to expand into adjacent growth channels and new markets.`,
    biggestWeakness: `Address your weak ${weakest.name.toLowerCase()} (${weakest.score}/100) - this is the critical gap holding back your overall growth score.`,
    oneThing: `Run a focused 30-day program to improve ${weakest.name.toLowerCase()}. Set a target of reaching 60+ within the next quarter.`,
  };
}

// ========== Main Orchestrator ==========

export function generateCompanyMRIReport(companyUrl: string): CompanyMRIReport {
  const company = getCompanyByUrl(companyUrl);
  const { dimensions, overallScore } = generateGrowthScores(company);
  const signals = getCompanySignals(company);

  const report: CompanyMRIReport = {
    companySnapshot: {
      company: company.name,
      industry: company.industry,
      businessModel: company.businessModel,
      headquarters: company.headquarters,
      estimatedStage: company.estimatedStage,
      fundingStage: company.fundingStage,
      employeeSize: company.employeeSize,
      targetCustomer: company.targetCustomer,
      productDescription: company.productDescription,
      summary: `${company.name} is currently in its ${company.stage === "Mature" ? "mature growth" : company.stage === "Growth" ? "growth expansion" : "early scaling"} stage within the ${company.industry} space, targeting ${company.targetCustomer.toLowerCase()} with a ${company.businessModel.toLowerCase()} model.`,
    },
    growthScores: dimensions.map((d) => ({
      name: d.name,
      score: d.score,
      detail: d.detail,
    })),
    overallGrowthScore: overallScore,
    benchmark: generateBenchmark(company, dimensions),
    topOpportunities: generateOpportunities(company),
    topRisks: generateRisks(company, dimensions),
    recommendedChannels: company.growthChannels,
    similarCompanies: generateSimilarCompanies(company),
    thirtyDayPlan: generateGrowthPlan(company),
    summary: generateSummary(company, dimensions),
  };

  return report;
}
