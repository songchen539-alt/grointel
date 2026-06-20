// GroIntel INT-5 — Objective Builder
import { OptimizationObjective, ObjectiveType } from "./optimization_types";

let obCounter = 0;
function genId(): string { return "obj_" + (++obCounter).toString(16).padStart(6, "0"); }

export class ObjectiveBuilder {
  build(goalNames: string[]): OptimizationObjective[] {
    return [
      { id: genId(), type: "maximize_growth", weight: 25, description: "Maximize growth potential", target_value: 80 },
      { id: genId(), type: "maximize_trust", weight: 20, description: "Maximize trust capital", target_value: 75 },
      { id: genId(), type: "maximize_learning", weight: 15, description: "Maximize learning velocity", target_value: 70 },
      { id: genId(), type: "maximize_reality_fidelity", weight: 15, description: "Maximize reality fidelity", target_value: 85 },
      { id: genId(), type: "maximize_civilization_value", weight: 10, description: "Maximize contribution to civilization", target_value: 65 },
      { id: genId(), type: "minimize_risk", weight: 15, description: "Minimize risk exposure", target_value: 30 },
    ];
  }
}
