// GroIntel INT-5 — Optimization Engine (read-only)
import { OptimizationResult, OptimizationTrace } from "./optimization_types";
import { ObjectiveBuilder } from "./objective_builder";
import { OptionSetBuilder } from "./option_set_builder";
import { ConstraintOptimizer } from "./constraint_optimizer";
import { TradeoffOptimizer } from "./tradeoff_optimizer";
import { ResourceAllocator } from "./resource_allocator";
import { ParetoAnalyzer } from "./pareto_analyzer";

let optCounter = 0;
function genId(): string { return "optres_" + (++optCounter).toString(16).padStart(6, "0"); }
function trId(): string { return "optrc_" + Math.random().toString(36).slice(2, 10); }

export class OptimizationEngine {
  public readonly objBuilder = new ObjectiveBuilder();
  public readonly optSetBuilder = new OptionSetBuilder();
  public readonly constraintOpt = new ConstraintOptimizer();
  public readonly tradeoffOpt = new TradeoffOptimizer();
  public readonly resourceAlloc = new ResourceAllocator();
  public readonly paretoAnalyzer = new ParetoAnalyzer();

  run(entity: string, domain: string, goalNames: string[], budgetLimit = 100, timeLimit = 120, riskTolerance = 60): { result: OptimizationResult; trace: OptimizationTrace } {
    const steps: { step: number; action: string; output: string }[] = [];
    const resultId = genId();

    // 1. Build objectives
    steps.push({ step: 1, action: "build_objectives", output: "Building 6 optimization objectives" });
    const objectives = this.objBuilder.build(goalNames);

    // 2. Build options
    steps.push({ step: 2, action: "build_options", output: "Building optimization option set" });
    const allOptions = this.optSetBuilder.build();

    // 3. Apply constraints
    steps.push({ step: 3, action: "apply_constraints", output: `Applying budget=${budgetLimit}, time=${timeLimit}, risk=${riskTolerance}` });
    const { feasible, infeasible } = this.constraintOpt.apply(allOptions, budgetLimit, timeLimit, riskTolerance);

    // 4. Optimize tradeoffs
    steps.push({ step: 4, action: "optimize_tradeoffs", output: "Optimizing 8 tradeoff dimensions" });
    const tradeoffs = this.tradeoffOpt.optimize();

    // 5. Allocate resources
    steps.push({ step: 5, action: "allocate_resources", output: `Allocating resources across ${feasible.length} feasible options` });
    const resources = this.resourceAlloc.allocate(feasible);

    // 6. Analyze Pareto frontier
    steps.push({ step: 6, action: "analyze_pareto", output: `Pareto frontier: ${feasible.length} options analyzed` });
    const frontier = this.paretoAnalyzer.analyze(feasible);

    // 7. Select and rank
    const bestBalanced = this.paretoAnalyzer.getBestBalanced(frontier);
    const selected = bestBalanced ? [bestBalanced] : [];
    const rejected = infeasible.map(item => ({ option: item.option, reason: item.reason }));
    // Also reject feasible options that are dominated
    for (const opt of feasible) {
      if (!selected.some(s => s.id === opt.id)) {
        rejected.push({ option: opt, reason: "Dominated by Pareto frontier analysis" });
      }
    }

    const optScore = bestBalanced ? Math.round(bestBalanced.expected_value * 0.4 + (100 - bestBalanced.risk) * 0.3 + bestBalanced.confidence * 0.3) : 0;
    const constraints = [
      { type: "budget", description: `Maximum budget: ${budgetLimit}`, limit: budgetLimit, current: feasible.reduce((s, o) => s + o.cost, 0), violated: false },
      { type: "time", description: `Maximum timeline: ${timeLimit} days`, limit: timeLimit, current: Math.max(...feasible.map(o => o.time_days), 0), violated: false },
      { type: "risk_tolerance", description: `Maximum risk: ${riskTolerance}`, limit: riskTolerance, current: Math.round(feasible.reduce((s, o) => s + o.risk, 0) / Math.max(1, feasible.length)), violated: false },
    ];

    const result: OptimizationResult = {
      id: resultId, target_entity: entity, target_domain: domain,
      objectives, all_options: allOptions, selected_options: selected, rejected_options: rejected,
      constraints, tradeoffs, resource_allocation: resources, pareto_frontier: frontier,
      optimization_score: optScore, confidence: bestBalanced?.confidence || 0,
      created_at: new Date().toISOString(),
    };

    const trace: OptimizationTrace = {
      id: trId(), result_id: resultId, steps,
      created_at: new Date().toISOString(),
    };

    return { result, trace };
  }
}
