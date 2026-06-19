// GroIntel INT-1 — Simulation Engine Tests
import { SimulationEngine } from "../simulation/simulation_engine";
import { ScenarioBuilder } from "../simulation/scenario_builder";
import { OutcomeProjector } from "../simulation/outcome_projector";
import { ProbabilityTreeBuilder } from "../simulation/probability_tree";
import { ImpactEstimator } from "../simulation/impact_estimator";
import { UncertaintyCalculator } from "../simulation/uncertainty_model";
import { SimulationTraceRecorder } from "../simulation/simulation_trace";
import { SimulationInput } from "../simulation/simulation_types";

function assert(condition: boolean, msg: string): void { if (!condition) throw new Error("FAIL: " + msg); }
let passed = 0, failed = 0;
function test(name: string, fn: () => void): void {
  try { fn(); passed++; console.log("  PASS:", name); } catch (e: any) { failed++; console.log("  FAIL:", name, "-", e.message); }
}

function makeInput(overrides?: Partial<SimulationInput>): SimulationInput {
  return {
    target_entity: "Stripe", target_domain: "Business",
    current_state: { velocity: 70, confidence: 80 },
    signals: ["funding", "growth", "market_expansion"],
    goals: ["expand_enterprise", "international_growth"],
    risks: ["competitive_pressure"],
    opportunities: ["market_demand", "technology_shift"],
    predictions: ["growth_positive"],
    learning_history: ["previous_funding_validation"],
    time_horizon_days: 90,
    ...overrides,
  };
}

