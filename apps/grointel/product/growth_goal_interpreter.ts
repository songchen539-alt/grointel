// GroIntel PRODUCT-1 — Growth Goal Interpreter
import { GrowthGoal } from "./growth_decision_types";

const GOAL_MAP: Record<string, { category: string; description: string; kpis: string[]; days: number }> = {
  "increase leads": { category: "demand_generation", description: "Generate more qualified leads", kpis: ["leads/month", "cost_per_lead", "conversion_rate"], days: 90 },
  "increase sales": { category: "revenue_growth", description: "Increase sales revenue", kpis: ["revenue", "deal_size", "win_rate"], days: 120 },
  "expand market": { category: "market_expansion", description: "Enter new markets or regions", kpis: ["new_market_revenue", "market_share"], days: 180 },
  "launch product": { category: "product_launch", description: "Launch a new product or feature", kpis: ["product_revenue", "adoption_rate", "nps"], days: 90 },
  "grow audience": { category: "audience_growth", description: "Grow audience and brand awareness", kpis: ["followers", "traffic", "reach"], days: 60 },
  "improve retention": { category: "retention", description: "Improve customer retention and loyalty", kpis: ["retention_rate", "churn", "ltv"], days: 90 },
  "reduce cac": { category: "efficiency", description: "Reduce customer acquisition cost", kpis: ["cac", "roi", "payback_period"], days: 60 },
  "find partners": { category: "partnerships", description: "Find strategic growth partners", kpis: ["partnerships", "partner_revenue"], days: 90 },
  "find creators": { category: "creator_marketing", description: "Find and partner with content creators", kpis: ["creators", "campaign_reach", "engagement"], days: 60 },
  "find agencies": { category: "agency_partnership", description: "Find growth agencies to work with", kpis: ["agency_partners", "outsourced_growth"], days: 45 },
  "enter new region": { category: "market_expansion", description: "Enter a new geographic region", kpis: ["regional_revenue", "regional_users"], days: 180 },
};

export class GrowthGoalInterpreter {
  interpret(goalText: string): GrowthGoal {
    const lower = goalText.toLowerCase();
    for (const [key, val] of Object.entries(GOAL_MAP)) {
      if (lower.includes(key)) {
        return { original: goalText, category: val.category, description: val.description, kpis: val.kpis, typical_timeline_days: val.days, confidence: 80 };
      }
    }
    return { original: goalText, category: "other", description: "Custom growth goal", kpis: ["custom_metric"], typical_timeline_days: 90, confidence: 40 };
  }
}
