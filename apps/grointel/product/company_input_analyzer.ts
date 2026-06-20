// GroIntel PRODUCT-1 — Company Input Analyzer
import { CompanyInput } from "./growth_decision_types";

export class CompanyInputAnalyzer {
  analyze(website: string): CompanyInput {
    const domain = website.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
    return {
      company_domain: domain,
      industry: this.guessIndustry(domain),
      region: "US",
      stage: "growth",
      current_signals: ["active_website", "has_market_presence"],
      known_unknowns: ["exact_revenue", "team_size", "funding_stage"],
      confidence: 50,
    };
  }

  private guessIndustry(domain: string): string {
    if (domain.includes("ai") || domain.includes("data") || domain.includes("tech")) return "technology";
    if (domain.includes("shop") || domain.includes("buy") || domain.includes("store")) return "ecommerce";
    if (domain.includes("health") || domain.includes("med") || domain.includes("care")) return "healthcare";
    if (domain.includes("fin") || domain.includes("bank") || domain.includes("invest")) return "finance";
    return "general";
  }
}
