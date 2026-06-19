// GroIntel INT-2 — Action Generator
import { ActionCandidate, ActionType, PlanGoal } from "./planning_types";

let acCounter = 0;
function genId(): string { return "ac_" + (++acCounter).toString(16).padStart(6, "0"); }

export class ActionGenerator {
  generate(goal: PlanGoal): ActionCandidate[] {
    return [
      this.make("observe_more", "Increase observation frequency for target domain", 20, 60, 70),
      this.make("validate_evidence", "Validate existing evidence quality", 30, 50, 65),
      this.make("reduce_uncertainty", "Reduce uncertainty through targeted investigation", 40, 70, 60),
      this.make("increase_capability", "Build capability in target area", 60, 75, 55),
      this.make("mitigate_risk", "Mitigate identified risks", 50, 65, 60),
      this.make("capture_opportunity", "Capture identified opportunity", 50, 80, 50),
      this.make("improve_trust", "Improve trust signals through transparency", 30, 55, 65),
      this.make("improve_prediction", "Improve prediction models with new data", 40, 60, 60),
      this.make("increase_knowledge_density", "Increase knowledge density in domain", 35, 65, 65),
      this.make("recommend_growth_action", "Generate and communicate growth recommendation", 25, 85, 55),
    ];
  }

  private make(type: ActionType, description: string, effort: number, expectedImpact: number, confidence: number): ActionCandidate {
    return { id: genId(), type, description, effort, expected_impact: expectedImpact, confidence, prerequisites: [], risks: [] };
  }
}