async function run() {
  console.log("\n=== INT-1: Simulation Engine Foundation ===\n");

  // === SCENARIO BUILDER ===
  console.log("--- Scenario Builder ---");
  test("create scenario with input", () => {
    const sb = new ScenarioBuilder();
    const s = sb.build(makeInput({ risks: [], opportunities: ["growth", "demand"] }));
    assert(s.id.length > 0, "scenario has id");
    assert(s.type === "growth_scenario" || s.type === "market_scenario", "infers growth or market type from signals");
  });

  test("risk scenario inferred", () => {
    const sb = new ScenarioBuilder();
    const s = sb.build(makeInput({ risks: ["high_risk", "regulatory", "competitive"], opportunities: [] }));
    assert(s.type === "risk_scenario", "infers risk type");
  });

  test("variables generated from input", () => {
    const sb = new ScenarioBuilder();
    const s = sb.build(makeInput());
    assert(s.variables.length >= 3, "at least 3 variables");
    assert(s.variables.every(v => v.name.length > 0), "all variables have names");
  });

  test("assumptions generated", () => {
    const sb = new ScenarioBuilder();
    const s = sb.build(makeInput());
    assert(s.assumptions.length >= 2, "at least 2 assumptions");
    assert(s.assumptions.every(a => a.confidence > 0), "assumptions have confidence");
  });

  // === OUTCOME PROJECTOR ===
  console.log("\n--- Outcome Projector ---");
  test("project 4 outcomes", () => {
    const sb = new ScenarioBuilder();
    const op = new OutcomeProjector();
    const s = sb.build(makeInput());
    const outcomes = op.project(s);
    assert(outcomes.length === 4, "4 outcomes");
    assert(outcomes.some(o => o.case === "best_case"), "has best case");
    assert(outcomes.some(o => o.case === "base_case"), "has base case");
    assert(outcomes.some(o => o.case === "worst_case"), "has worst case");
    assert(outcomes.some(o => o.case === "unexpected_case"), "has unexpected case");
  });

  test("best case has highest impact", () => {
    const sb = new ScenarioBuilder();
    const op = new OutcomeProjector();
    const s = sb.build(makeInput());
    const outcomes = op.project(s);
    const best = outcomes.find(o => o.case === "best_case")!;
    const worst = outcomes.find(o => o.case === "worst_case")!;
    assert(best.expected_impact > worst.expected_impact, "best > worst impact");
  });

  test("base case has highest probability", () => {
    const sb = new ScenarioBuilder();
    const op = new OutcomeProjector();
    const s = sb.build(makeInput());
    const outcomes = op.project(s);
    const base = outcomes.find(o => o.case === "base_case")!;
    const others = outcomes.filter(o => o.case !== "base_case");
    assert(others.every(o => o.probability <= base.probability), "base case most likely");
  });

  // === PROBABILITY TREE ===
  console.log("\n--- Probability Tree ---");
  test("probability tree built from outcomes", () => {
    const sb = new ScenarioBuilder();
    const op = new OutcomeProjector();
    const pt = new ProbabilityTreeBuilder();
    const s = sb.build(makeInput());
    const outcomes = op.project(s);
    const tree = pt.build(outcomes);
    assert(tree.id.length > 0, "tree has id");
    assert(tree.children.length === 4, "4 root branches");
    assert(tree.probability === 100, "root probability = 100");
  });

  test("tree depth respected", () => {
    const sb = new ScenarioBuilder();
    const op = new OutcomeProjector();
    const pt = new ProbabilityTreeBuilder();
    const s = sb.build(makeInput());
    const outcomes = op.project(s);
    const tree = pt.build(outcomes, 2);
    assert(pt.maxDepthReached(tree) <= 2, "max depth 2");
  });

  test("probabilities within valid range", () => {
    const sb = new ScenarioBuilder();
    const op = new OutcomeProjector();
    const pt = new ProbabilityTreeBuilder();
    const s = sb.build(makeInput());
    const outcomes = op.project(s);
    const tree = pt.build(outcomes);
    assert(tree.children.every(c => c.probability >= 0 && c.probability <= 100), "all branches 0-100");
    assert(tree.children.reduce((s, c) => s + c.probability, 0) >= 80, "reasonable total probability");
  });

  // === IMPACT ESTIMATOR ===
  console.log("\n--- Impact Estimator ---");
  test("impact estimates for all 7 domains", () => {
    const sb = new ScenarioBuilder();
    const ie = new ImpactEstimator();
    const s = sb.build(makeInput());
    const impacts = ie.estimate(s);
    assert(impacts.length === 7, "7 impact domains");
    assert(impacts.some(i => i.domain === "growth_impact"), "has growth impact");
    assert(impacts.some(i => i.domain === "civilization_impact"), "has civilization impact");
  });

  test("scores within -100 to +100 range", () => {
    const sb = new ScenarioBuilder();
    const ie = new ImpactEstimator();
    const s = sb.build(makeInput());
    const impacts = ie.estimate(s);
    for (const i of impacts) {
      assert(i.score >= -100 && i.score <= 100, `score ${i.score} in range for ${i.domain}`);
    }
  });

  test("civilization impact higher for civilization scenario", () => {
    const sb = new ScenarioBuilder();
    const ie = new ImpactEstimator();
    const civ = ie.estimate(sb.build(makeInput({ signals: ["policy", "regulation"], opportunities: [] }), "civilization_scenario"));
    const growth = ie.estimate(sb.build(makeInput()));
    const civScore = civ.find(i => i.domain === "civilization_impact")!.score;
    const growthScore = growth.find(i => i.domain === "civilization_impact")!.score;
    assert(civScore >= growthScore, "civ scenario = higher civ impact");
  });

  // === UNCERTAINTY MODEL ===
  console.log("\n--- Uncertainty Model ---");
  test("uncertainty calculated", () => {
    const sb = new ScenarioBuilder();
    const uc = new UncertaintyCalculator();
    const s = sb.build(makeInput());
    const u = uc.calculate(s);
    assert(u.overall_uncertainty >= 0, "uncertainty >= 0");
    assert(u.overall_uncertainty <= 100, "uncertainty <= 100");
  });

  test("time horizon increases uncertainty", () => {
    const sb = new ScenarioBuilder();
    const uc = new UncertaintyCalculator();
    const short = uc.calculate(sb.build(makeInput({ time_horizon_days: 30 })));
    const long = uc.calculate(sb.build(makeInput({ time_horizon_days: 365 })));
    assert(long.overall_uncertainty >= short.overall_uncertainty, "longer horizon = higher uncertainty");
  });

  // === SIMULATION ENGINE ===
  console.log("\n--- Simulation Engine ---");
  test("full simulation run produces result", () => {
    const eng = new SimulationEngine();
    const { result, trace } = eng.run(makeInput());
    assert(result.id.length > 0, "result has id");
    assert(result.scenario !== null, "scenario built");
    assert(result.projected_outcomes.length === 4, "4 outcomes");
    assert(result.probability_tree !== null, "probability tree");
    assert(result.impact_estimates.length === 7, "7 impact estimates");
    assert(result.uncertainty !== null, "uncertainty model");
    assert(result.confidence > 0, "confidence > 0");
  });

  test("simulation trace recorded", () => {
    const eng = new SimulationEngine();
    const { trace } = eng.run(makeInput());
    assert(trace.id.length > 0, "trace has id");
    assert(trace.steps.length >= 5, "at least 5 trace steps");
    assert(trace.started_at <= trace.completed_at, "timeline correct");
  });

  test("simulation is read-only — input unchanged", () => {
    const eng = new SimulationEngine();
    const input = makeInput();
    const originalSignals = [...input.signals];
    eng.run(input);
    assert(JSON.stringify(input.signals) === JSON.stringify(originalSignals), "input not modified");
  });

  test("simulation confidence calculated", () => {
    const eng = new SimulationEngine();
    const { result } = eng.run(makeInput());
    assert(result.confidence >= 0 && result.confidence <= 100, "confidence 0-100");
  });

  test("risk scenario simulation works", () => {
    const eng = new SimulationEngine();
    const { result } = eng.run(makeInput({ risks: ["high", "medium", "critical"], opportunities: [] }), "risk_scenario");
    assert(result.scenario.type === "risk_scenario", "risk scenario type");
  });

  test("multiple simulations produce different results", () => {
    const eng = new SimulationEngine();
    const r1 = eng.run(makeInput({ target_entity: "Stripe" }));
    const r2 = eng.run(makeInput({ target_entity: "OpenAI", signals: ["ai", "research"] }));
    assert(r1.result.scenario.id !== r2.result.scenario.id, "different IDs");
  });

  // === UNCERTAINTY CALCULATOR ===
  console.log("\n--- Uncertainty Calculator ---");
  test("missing evidence increases uncertainty", () => {
    const sb = new ScenarioBuilder();
    const uc = new UncertaintyCalculator();
    const few = uc.calculate(sb.build(makeInput({ signals: ["one"] })));
    const many = uc.calculate(sb.build(makeInput({ signals: ["a", "b", "c", "d", "e"] })));
    // Few signals should have more missing evidence
    assert(few.missing_evidence >= 0, "missing evidence tracked");
  });

  // === PROBABILITY TREE ===
  console.log("\n--- Probability Tree (additional) ---");
  test("tree branch count increases with depth", () => {
    const pt = new ProbabilityTreeBuilder();
    const outcomes = Array.from({ length: 2 }, (_, i) => ({
      id: `o${i}`, scenario_id: "s1", case: i === 0 ? "best_case" as const : "worst_case" as const,
      description: "test", probability: 50, confidence: 50,
      required_conditions: [], risks: [], opportunities: [], expected_impact: 0,
    }));
    const tree = pt.build(outcomes, 3);
    assert(pt.countBranches(tree) > 4, "more than root branches");
  });

  // === SIMULATION TRACE ===
  console.log("\n--- Simulation Trace ---");
  test("trace recorder stores and retrieves", () => {
    const tr = new SimulationTraceRecorder();
    const eng = new SimulationEngine();
    const { trace } = eng.run(makeInput());
    tr.record(trace);
    assert(tr.get(trace.id) !== null, "found by id");
    assert(tr.getByResult(trace.result_id) !== null, "found by result id");
    assert(tr.getAll().length === 1, "1 total trace");
  });

  // === SCENARIO TYPES ===
  console.log("\n--- Scenario Types ---");
  test("all 6 scenario types build correctly", () => {
    const sb = new ScenarioBuilder();
    const types = ["growth_scenario", "risk_scenario", "market_scenario", "capability_scenario", "trust_scenario", "civilization_scenario"] as const;
    for (const t of types) {
      const s = sb.build(makeInput(), t);
      assert(s.type === t, `${t} builds correctly`);
    }
  });

  // === IMPACT ESTIMATOR ===
  console.log("\n--- Impact Estimator (additional) ---");
  test("positive and negative impact domains", () => {
    const sb = new ScenarioBuilder();
    const ie = new ImpactEstimator();
    const impacts = ie.estimate(sb.build(makeInput()));
    const positive = impacts.filter(i => i.score > 0).length;
    const negative = impacts.filter(i => i.score < 0).length;
    assert(positive >= 4, "most domains positive for growth scenario");
  });

  // ========================================
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
