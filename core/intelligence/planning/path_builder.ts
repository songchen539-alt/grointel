// GroIntel INT-2 — Path Builder
import { ActionCandidate, PlanStep, PlanPath, PathType } from "./planning_types";

let pathCounter = 0;
let stepCounter = 0;
function pid(): string { return "path_" + (++pathCounter).toString(16).padStart(6, "0"); }
function sid(): string { return "step_" + (++stepCounter).toString(16).padStart(6, "0"); }

export class PathBuilder {
  build(actions: ActionCandidate[]): PlanPath[] {
    return [
      this.buildPath(actions, "conservative_path", [0, 1, 2, 6, 8], 90, 45, "Slow but safe progress with high confidence"),
      this.buildPath(actions, "balanced_path", [0, 1, 3, 4, 5, 9], 60, 55, "Moderate progress with balanced risk"),
      this.buildPath(actions, "aggressive_path", [3, 5, 4, 9, 7], 45, 40, "Fast progress but higher risk"),
      this.buildPath(actions, "exploratory_path", [0, 2, 8, 6, 7, 1], 75, 50, "Learning-focused with broad exploration"),
    ];
  }

  private buildPath(actions: ActionCandidate[], type: PathType, indices: number[], time: number, confidence: number, outcome: string): PlanPath {
    // First pass: create step objects without dependencies
    const rawSteps: { id: string; order: number; action: ActionCandidate; estimated_time_days: number }[] = indices.map((idx, order) => ({
      id: sid(), order: order + 1,
      action: actions[idx] || actions[0],
      estimated_time_days: Math.round(time / indices.length),
    }));

    // Second pass: add dependencies and create PlanSteps
    const steps: PlanStep[] = rawSteps.map((rs, i) => ({
      ...rs,
      dependencies: i > 0 ? [rawSteps[i - 1].id] : [],
      status: "pending" as const,
    }));

    return {
      id: pid(), type, steps, estimated_total_days: time,
      expected_outcome: outcome,
      failure_points: steps.filter((_, i) => i > 1).map(s => `Step ${s.order}: ${s.action.description}`),
      confidence,
    };
  }
}
