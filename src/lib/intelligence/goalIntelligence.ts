// GroIntel Goal Intelligence Engine
// Standardized growth goals with extraction from Business Knowledge

export interface GrowthGoal {
  name: string;
  slug: string;
  category: string;
  description: string;
  typicalBudget: string;
  typicalTimeline: string;
  requiredCapabilities: string[];
  suggestedMetrics: string[];
}

// The canonical goal library
const GOAL_LIBRARY: GrowthGoal[] = [
  {
    name: "Market Expansion",
    slug: "market-expansion",
    category: "growth",
    description: "Enter a new geographic market or vertical segment with existing products",
    typicalBudget: "$100k-$500k",
    typicalTimeline: "6-12 months",
    requiredCapabilities: ["market_research", "localization", "partner_development", "demand_generation", "pr"],
    suggestedMetrics: ["New market revenue", "Market share", "Partner count", "Pipeline by region"],
  },
  {
    name: "Revenue Growth",
    slug: "revenue-growth",
    category: "growth",
    description: "Increase top-line revenue through pricing, packaging, upsells, or new channels",
    typicalBudget: "$50k-$200k",
    typicalTimeline: "3-9 months",
    requiredCapabilities: ["pricing_strategy", "sales_enablement", "channel_development", "customer_success"],
    suggestedMetrics: ["ARR growth", "Expansion revenue", "Win rate", "ACV"],
  },
  {
    name: "Brand Awareness",
    slug: "brand-awareness",
    category: "marketing",
    description: "Build recognition, trust, and mindshare in target audience segments",
    typicalBudget: "$80k-$300k",
    typicalTimeline: "6-18 months",
    requiredCapabilities: ["pr", "content_marketing", "social_media", "thought_leadership", "events"],
    suggestedMetrics: ["Share of voice", "Brand searches", "Media mentions", "NPS"],
  },
  {
    name: "Demand Generation",
    slug: "demand-generation",
    category: "marketing",
    description: "Create and capture demand through multi-channel marketing programs",
    typicalBudget: "$50k-$250k",
    typicalTimeline: "3-12 months",
    requiredCapabilities: ["paid_ads", "content_marketing", "seo", "email_marketing", "webinar"],
    suggestedMetrics: ["MQL volume", "CAC", "Pipeline influenced", "Conversion rates"],
  },
  {
    name: "Community Growth",
    slug: "community-growth",
    category: "marketing",
    description: "Build an engaged community of users, advocates, or developers",
    typicalBudget: "$30k-$150k",
    typicalTimeline: "6-24 months",
    requiredCapabilities: ["community_management", "developer_relations", "events", "content", "social_media"],
    suggestedMetrics: ["Community members", "Daily active users", "User-generated content", "Advocates"],
  },
  {
    name: "Product Adoption",
    slug: "product-adoption",
    category: "product",
    description: "Increase activation, usage, and retention of existing products",
    typicalBudget: "$40k-$150k",
    typicalTimeline: "3-6 months",
    requiredCapabilities: ["product_marketing", "user_onboarding", "customer_education", "analytics"],
    suggestedMetrics: ["Activation rate", "DAU/MAU", "Time to value", "Retention"],
  },
  {
    name: "Customer Acquisition",
    slug: "customer-acquisition",
    category: "growth",
    description: "Acquire new customers through optimized funnel and sales processes",
    typicalBudget: "$100k-$400k",
    typicalTimeline: "3-12 months",
    requiredCapabilities: ["paid_ads", "seo", "sales", "partnerships", "content"],
    suggestedMetrics: ["New customers", "CAC", "LTV/CAC", "Sales cycle"],
  },
  {
    name: "Hiring",
    slug: "hiring",
    category: "operations",
    description: "Attract, recruit, and retain key talent to scale the organization",
    typicalBudget: "$20k-$100k",
    typicalTimeline: "1-6 months",
    requiredCapabilities: ["employer_branding", "recruitment_marketing", "culture_building"],
    suggestedMetrics: ["Time to hire", "Quality of hire", "Retention rate"],
  },
  {
    name: "Partnership Development",
    slug: "partnership-development",
    category: "growth",
    description: "Build strategic partnerships to expand reach, capabilities, or distribution",
    typicalBudget: "$30k-$200k",
    typicalTimeline: "3-12 months",
    requiredCapabilities: ["partner_development", "bd", "channel_marketing", "co_selling"],
    suggestedMetrics: ["Active partners", "Partner-sourced revenue", "Partner NPS"],
  },
  {
    name: "Localization",
    slug: "localization",
    category: "operations",
    description: "Adapt products, content, and go-to-market for specific local markets",
    typicalBudget: "$50k-$200k",
    typicalTimeline: "3-9 months",
    requiredCapabilities: ["localization", "cultural_consulting", "regional_pr", "translation"],
    suggestedMetrics: ["Localized content volume", "Regional traffic", "Regional conversion"],
  },
  {
    name: "Fundraising",
    slug: "fundraising",
    category: "finance",
    description: "Raise capital from investors through structured fundraising process",
    typicalBudget: "$50k-$150k",
    typicalTimeline: "3-9 months",
    requiredCapabilities: ["investor_relations", "pitch_deck", "financial_modeling", "legal"],
    suggestedMetrics: ["Amount raised", "Investor meetings", "Term sheet count"],
  },
  {
    name: "Customer Retention",
    slug: "customer-retention",
    category: "customer",
    description: "Reduce churn and increase customer loyalty through improved experience and value delivery",
    typicalBudget: "$30k-$120k",
    typicalTimeline: "3-9 months",
    requiredCapabilities: ["customer_success", "onboarding", "support", "community", "education"],
    suggestedMetrics: ["Churn rate", "NPS", "CSAT", "Expansion revenue"],
  },
];

