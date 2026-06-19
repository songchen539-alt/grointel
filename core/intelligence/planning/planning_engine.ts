// GroIntel INT-2 — Planning Engine (read-only)
import { Plan, PlanGoal, PlanTrace, PlanEvaluation, PlanRisk } from "./planning_types";
import { GoalToPlanMapper } from "./goal_to_plan_mapper";
import { ActionGenerator } from "./action_generator";
import { PathBuilder } from "./path_builder";
import { DependencyResolver } from "./dependency_resolver";
import { ConstraintChecker } from "./constraint_checker";
import { PlanEvaluator } from "./plan_evaluator";

let planCounter = 0;
function genId(): string { return "plan_" + (++planCounter).toString(16).padStart(6, "0"); }
function trId(): string { return "ptrc_" + Math.random().toString(36).slice(2, 10); }

export class PlanningEngine {
  public readonly mapper = new GoalToPlanMapper();
  public readonly actionGen = new ActionGenerator();
  public readonly pathBuilder = new PathBuilder();
  public readonly depResolver = new DependencyResolver();
  public readonly constraintChecker = new ConstraintChecker();
  public readonly evaluator = new PlanEvaluator();

  run(goalName: string, goalDescription: string, priority: number, domains: string[], metrics: string[]): { plan: Plan; trace: PlanTrace } {
    const startTime = new Date();
    const steps: { step: number; action: string; output: string }[] = [];
    const planId = genId();

    // 1. Map goal
    steps.push({ step: 1, action: "map_goal", output: `Mapping goal: ${goalName}` });
    const goal = this.mapper.map(goalName, goalDescription, priority, domains, metrics);

    // 2. Generate actions
    steps.push({ step: 2, action: "generate_actions", output: "Generating 10 action types" });
    const actions = this.actionGen.generate(goal);

    // 3. Build paths
    steps.push({ step: 3, action: "build_paths", output: "Building 4 plan paths" });
    const paths = this.pathBuilder.build(actions);

    // 4. Resolve dependencies
    steps.push({ step: 4, action: "resolve_dependencies", output: "Resolving step dependencies" });
    const deps = this.depResolver.resolve(paths);

    // 5. Check constraints
    steps.push({ step: 5, action: "check_constraints", output: "Checking 6 constraint types" });
    const constraints = this.constraintChecker.check(goal);

    // 6. Evaluate
    steps.push({ step: 6, action: "evaluate_plans", output: "Evaluating feasibility and impact" });
    const evaluation = this.evaluator.evaluate(paths, constraints);

    const plan: Plan = {
      id: planId, goal, paths, dependencies: deps, constraints,
      risks: [], evaluation,
      created_at: new Date().toISOString(),
    };

    const trace: PlanTrace = {
      id: trId(), plan_id: planId, steps,
      started_at: startTime.toISOString(),
      completed_at: new Date().toISOString(),
    };

    return { plan, trace };
  }
}
