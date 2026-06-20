// GroIntel INT-5 — Option Set Builder
import { OptimizationOption } from "./optimization_types";

let osCounter = 0;
function genId(): string { return "opt_" + (++osCounter).toString(16).padStart(6, "0"); }

export class OptionSetBuilder {
  build(): OptimizationOption[] {
    return [
      { id: genId(), name: "Conservative growth", source: "plan_path", expected_value: 55, cost: 30, risk: 20, time_days: 90, required_capabilities: ["core"], confidence: 80, dependencies: [], constraints: [] },
      { id: genId(), name: "Balanced expansion", source: "plan_path", expected_value: 70, cost: 50, risk: 35, time_days: 60, required_capabilities: ["core", "market"], confidence: 70, dependencies: ["ready"], constraints: [] },
      { id: genId(), name: "Aggressive scaling", source: "strategic_option", expected_value: 85, cost: 80, risk: 60, time_days: 45, required_capabilities: ["all"], confidence: 55, dependencies: ["funding"], constraints: ["capital"] },
      { id: genId(), name: "Trust building", source: "discovery", expected_value: 50, cost: 25, risk: 10, time_days: 120, required_capabilities: ["compliance"], confidence: 75, dependencies: [], constraints: [] },
      { id: genId(), name: "Risk reduction", source: "risk_mitigation", expected_value: 40, cost: 35, risk: 15, time_days: 60, required_capabilities: ["risk_management"], confidence: 70, dependencies: [], constraints: [] },
      { id: genId(), name: "Learning focus", source: "discovery", expected_value: 45, cost: 20, risk: 10, time_days: 90, required_capabilities: ["research"], confidence: 65, dependencies: [], constraints: [] },
      { id: genId(), name: "Market entry", source: "strategic_option", expected_value: 80, cost: 70, risk: 50, time_days: 120, required_capabilities: ["localization", "sales"], confidence: 50, dependencies: ["market_research"], constraints: ["budget"] },
      { id: genId(), name: "Partnership dev", source: "plan", expected_value: 60, cost: 40, risk: 25, time_days: 60, required_capabilities: ["bd"], confidence: 65, dependencies: [], constraints: [] },
    ];
  }
}
