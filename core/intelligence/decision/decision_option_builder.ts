// GroIntel INT-6 — Decision Option Builder
import { DecisionOption } from "./decision_types";

let doCounter = 0;
function genId(): string { return "dopt_" + (++doCounter).toString(16).padStart(6, "0"); }

export class DecisionOptionBuilder {
  build(): DecisionOption[] {
    return [
      { id: genId(), name: "Proceed with optimized plan", source: "optimization", expected_value: 75, risk: 25, evidence_quality: 80, goal_alignment: 85, reversibility: 40, civilization_value: 60, confidence: 75, time_horizon_days: 60 },
      { id: genId(), name: "Pursue strategic expansion", source: "strategy", expected_value: 80, risk: 45, evidence_quality: 65, goal_alignment: 70, reversibility: 30, civilization_value: 55, confidence: 65, time_horizon_days: 90 },
      { id: genId(), name: "Execute conservative plan", source: "plan", expected_value: 60, risk: 15, evidence_quality: 85, goal_alignment: 60, reversibility: 70, civilization_value: 65, confidence: 80, time_horizon_days: 120 },
      { id: genId(), name: "Explore discovered opportunity", source: "discovery", expected_value: 65, risk: 35, evidence_quality: 55, goal_alignment: 75, reversibility: 60, civilization_value: 70, confidence: 55, time_horizon_days: 45 },
      { id: genId(), name: "Mitigate identified risk", source: "risk", expected_value: 45, risk: 20, evidence_quality: 70, goal_alignment: 50, reversibility: 80, civilization_value: 75, confidence: 70, time_horizon_days: 30 },
      { id: genId(), name: "Validate before proceeding", source: "uncertainty", expected_value: 50, risk: 10, evidence_quality: 60, goal_alignment: 55, reversibility: 90, civilization_value: 60, confidence: 60, time_horizon_days: 15 },
    ];
  }
}
