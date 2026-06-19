// GroIntel INT-2 — Dependency Resolver
import { PlanPath, PlanDependency } from "./planning_types";

let depCounter = 0;
function genId(): string { return "dep_" + (++depCounter).toString(16).padStart(6, "0"); }

export class DependencyResolver {
  resolve(paths: PlanPath[]): PlanDependency[] {
    const deps: PlanDependency[] = [];

    for (const path of paths) {
      for (let i = 1; i < path.steps.length; i++) {
        const prev = path.steps[i - 1];
        const curr = path.steps[i];
        deps.push({ id: genId(), from_step_id: prev.id, to_step_id: curr.id, type: "step", description: `${prev.action.type} → ${curr.action.type}`, satisfied: true });
      }
    }

    return deps;
  }

  checkUnmet(deps: PlanDependency[]): PlanDependency[] {
    return deps.filter(d => !d.satisfied);
  }
}
