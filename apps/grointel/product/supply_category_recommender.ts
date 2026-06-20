// GroIntel PRODUCT-1 — Supply Category Recommender
import { GrowthGoal } from "./growth_decision_types";

const SUPPLY_CATEGORIES: Record<string, { category: string; reason: string }[]> = {
  demand_generation: [
    { category: "SEO agency", reason: "Systematic content and SEO execution" },
    { category: "Paid ads expert", reason: "Immediate traffic and lead generation" },
    { category: "Content marketing agency", reason: "Long-term organic growth engine" },
  ],
  audience_growth: [
    { category: "Creator/KOL", reason: "Trusted audience through creator partnerships" },
    { category: "Community operator", reason: "Community-driven acquisition" },
    { category: "PR agency", reason: "Brand awareness and media coverage" },
  ],
  market_expansion: [
    { category: "Localization partner", reason: "Localized market entry" },
    { category: "PR agency", reason: "Market-specific media and brand building" },
    { category: "Sales outbound provider", reason: "Direct outreach in new markets" },
  ],
  retention: [
    { category: "Customer success consultant", reason: "Retention program design" },
    { category: "Community operator", reason: "Community-driven retention" },
    { category: "AI automation consultant", reason: "Scalable retention automation" },
  ],
};

export class SupplyCategoryRecommender {
  recommend(goal: GrowthGoal): { category: string; reason: string; confidence: number }[] {
    const cats = SUPPLY_CATEGORIES[goal.category] || SUPPLY_CATEGORIES["demand_generation"];
    return cats.map(c => ({ ...c, confidence: 65 }));
  }
}
