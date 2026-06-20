// GroIntel PRODUCT-2 — Reality Snapshot Builder
import { CompanyRealitySnapshot } from "./company_memory_types";
import { CompanyInput, GrowthGoal } from "../growth_decision_types";

export class RealitySnapshotBuilder {
  private counter = 0;

  build(website: string, goal: string, market: string, budget: string, timeline: string, constraints: string[], companyInput: CompanyInput, interpretedGoal: GrowthGoal): CompanyRealitySnapshot {
    return {
      snapshot_id: "snap_" + (++this.counter).toString(16).padStart(6, "0"),
      growth_goal: goal, target_market: market, budget_range: budget, timeline,
      constraints, signals: companyInput.current_signals,
      known_unknowns: companyInput.known_unknowns,
      captured_at: new Date().toISOString(),
    };
  }
}
