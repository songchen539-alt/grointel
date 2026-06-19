// GroIntel RWS-2 — Goal Priority Calculator
import { GoalPriorityInput } from "./goal_types";

export function calculateGoalPriority(input: GoalPriorityInput): number {
  return Math.round(
    input.importance * 0.30 +
    input.urgency * 0.20 +
    input.civilization_value * 0.20 +
    input.uncertainty_reduction * 0.15 +
    input.learning_value * 0.15
  );
}
