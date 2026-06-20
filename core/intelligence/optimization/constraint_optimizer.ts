// GroIntel INT-5 — Constraint Optimizer
import { OptimizationOption, OptimizationConstraint } from "./optimization_types";

export class ConstraintOptimizer {
  apply(options: OptimizationOption[], budgetLimit = 100, timeLimit = 120, riskTolerance = 60): { feasible: OptimizationOption[]; infeasible: { option: OptimizationOption; reason: string }[] } {
    const feasible: OptimizationOption[] = [];
    const infeasible: { option: OptimizationOption; reason: string }[] = [];

    for (const opt of options) {
      if (opt.cost > budgetLimit) {
        infeasible.push({ option: opt, reason: `Cost ${opt.cost} exceeds budget ${budgetLimit}` });
      } else if (opt.time_days > timeLimit) {
        infeasible.push({ option: opt, reason: `Time ${opt.time_days}d exceeds limit ${timeLimit}d` });
      } else if (opt.risk > riskTolerance) {
        infeasible.push({ option: opt, reason: `Risk ${opt.risk} exceeds tolerance ${riskTolerance}` });
      } else {
        feasible.push(opt);
      }
    }

    return { feasible, infeasible };
  }
}