export function getGoalLibrary(): GrowthGoal[] {
  return GOAL_LIBRARY;
}

export function getGoalBySlug(slug: string): GrowthGoal | undefined {
  return GOAL_LIBRARY.find(g => g.slug === slug);
}

export function getGoalsByCategory(category: string): GrowthGoal[] {
  return GOAL_LIBRARY.filter(g => g.category === category);
}

export function suggestGoalsFromBusinessKnowledge(businessKnowledge: Record<string, unknown>): { goal: GrowthGoal; relevance: number; reasoning: string }[] {
  const suggestions: { goal: GrowthGoal; relevance: number; reasoning: string }[] = [];
  const industry = ((businessKnowledge.business_identity as Record<string, unknown>)?.industry as string || "").toLowerCase();
  const goals = (businessKnowledge.goals as unknown as string[]) || [];
  const market = (businessKnowledge.market as Record<string, unknown>)?.overview as string[] || [];

  for (const goal of GOAL_LIBRARY) {
    let relevance = 30;
    const reasons: string[] = [];

    // Check if explicit goal exists in business knowledge
    if (goals.some(g => g.toLowerCase().includes(goal.slug.replace(/-/g, " ").toLowerCase()))) {
      relevance += 40;
      reasons.push("Matches stated business goal");
    }

    // Industry relevance
    if (goal.slug === "market-expansion" && (industry.includes("global") || industry.includes("expansion"))) {
      relevance += 20;
      reasons.push("Industry signals expansion need");
    }
    if (goal.slug === "brand-awareness" && (industry.includes("consumer") || industry.includes("brand"))) {
      relevance += 15;
    }
    if (goal.slug === "community-growth" && (industry.includes("developer") || industry.includes("platform"))) {
      relevance += 20;
      reasons.push("Platform/developer businesses benefit from community");
    }
    if (goal.slug === "localization" && (market.some((m: string) => m.toLowerCase().includes("global") || m.toLowerCase().includes("international")))) {
      relevance += 25;
      reasons.push("Market data indicates global ambition");
    }
    if (goal.slug === "partnership-development" && (industry.includes("platform") || industry.includes("saas"))) {
      relevance += 15;
    }

    if (relevance > 30) {
      suggestions.push({
        goal,
        relevance: Math.min(100, relevance),
        reasoning: reasons.length > 0 ? reasons.join("; ") : "General relevance to technology businesses",
      });
    }
  }

  return suggestions.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
}
