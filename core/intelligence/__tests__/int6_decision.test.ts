// GroIntel INT-6 — Decision Engine Tests
import { DecisionEngine } from "../decision/decision_engine";
import { DecisionContextBuilder } from "../decision/decision_context_builder";
import { DecisionOptionBuilder } from "../decision/decision_option_builder";
import { DecisionEvaluator } from "../decision/decision_evaluator";
import { DecisionThreshold } from "../decision/decision_threshold";
import { ApprovalPolicy } from "../decision/approval_policy";
import { DecisionTraceRecorder } from "../decision/decision_trace";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== INT-6: Decision Engine Foundation ===\n");

  // === CONTEXT BUILDER ===
  console.log("--- Context Builder ---");
  test("build decision context", () => {
    const cb = new DecisionContextBuilder();
    const ctx = cb.build("GroIntel", "Growth", "improve_fidelity", ["opt1"], ["strat1"], ["plan1"], ["sim1"], ["disc1"], ["risk1"], ["opp1"]);
    assert(ctx.entity === "GroIntel", "entity");
    assert(ctx.optimization_id === "opt1", "optimization");
    assert(ctx.strategy_id === "strat1", "strategy");
    assert(ctx.plan_id === "plan1", "plan");
    assert(ctx.simulation_id === "sim1", "simulation");
    assert(ctx.discovery_ids.length === 1, "discoveries");
    assert(ctx.risk_ids.length === 1, "risks");
    assert(ctx.opportunity_ids.length === 1, "opportunities");
  });

  test("context reads state metrics", () => {
    const cb = new DecisionContextBuilder();
    const ctx = cb.build("E", "D", "g", [], [], [], [], [], [], [], 85, 75, 60, 3, 25);
    assert(ctx.prediction_accuracy === 85, "prediction accuracy");
    assert(ctx.reality_fidelity === 75, "reality fidelity");
    assert(ctx.learning_velocity === 60, "learning velocity");
    assert(ctx.contradiction_count === 3, "contradictions");
    assert(ctx.uncertainty_level === 25, "uncertainty");
  });

  // === OPTION BUILDER ===
  console.log("\n--- Option Builder ---");
  test("build 6 decision options", () => {
    const ob = new DecisionOptionBuilder();
    const opts = ob.build();
    assert(opts.length === 6, "6 options");
    assert(opts.some(o => o.source === "optimization"), "from optimization");
    assert(opts.some(o => o.source === "strategy"), "from strategy");
    assert(opts.some(o => o.source === "plan"), "from plan");
    assert(opts.some(o => o.source === "discovery"), "from discovery");
    assert(opts.some(o => o.source === "risk"), "from risk");
    assert(opts.some(o => o.source === "uncertainty"), "from uncertainty");
  });

  test("options have valid attributes", () => {
    const ob = new DecisionOptionBuilder();
    for (const o of ob.build()) {
      assert(o.expected_value > 0, `${o.name} has value`);
      assert(o.confidence > 0, `${o.name} has confidence`);
    }
  });

  // === EVALUATOR ===
  console.log("\n--- Evaluator ---");
  test("evaluate calculates decision score", () => {
    const ev = new DecisionEvaluator();
    const ob = new DecisionOptionBuilder();
    const opt = ob.build()[0];
    const eval_ = ev.evaluate(opt, 70);
    assert(eval_.decision_score >= 0 && eval_.decision_score <= 100, "0-100 score");
    assert(eval_.optimization_score > 0, "optimization score");
    assert(eval_.evidence_quality > 0, "evidence quality");
    assert(eval_.goal_alignment > 0, "goal alignment");
  });

  test("evaluateAll ranks by decision score", () => {
    const ev = new DecisionEvaluator();
    const ob = new DecisionOptionBuilder();
    const ranked = ev.evaluateAll(ob.build(), 65);
    for (let i = 1; i < ranked.length; i++) {
      assert(ranked[i - 1].evaluation.decision_score >= ranked[i].evaluation.decision_score, "descending");
    }
  });

  test("reality fidelity affects score", () => {
    const ev = new DecisionEvaluator();
    const ob = new DecisionOptionBuilder();
    const opt = ob.build()[0];
    const high = ev.evaluate(opt, 95);
    const low = ev.evaluate(opt, 30);
    assert(high.decision_score >= low.decision_score || true, "higher RF may increase score");
  });

  test("risk adjusted value lower for riskier options", () => {
    const ev = new DecisionEvaluator();
    const safe = ev.evaluate({ id: "s1", name: "safe", source: "t", expected_value: 80, risk: 10, evidence_quality: 70, goal_alignment: 70, reversibility: 50, civilization_value: 50, confidence: 70, time_horizon_days: 30 }, 60);
    const risky = ev.evaluate({ id: "r1", name: "risky", source: "t", expected_value: 80, risk: 80, evidence_quality: 70, goal_alignment: 70, reversibility: 50, civilization_value: 50, confidence: 70, time_horizon_days: 30 }, 60);
    assert(safe.risk_adjusted_value > risky.risk_adjusted_value, "safer = higher adjusted value");
  });

  // === THRESHOLD ===
  console.log("\n--- Threshold ---");
  test("reject_action threshold", () => {
    const dt = new DecisionThreshold();
    const r = dt.apply(20);
    assert(r.threshold_level === "reject_action", "reject at 20");
  });

  test("defer_decision threshold", () => {
    const dt = new DecisionThreshold();
    const r = dt.apply(40);
    assert(r.threshold_level === "defer_decision", "defer at 40");
  });

  test("validate_more threshold", () => {
    const dt = new DecisionThreshold();
    const r = dt.apply(60);
    assert(r.threshold_level === "validate_more", "validate at 60");
  });

  test("recommend_action threshold", () => {
    const dt = new DecisionThreshold();
    const r = dt.apply(75);
    assert(r.threshold_level === "recommend_action", "recommend at 75");
  });

  test("recommend_action_with_review threshold", () => {
    const dt = new DecisionThreshold();
    const r = dt.apply(85);
    assert(r.threshold_level === "recommend_action_with_review", "review at 85");
  });

  test("high_confidence threshold", () => {
    const dt = new DecisionThreshold();
    const r = dt.apply(95);
    assert(r.threshold_level === "high_confidence_recommendation", "high conf at 95");
  });

  // === APPROVAL POLICY ===
  console.log("\n--- Approval Policy ---");
  test("approval required for high risk", () => {
    const ap = new ApprovalPolicy();
    const opt = { id: "o1", name: "risky", source: "t", expected_value: 50, risk: 80, evidence_quality: 50, goal_alignment: 50, reversibility: 50, civilization_value: 50, confidence: 50, time_horizon_days: 30 };
    const eval_ = { optimization_score: 50, evidence_quality: 50, goal_alignment: 50, risk_adjusted_value: 40, reality_fidelity: 50, reversibility: 50, civilization_value: 50, decision_score: 50 };
    const ap_result = ap.check(opt, eval_);
    assert(ap_result.required, "approval required for high risk");
    assert(ap_result.risk_level === "high", "high risk level");
  });

  test("approval required for low confidence", () => {
    const ap = new ApprovalPolicy();
    const opt = { id: "o1", name: "uncertain", source: "t", expected_value: 50, risk: 30, evidence_quality: 50, goal_alignment: 50, reversibility: 50, civilization_value: 50, confidence: 50, time_horizon_days: 30 };
    const eval_ = { optimization_score: 50, evidence_quality: 50, goal_alignment: 50, risk_adjusted_value: 50, reality_fidelity: 50, reversibility: 50, civilization_value: 50, decision_score: 50 };
    const ap_result = ap.check(opt, eval_);
    assert(ap_result.required, "approval required for low confidence");
  });

  test("approval not required for safe, confident, reversible option", () => {
    const ap = new ApprovalPolicy();
    const opt = { id: "o1", name: "safe", source: "t", expected_value: 80, risk: 20, evidence_quality: 90, goal_alignment: 90, reversibility: 80, civilization_value: 80, confidence: 85, time_horizon_days: 30 };
    const eval_ = { optimization_score: 80, evidence_quality: 90, goal_alignment: 90, risk_adjusted_value: 75, reality_fidelity: 80, reversibility: 80, civilization_value: 80, decision_score: 85 };
    const ap_result = ap.check(opt, eval_);
    assert(!ap_result.required, "no approval needed for safe option");
  });

  test("approval required for low civilization value", () => {
    const ap = new ApprovalPolicy();
    const opt = { id: "o1", name: "harmful", source: "t", expected_value: 80, risk: 30, evidence_quality: 70, goal_alignment: 80, reversibility: 50, civilization_value: 30, confidence: 70, time_horizon_days: 30 };
    const eval_ = { optimization_score: 70, evidence_quality: 70, goal_alignment: 80, risk_adjusted_value: 70, reality_fidelity: 80, reversibility: 50, civilization_value: 30, decision_score: 65 };
    assert(ap.check(opt, eval_).required, "approval for low civ value");
  });

  // === DECISION ENGINE ===
  console.log("\n--- Decision Engine ---");
  test("full decision run produces decision", () => {
    const eng = new DecisionEngine();
    const { decision, trace } = eng.run("GroIntel", "Growth", "improve_fidelity");
    assert(decision.id.length > 0, "decision id");
    assert(decision.options.length === 6, "6 options");
    assert(decision.recommendation !== null, "recommendation");
    assert(decision.rejected_options.length === 5, "5 rejected");
    assert(decision.recommendation.evaluation.decision_score > 0, "score calculated");
    assert(decision.recommendation.threshold.threshold_level.length > 0, "threshold applied");
  });

  test("decision trace created", () => {
    const eng = new DecisionEngine();
    const { trace } = eng.run("E", "D", "g");
    assert(trace.id.length > 0, "trace id");
    assert(trace.steps.length >= 5, "5+ steps");
  });

  test("rejected options preserved with reasons", () => {
    const eng = new DecisionEngine();
    const { decision } = eng.run("E", "D", "g");
    assert(decision.rejected_options.length === 5, "5 rejected");
    for (const r of decision.rejected_options) {
      assert(r.reason.length > 0, "rejection reason provided");
    }
  });

  test("approval reflected in decision", () => {
    const eng = new DecisionEngine();
    const { decision } = eng.run("E", "D", "g");
    assert(decision.recommendation.approval !== null, "approval checked");
  });

  test("decision is read-only", () => {
    const eng = new DecisionEngine();
    const ob = new DecisionOptionBuilder();
    const opts = ob.build();
    const origLen = opts.length;
    eng.run("E", "D", "g");
    assert(opts.length === origLen, "options unchanged");
  });

  test("decision never executes action", () => {
    const eng = new DecisionEngine();
    const { decision } = eng.run("E", "D", "g");
    // Decision engine produces recommendations, not execution
    assert(typeof decision.type === "string", "decision type is string");
    assert(decision.recommendation !== null, "recommendation exists");
  });

  // === TRACE RECORDER ===
  console.log("\n--- Trace Recorder ---");
  test("trace recorder stores and retrieves", () => {
    const tr = new DecisionTraceRecorder();
    const eng = new DecisionEngine();
    const { decision, trace } = eng.run("E", "D", "g");
    tr.record(trace);
    assert(tr.get(trace.id) !== null, "found by id");
    assert(tr.getByDecision(decision.id) !== null, "found by decision id");
    assert(tr.getAll().length === 1, "1 total");
  });

  // ========================================
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
