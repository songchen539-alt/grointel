// GroIntel RWS-2 — Goal Engine
import { GoalRegistry } from "./goal_registry";
import { Goal, GoalProgress } from "./goal_types";
import { GoalEvaluator } from "./goal_evaluator";

export class GoalEngine {
  private registry: GoalRegistry;
  private evaluator: GoalEvaluator;

  constructor() {
    this.registry = new GoalRegistry();
    this.evaluator = new GoalEvaluator();
  }

  getRegistry(): GoalRegistry { return this.registry; }

  getActiveGoals(): Goal[] { return this.registry.getRanked(); }

  getGoalsForDomain(domain: string): Goal[] {
    return this.registry.getByDomain(domain);
  }

  evaluateGoalProgress(goalId: string): GoalProgress {
    const goal = this.registry.get(goalId);
    if (!goal) return { goal_id: goalId, current_progress: 0, trend: 0, confidence: 0, blocked_by: [], next_action: "goal not found" };
    return this.evaluator.evaluate(goal);
  }

  mapGoalsToAttention(domain: string): Goal[] {
    return this.registry.getByDomain(domain).filter(g => g.status === "active");
  }

  getTopGoals(limit = 5): Goal[] {
    return this.registry.getRanked().slice(0, limit);
  }
}
