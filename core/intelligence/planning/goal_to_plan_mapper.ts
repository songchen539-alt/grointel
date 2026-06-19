// GroIntel INT-2 — Goal to Plan Mapper
import { PlanGoal } from "./planning_types";

let pgCounter = 0;
function genId(): string { return "pg_" + (++pgCounter).toString(16).padStart(6, "0"); }

export class GoalToPlanMapper {
  map(goalName: string, goalDescription: string, priority: number, domains: string[], metrics: string[]): PlanGoal {
    return {
      id: genId(),
      source_goal_id: goalName.toLowerCase().replace(/\s+/g, "_"),
      description: `Plan to: ${goalDescription}`,
      desired_state: { goal_name: goalName, progress_target: 80 },
      success_metrics: metrics.length > 0 ? metrics : ["progress > 80%", "confidence > 70%"],
      constraints: domains.map(d => `must operate within ${d} domain`),
      priority,
      time_horizon_days: 90,
    };
  }
}
