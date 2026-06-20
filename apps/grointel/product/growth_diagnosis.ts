// GroIntel PRODUCT-1 — Growth Diagnosis
import { GrowthDiagnosis, CompanyInput, GrowthGoal } from "./growth_decision_types";

export class GrowthDiagnosisEngine {
  diagnose(company: CompanyInput, goal: GrowthGoal): GrowthDiagnosis {
    return {
      current_state: `${company.industry} company serving ${company.region}`,
      bottleneck: company.stage === "growth" ? "Need proven growth channels at scale" : "Need first growth channels",
      missing_capability: goal.category === "demand_generation" ? "Lead generation expertise" : `${goal.category} capabilities`,
      market_opportunity: company.industry === "technology" ? "High digital adoption creates opportunity" : "Growing market demand",
      trust_gap: "Limited evidence of past growth experiments",
      evidence_gap: "No documented growth patterns for this specific combination",
      risk_level: company.confidence > 60 ? "medium" : "high",
      confidence: Math.round((company.confidence + goal.confidence) / 2),
    };
  }
}
