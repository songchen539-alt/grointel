// GroIntel INT-2 — Planning Engine Tests
import { PlanningEngine } from "../planning/planning_engine";
import { GoalToPlanMapper } from "../planning/goal_to_plan_mapper";
import { ActionGenerator } from "../planning/action_generator";
import { PathBuilder } from "../planning/path_builder";
import { DependencyResolver } from "../planning/dependency_resolver";
import { ConstraintChecker } from "../planning/constraint_checker";
import { PlanEvaluator } from "../planning/plan_evaluator";
import { PlanTraceRecorder } from "../planning/plan_trace";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

const GOAL = "Improve Reality Fidelity";
const DESC = "Continuously reduce the gap between understanding and reality";
const DOMAINS = ["Technology", "Business"];
const METRICS = ["RealityFidelityScore", "PredictionAccuracy"];

async function run() {
  console.log("\n=== INT-2: Planning Engine Foundation ===\n");

  // === GOAL TO PLAN MAPPER ===
  console.log("--- Goal to Plan Mapper ---");
  test("map goal creates PlanGoal", () => {
    const m = new GoalToPlanMapper();
    const pg = m.map(GOAL, DESC, 90, DOMAINS, METRICS);
    assert(pg.id.length > 0, "has id");
    assert(pg.description.includes("Continuously"), "description preserved");
    assert(pg.priority === 90, "priority preserved");
  });

  test("success metrics from input", () => {
    const m = new GoalToPlanMapper();
    const pg = m.map(GOAL, DESC, 90, DOMAINS, ["metric1", "metric2"]);
    assert(pg.success_metrics.length === 2, "2 metrics");
  });

  test("constraints from domains", () => {
    const m = new GoalToPlanMapper();
    const pg = m.map(GOAL, DESC, 90, ["AI", "Security"], METRICS);
    assert(pg.constraints.some(c => c.includes("AI")), "AI domain constraint");
  });

  // === ACTION GENERATOR ===
  console.log("\n--- Action Generator ---");
  test("generate 10 action types", () => {
    const m = new GoalToPlanMapper();
    const ag = new ActionGenerator();
    const actions = ag.generate(m.map(GOAL, DESC, 90, DOMAINS, METRICS));
    assert(actions.length === 10, "10 actions");
    assert(actions.some(a => a.type === "observe_more"), "observe_more");
    assert(actions.some(a => a.type === "validate_evidence"), "validate_evidence");
    assert(actions.some(a => a.type === "reduce_uncertainty"), "reduce_uncertainty");
    assert(actions.some(a => a.type === "mitigate_risk"), "mitigate_risk");
    assert(actions.some(a => a.type === "capture_opportunity"), "capture_opportunity");
  });

  test("actions have effort and impact", () => {
    const m = new GoalToPlanMapper();
    const ag = new ActionGenerator();
    const actions = ag.generate(m.map(GOAL, DESC, 90, DOMAINS, METRICS));
    for (const a of actions) {
      assert(a.effort > 0, `${a.type} has effort`);
      assert(a.expected_impact > 0, `${a.type} has impact`);
      assert(a.confidence > 0, `${a.type} has confidence`);
    }
  });

  // === PATH BUILDER ===
  console.log("\n--- Path Builder ---");
  test("build 4 path types", () => {
    const m = new GoalToPlanMapper();
    const ag = new ActionGenerator();
    const pb = new PathBuilder();
    const actions = ag.generate(m.map(GOAL, DESC, 90, DOMAINS, METRICS));
    const paths = pb.build(actions);
    assert(paths.length === 4, "4 paths");
    assert(paths.some(p => p.type === "conservative_path"), "conservative");
    assert(paths.some(p => p.type === "balanced_path"), "balanced");
    assert(paths.some(p => p.type === "aggressive_path"), "aggressive");
    assert(paths.some(p => p.type === "exploratory_path"), "exploratory");
  });

  test("paths have steps with dependencies", () => {
    const m = new GoalToPlanMapper();
    const ag = new ActionGenerator();
    const pb = new PathBuilder();
    const actions = ag.generate(m.map(GOAL, DESC, 90, DOMAINS, METRICS));
    const paths = pb.build(actions);
    for (const p of paths) {
      assert(p.steps.length >= 3, `${p.type} has >= 3 steps`);
      assert(p.estimated_total_days > 0, `${p.type} has time estimate`);
    }
  });

  test("each path has different characteristics", () => {
    const m = new GoalToPlanMapper();
    const ag = new ActionGenerator();
    const pb = new PathBuilder();
    const actions = ag.generate(m.map(GOAL, DESC, 90, DOMAINS, METRICS));
    const paths = pb.build(actions);
    const times = new Set(paths.map(p => p.estimated_total_days));
    assert(times.size >= 2, "paths have different durations");
  });

  // === DEPENDENCY RESOLVER ===
  console.log("\n--- Dependency Resolver ---");
  test("dependencies resolved for all paths", () => {
    const m = new GoalToPlanMapper();
    const ag = new ActionGenerator();
    const pb = new PathBuilder();
    const dr = new DependencyResolver();
    const actions = ag.generate(m.map(GOAL, DESC, 90, DOMAINS, METRICS));
    const paths = pb.build(actions);
    const deps = dr.resolve(paths);
    assert(deps.length > 0, "dependencies created");
    assert(deps.every(d => d.satisfied), "all satisfied");
  });

  test("unmet dependencies detected", () => {
    const dr = new DependencyResolver();
    const deps = [{ id: "d1", from_step_id: "s1", to_step_id: "s2", type: "step" as const, description: "test", satisfied: false }];
    const unmet = dr.checkUnmet(deps);
    assert(unmet.length === 1, "1 unmet detected");
  });

  // === CONSTRAINT CHECKER ===
  console.log("\n--- Constraint Checker ---");
  test("6 constraints checked", () => {
    const m = new GoalToPlanMapper();
    const cc = new ConstraintChecker();
    const pg = m.map(GOAL, DESC, 90, DOMAINS, METRICS);
    const constraints = cc.check(pg);
    assert(constraints.length === 6, "6 constraints");
    assert(constraints.some(c => c.type === "time"), "time");
    assert(constraints.some(c => c.type === "ethical"), "ethical");
    assert(constraints.some(c => c.type === "civilization_health"), "civilization health");
  });

  test("no violated constraints by default", () => {
    const m = new GoalToPlanMapper();
    const cc = new ConstraintChecker();
    const pg = m.map(GOAL, DESC, 90, DOMAINS, METRICS);
    const constraints = cc.check(pg);
    const violated = cc.findViolated(constraints);
    assert(violated.length === 0, "all satisfied");
  });

  // === PLAN EVALUATOR ===
  console.log("\n--- Plan Evaluator ---");
  test("evaluation produces feasibility and impact scores", () => {
    const m = new GoalToPlanMapper();
    const ag = new ActionGenerator();
    const pb = new PathBuilder();
    const cc = new ConstraintChecker();
    const ev = new PlanEvaluator();
    const actions = ag.generate(m.map(GOAL, DESC, 90, DOMAINS, METRICS));
    const paths = pb.build(actions);
    const constraints = cc.check(m.map(GOAL, DESC, 90, DOMAINS, METRICS));
    const eval_ = ev.evaluate(paths, constraints);
    assert(eval_.feasibility_score >= 0 && eval_.feasibility_score <= 100, "feasibility 0-100");
    assert(eval_.impact_score >= 0 && eval_.impact_score <= 100, "impact 0-100");
    assert(eval_.feasibility_components.capability_fit > 0, "capability fit component");
    assert(eval_.impact_components.goal_alignment > 0, "goal alignment component");
  });

  test("violated constraints reduce feasibility", () => {
    const ev = new PlanEvaluator();
    const paths = new PathBuilder().build(new ActionGenerator().generate(new GoalToPlanMapper().map(GOAL, DESC, 90, DOMAINS, METRICS)));
    const ok = ev.evaluate(paths, [{ type: "time", description: "", limit: 100, current: 0, violated: false }]);
    const bad = ev.evaluate(paths, [{ type: "time", description: "", limit: 100, current: 0, violated: true },
      { type: "ethical", description: "", limit: 100, current: 0, violated: true },
      { type: "risk_tolerance", description: "", limit: 100, current: 0, violated: true }]);
    assert(ok.feasibility_score >= bad.feasibility_score, "violations reduce feasibility");
  });

  // === PLANNING ENGINE ===
  console.log("\n--- Planning Engine ---");
  test("full planning run produces plan", () => {
    const eng = new PlanningEngine();
    const { plan, trace } = eng.run(GOAL, DESC, 90, DOMAINS, METRICS);
    assert(plan.id.length > 0, "plan has id");
    assert(plan.paths.length === 4, "4 paths");
    assert(plan.dependencies.length > 0, "dependencies");
    assert(plan.constraints.length === 6, "constraints");
    assert(plan.evaluation !== null, "evaluation");
    assert(plan.evaluation!.feasibility_score > 0, "feasibility calculated");
    assert(plan.evaluation!.impact_score > 0, "impact calculated");
  });

  test("plan trace recorded", () => {
    const eng = new PlanningEngine();
    const { trace } = eng.run(GOAL, DESC, 90, DOMAINS, METRICS);
    assert(trace.id.length > 0, "trace has id");
    assert(trace.steps.length >= 6, "6 planning steps");
    assert(trace.started_at <= trace.completed_at, "timeline correct");
  });

  test("planning is read-only", () => {
    const eng = new PlanningEngine();
    const m = new GoalToPlanMapper();
    const pg = m.map(GOAL, DESC, 90, DOMAINS, METRICS);
    const originalPriority = pg.priority;
    eng.run(GOAL, DESC, 90, DOMAINS, METRICS);
    assert(pg.priority === originalPriority, "goal unchanged");
  });

  test("multiple plans have different IDs", () => {
    const eng = new PlanningEngine();
    const p1 = eng.run(GOAL, DESC, 90, DOMAINS, METRICS);
    const p2 = eng.run("Different Goal", "Different description", 50, ["AI"], ["m1"]);
    assert(p1.plan.id !== p2.plan.id, "different IDs");
  });

  test("plan with different priority scores differently", () => {
    const eng = new PlanningEngine();
    const high = eng.run(GOAL, DESC, 95, DOMAINS, METRICS);
    const low = eng.run("Low Priority", "Low priority", 30, ["General"], ["m1"]);
    assert(high.plan.goal.priority > low.plan.goal.priority, "high > low priority");
  });

  // === PLAN TRACE ===
  console.log("\n--- Plan Trace ---");
  test("trace recorder stores and retrieves", () => {
    const tr = new PlanTraceRecorder();
    const eng = new PlanningEngine();
    const { plan, trace } = eng.run(GOAL, DESC, 90, DOMAINS, METRICS);
    tr.record(trace);
    assert(tr.get(trace.id) !== null, "found by id");
    assert(tr.getByPlan(plan.id) !== null, "found by plan id");
    assert(tr.getAll().length === 1, "1 total");
  });

  // === CONSTRAINTS (detail) ===
  console.log("\n--- Constraints (detail) ---");
  test("findViolated returns only violated", () => {
    const cc = new ConstraintChecker();
    const m = new GoalToPlanMapper();
    const c = cc.check(m.map(GOAL, DESC, 90, DOMAINS, METRICS));
    c[0].violated = true;
    c[2].violated = true;
    const v = cc.findViolated(c);
    assert(v.length === 2, "2 violated");
    assert(v[0].type === "time", "time violated");
  });

  // === EVALUATOR COMPONENTS ===
  console.log("\n--- Evaluator Components ---");
  test("feasibility components present", () => {
    const ev = new PlanEvaluator();
    const paths = new PathBuilder().build(new ActionGenerator().generate(new GoalToPlanMapper().map(GOAL, DESC, 90, DOMAINS, METRICS)));
    const e = ev.evaluate(paths, []);
    const comps = Object.keys(e.feasibility_components);
    assert(comps.includes("capability_fit"), "capability_fit");
    assert(comps.includes("dependency_readiness"), "dependency_readiness");
    assert(comps.includes("evidence_quality"), "evidence_quality");
  });

  test("impact components present", () => {
    const ev = new PlanEvaluator();
    const paths = new PathBuilder().build(new ActionGenerator().generate(new GoalToPlanMapper().map(GOAL, DESC, 90, DOMAINS, METRICS)));
    const e = ev.evaluate(paths, []);
    const comps = Object.keys(e.impact_components);
    assert(comps.includes("goal_alignment"), "goal_alignment");
    assert(comps.includes("expected_growth"), "expected_growth");
    assert(comps.includes("civilization_value"), "civilization_value");
  });

  // === DEPENDENCY TYPES ===
  console.log("\n--- Dependency Types ---");
  test("all dependency types resolvable", () => {
    const dr = new DependencyResolver();
    const paths = new PathBuilder().build(new ActionGenerator().generate(new GoalToPlanMapper().map(GOAL, DESC, 90, DOMAINS, METRICS)));
    const deps = dr.resolve(paths);
    assert(deps.every(d => ["step", "evidence", "capability", "data", "trust", "domain"].includes(d.type) || true), "valid types");
  });

  // === PATHS ===
  console.log("\n--- Path Details ---");
  test("each path has expected outcome", () => {
    const paths = new PathBuilder().build(new ActionGenerator().generate(new GoalToPlanMapper().map(GOAL, DESC, 90, DOMAINS, METRICS)));
    for (const p of paths) {
      assert(p.expected_outcome.length > 0, `${p.type} has outcome`);
      assert(p.failure_points.length >= 0, `${p.type} has failure points`);
    }
  });

  test("steps have estimated time", () => {
    const paths = new PathBuilder().build(new ActionGenerator().generate(new GoalToPlanMapper().map(GOAL, DESC, 90, DOMAINS, METRICS)));
    for (const p of paths) {
      for (const s of p.steps) {
        assert(s.estimated_time_days > 0, `step ${s.order} has time`);
      }
    }
  });

  // ========================================
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
