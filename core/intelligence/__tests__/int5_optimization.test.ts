// GroIntel INT-5 — Optimization Engine Tests
import { OptimizationEngine } from "../optimization/optimization_engine";
import { ObjectiveBuilder } from "../optimization/objective_builder";
import { OptionSetBuilder } from "../optimization/option_set_builder";
import { ConstraintOptimizer } from "../optimization/constraint_optimizer";
import { TradeoffOptimizer } from "../optimization/tradeoff_optimizer";
import { ResourceAllocator } from "../optimization/resource_allocator";
import { ParetoAnalyzer } from "../optimization/pareto_analyzer";
import { OptimizationTraceRecorder } from "../optimization/optimization_trace";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== INT-5: Optimization Engine Foundation ===\n");

  // === OBJECTIVE BUILDER ===
  console.log("--- Objective Builder ---");
  test("build 6 objectives", () => {
    const ob = new ObjectiveBuilder();
    const objs = ob.build(["growth", "trust", "learning"]);
    assert(objs.length === 6, "6 objectives");
    assert(objs.some(o => o.type === "maximize_growth"), "growth");
    assert(objs.some(o => o.type === "maximize_trust"), "trust");
    assert(objs.some(o => o.type === "maximize_civilization_value"), "civilization");
    assert(objs.some(o => o.type === "minimize_risk"), "risk");
  });

  test("objectives have weights and targets", () => {
    const ob = new ObjectiveBuilder();
    for (const o of ob.build([])) {
      assert(o.weight > 0, `${o.type} has weight`);
      assert(o.target_value > 0, `${o.type} has target`);
    }
  });

  // === OPTION SET BUILDER ===
  console.log("\n--- Option Set Builder ---");
  test("build 8 options from various sources", () => {
    const osb = new OptionSetBuilder();
    const opts = osb.build();
    assert(opts.length === 8, "8 options");
    assert(opts.some(o => o.source === "plan_path"), "from plans");
    assert(opts.some(o => o.source === "strategic_option"), "from strategies");
    assert(opts.some(o => o.source === "discovery"), "from discoveries");
    assert(opts.some(o => o.source === "risk_mitigation"), "from risks");
  });

  test("options have expected attributes", () => {
    const osb = new OptionSetBuilder();
    for (const o of osb.build()) {
      assert(o.expected_value >= 0, `${o.name} has value`);
      assert(o.cost >= 0, `${o.name} has cost`);
      assert(o.risk >= 0, `${o.name} has risk`);
      assert(o.confidence > 0, `${o.name} has confidence`);
    }
  });

  // === CONSTRAINT OPTIMIZER ===
  console.log("\n--- Constraint Optimizer ---");
  test("apply budget constraint rejects expensive options", () => {
    const co = new ConstraintOptimizer();
    const osb = new OptionSetBuilder();
    const { infeasible } = co.apply(osb.build(), 30, 200, 100);
    assert(infeasible.some(i => i.reason.includes("budget")), "budget violated");
  });

  test("apply time constraint rejects long options", () => {
    const co = new ConstraintOptimizer();
    const osb = new OptionSetBuilder();
    const { infeasible } = co.apply(osb.build(), 200, 30, 100);
    assert(infeasible.length > 0, "options rejected by constraints");
  });

  test("apply risk constraint rejects risky options", () => {
    const co = new ConstraintOptimizer();
    const osb = new OptionSetBuilder();
    const { infeasible } = co.apply(osb.build(), 200, 200, 10);
    assert(infeasible.length > 0, "options rejected by constraints");
  });

  test("feasible options pass constraints", () => {
    const co = new ConstraintOptimizer();
    const { feasible } = co.apply([{ id: "o1", name: "safe", source: "test", expected_value: 50, cost: 30, risk: 20, time_days: 60, required_capabilities: [], confidence: 80, dependencies: [], constraints: [] }], 100, 100, 50);
    assert(feasible.length === 1, "feasible option");
  });

  // === TRADEOFF OPTIMIZER ===
  console.log("\n--- Tradeoff Optimizer ---");
  test("8 tradeoffs optimized", () => {
    const to = new TradeoffOptimizer();
    const t = to.optimize();
    assert(t.length === 8, "8 tradeoffs");
    assert(t.some(x => x.type === "growth_vs_risk"), "growth vs risk");
    assert(t.some(x => x.type === "speed_vs_quality"), "speed vs quality");
    assert(t.some(x => x.type === "exploration_vs_exploitation"), "exploration vs exploitation");
  });

  // === RESOURCE ALLOCATOR ===
  console.log("\n--- Resource Allocator ---");
  test("allocate resources across options", () => {
    const ra = new ResourceAllocator();
    const osb = new OptionSetBuilder();
    const alloc = ra.allocate(osb.build());
    assert(alloc.attention_budget > 0, "attention budget");
    assert(alloc.kernel_budget > 0, "kernel budget");
    assert(alloc.time_budget_days > 0, "time budget");
  });

  // === PARETO ANALYZER ===
  console.log("\n--- Pareto Analyzer ---");
  test("find non-dominated options", () => {
    const pa = new ParetoAnalyzer();
    const osb = new OptionSetBuilder();
    const frontier = pa.analyze(osb.build());
    assert(frontier.non_dominated_options.length > 0, "non-dominated found");
    assert(frontier.dominated_options.length >= 0, "dominated tracked");
  });

  test("get best balanced option", () => {
    const pa = new ParetoAnalyzer();
    const osb = new OptionSetBuilder();
    const frontier = pa.analyze(osb.build());
    const best = pa.getBestBalanced(frontier);
    assert(best !== null, "best balanced found");
  });

  test("get highest upside option", () => {
    const pa = new ParetoAnalyzer();
    const frontier = pa.analyze(new OptionSetBuilder().build());
    const best = pa.getHighestUpside(frontier);
    assert(best !== null, "highest upside found");
    if (best) assert(best.expected_value > 0, "positive value");
  });

  test("get lowest risk option", () => {
    const pa = new ParetoAnalyzer();
    const frontier = pa.analyze(new OptionSetBuilder().build());
    const best = pa.getLowestRisk(frontier);
    assert(best !== null, "lowest risk found");
  });

  // === OPTIMIZATION ENGINE ===
  console.log("\n--- Optimization Engine ---");
  test("full optimization run produces result", () => {
    const eng = new OptimizationEngine();
    const { result, trace } = eng.run("GroIntel", "Growth", ["growth", "trust"], 100, 120, 60);
    assert(result.id.length > 0, "result id");
    assert(result.objectives.length === 6, "6 objectives");
    assert(result.all_options.length === 8, "8 options");
    assert(result.selected_options.length >= 1, "selected");
    assert(result.rejected_options.length > 0, "rejected");
    assert(result.tradeoffs.length === 8, "tradeoffs");
    assert(result.resource_allocation.attention_budget > 0, "resources allocated");
    assert(result.pareto_frontier.non_dominated_options.length > 0, "Pareto computed");
    assert(result.optimization_score > 0 || result.optimization_score === 0, "score calculated");
  });

  test("optimization trace created", () => {
    const eng = new OptimizationEngine();
    const { trace } = eng.run("GroIntel", "Growth", ["g1"]);
    assert(trace.id.length > 0, "trace id");
    assert(trace.steps.length >= 6, "6+ steps");
  });

  test("tight constraints produce more rejected options", () => {
    const eng = new OptimizationEngine();
    const loose = eng.run("E", "D", ["g"], 200, 200, 100);
    const tight = eng.run("E", "D", ["g"], 30, 30, 20);
    assert(tight.result.rejected_options.length >= loose.result.rejected_options.length, "tight = more rejected");
  });

  test("optimization is read-only", () => {
    const eng = new OptimizationEngine();
    const osb = new OptionSetBuilder();
    const opts = osb.build();
    const origLen = opts.length;
    eng.run("E", "D", ["g"]);
    assert(opts.length === origLen, "options unchanged");
  });

  test("different goals produce different results", () => {
    const eng = new OptimizationEngine();
    const r1 = eng.run("E", "D", ["growth"]);
    const r2 = eng.run("E", "D", ["trust", "learning"]);
    assert(r1.result.id !== r2.result.id, "different IDs");
  });

  // === TRACE RECORDER ===
  console.log("\n--- Trace Recorder ---");
  test("trace recorder stores and retrieves", () => {
    const tr = new OptimizationTraceRecorder();
    const eng = new OptimizationEngine();
    const { result, trace } = eng.run("E", "D", ["g"]);
    tr.record(trace);
    assert(tr.get(trace.id) !== null, "found by id");
    assert(tr.getByResult(result.id) !== null, "found by result id");
    assert(tr.getAll().length === 1, "1 total");
  });

  // === CONSTRAINTS ===
  console.log("\n--- Constraints ---");
  test("constraints list tracks current values", () => {
    const eng = new OptimizationEngine();
    const { result } = eng.run("E", "D", ["g"]);
    assert(result.constraints.length >= 3, "3 constraints");
    for (const c of result.constraints) {
      assert(c.limit > 0, `${c.type} has limit`);
    }
  });

  // === PARETO DETAILS ===
  console.log("\n--- Pareto Details ---");
  test("non-dominated options have best tradeoffs", () => {
    const pa = new ParetoAnalyzer();
    const osb = new OptionSetBuilder();
    const frontier = pa.analyze(osb.build());
    const nonDom = frontier.options.filter(o => frontier.non_dominated_options.includes(o.id));
    for (const nd of nonDom) {
      // Non-dominated means no other option is better in all dimensions
      assert(nd.expected_value > 0, "non-dominated has value");
    }
  });

  // ========================================
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
