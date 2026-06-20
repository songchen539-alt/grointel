// GroIntel PRODUCT-1 — Decision Report Builder
import { GrowthDecisionRequest, GrowthDecisionReport, CompanyInput, GrowthGoal, GrowthDiagnosis, GrowthRecommendation, GrowthRisk, NextAction } from "./growth_decision_types";

export class DecisionReportBuilder {
  private counter = 0;

  build(req: GrowthDecisionRequest, company: CompanyInput, goal: GrowthGoal, diagnosis: GrowthDiagnosis, patterns: GrowthRecommendation[], causalExplanation: string, supplyCats: { category: string; reason: string; confidence: number }[]): GrowthDecisionReport {
    const risks: GrowthRisk[] = [
      { risk: "Execution risk: team may lack capacity", severity: "medium", mitigation: "Start with one pattern and build capability" },
      { risk: "Budget risk: insufficient budget for recommended patterns", severity: diagnosis.risk_level === "high" ? "high" : "medium", mitigation: "Prioritize highest-impact, lowest-cost pattern" },
    ];

    const nextActions: NextAction[] = [
      { action: "Review and validate company profile", priority: 1, timeframe: "Day 1", owner: "User" },
      { action: `Explore top pattern: ${patterns[0]?.pattern_name || "N/A"}`, priority: 2, timeframe: "Week 1", owner: "User" },
      { action: "Define success metrics and KPIs", priority: 3, timeframe: "Week 1", owner: "User" },
      { action: "Begin capability assessment", priority: 4, timeframe: "Week 2", owner: "User" },
    ];

    const report: GrowthDecisionReport = {
      id: "gdr_" + (++this.counter).toString(16).padStart(6, "0"),
      request: req, company, goal, diagnosis,
      recommended_patterns: patterns, causal_explanation: causalExplanation,
      supply_categories: supplyCats, risks,
      unknowns: company.known_unknowns,
      next_actions: nextActions,
      summary: `${company.company_domain} wants to ${goal.category}. ` +
        `Top pattern: ${patterns[0]?.pattern_name || "Explore options"} (fit: ${patterns[0]?.fit_score || 0}%). ` +
        `Risk level: ${diagnosis.risk_level}. ${patterns.length} patterns identified.`,
      confidence: Math.round((company.confidence + goal.confidence + diagnosis.confidence) / 3),
      created_at: new Date().toISOString(),
    };

    return report;
  }
}
