// GroIntel INT-1 — Simulation Engine (read-only)
import { SimulationInput, SimulationResult, SimulationTrace, ScenarioType } from "./simulation_types";
import { ScenarioBuilder } from "./scenario_builder";
import { OutcomeProjector } from "./outcome_projector";
import { ProbabilityTreeBuilder } from "./probability_tree";
import { ImpactEstimator } from "./impact_estimator";
import { UncertaintyCalculator } from "./uncertainty_model";

let simCounter = 0;
function genId(): string { return "sim_" + (++simCounter).toString(16).padStart(6, "0"); }
function trId(): string { return "trc_" + Math.random().toString(36).slice(2, 10); }

export class SimulationEngine {
  public readonly scenarioBuilder = new ScenarioBuilder();
  public readonly outcomeProjector = new OutcomeProjector();
  public readonly probabilityTree = new ProbabilityTreeBuilder();
  public readonly impactEstimator = new ImpactEstimator();
  public readonly uncertainty = new UncertaintyCalculator();

  run(input: SimulationInput, scenarioType?: ScenarioType): { result: SimulationResult; trace: SimulationTrace } {
    const traceSteps: { step: number; action: string; output: string }[] = [];
    const startTime = new Date();
    const resultId = genId();

    // 1. Build scenario
    traceSteps.push({ step: 1, action: "build_scenario", output: `Building ${scenarioType || "auto"} scenario` });
    const scenario = this.scenarioBuilder.build(input, scenarioType);

    // 2. Project outcomes
    traceSteps.push({ step: 2, action: "project_outcomes", output: "Projecting 4 outcome cases" });
    const outcomes = this.outcomeProjector.project(scenario);

    // 3. Build probability tree
    traceSteps.push({ step: 3, action: "build_probability_tree", output: `Tree with ${outcomes.length} root branches` });
    const tree = this.probabilityTree.build(outcomes, 3);

    // 4. Estimate impact
    traceSteps.push({ step: 4, action: "estimate_impact", output: "Estimating across 7 impact domains" });
    const impacts = this.impactEstimator.estimate(scenario);

    // 5. Calculate uncertainty
    traceSteps.push({ step: 5, action: "calculate_uncertainty", output: "Modeling uncertainty from variables, evidence, time horizon" });
    const uncertaintyModel = this.uncertainty.calculate(scenario);

    // 6. Calculate overall confidence
    const avgAssumptionConf = scenario.assumptions.reduce((s, a) => s + a.confidence, 0) / Math.max(1, scenario.assumptions.length);
    const confidence = Math.round(avgAssumptionConf * 0.6 + (100 - uncertaintyModel.overall_uncertainty) * 0.4);

    const result: SimulationResult = {
      id: resultId,
      scenario,
      projected_outcomes: outcomes,
      probability_tree: tree,
      impact_estimates: impacts,
      uncertainty: uncertaintyModel,
      confidence,
      evidence_nodes: input.signals,
      created_at: new Date().toISOString(),
    };

    const trace: SimulationTrace = {
      id: trId(),
      result_id: resultId,
      steps: traceSteps,
      started_at: startTime.toISOString(),
      completed_at: new Date().toISOString(),
    };

    return { result, trace };
  }
}
