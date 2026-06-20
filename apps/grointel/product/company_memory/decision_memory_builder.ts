// GroIntel PRODUCT-2 — Decision Memory Builder
import { DecisionMemory, CompanyRealitySnapshot } from "./company_memory_types";
import { GrowthDecisionReport } from "../growth_decision_types";

export class DecisionMemoryBuilder {
  private counter = 0;

  build(report: GrowthDecisionReport, snapshot: CompanyRealitySnapshot): DecisionMemory {
    const now = new Date().toISOString();
    return {
      decision_id: "dm_" + (++this.counter).toString(16).padStart(6, "0"),
      report_id: report.id, snapshot_id: snapshot.snapshot_id, summary: report.summary,
      recommended_patterns: report.recommended_patterns.map(p => p.pattern_name),
      supply_categories: report.supply_categories.map(s => s.category),
      risks: report.risks.map(r => r.risk),
      confidence_at_creation: report.confidence, current_confidence: report.confidence,
      status: "active", created_at: now, last_updated: now,
      confidence_history: [{ timestamp: now, confidence: report.confidence, reason: "Initial decision" }],
    };
  }
}
