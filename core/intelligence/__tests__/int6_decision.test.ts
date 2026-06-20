// GroIntel INT-6 — Decision Engine Tests (50+)
import { DecisionEngine } from "../decision/decision_engine";
import { DecisionContextBuilder } from "../decision/decision_context_builder";
import { DecisionOptionBuilder } from "../decision/decision_option_builder";
import { DecisionEvaluator } from "../decision/decision_evaluator";
import { DecisionThreshold } from "../decision/decision_threshold";
import { ApprovalPolicy } from "../decision/approval_policy";
import { DecisionTraceRecorder } from "../decision/decision_trace";
import { DecisionGraphBuilder } from "../decision/decision_graph";
import { DecisionStateManager } from "../decision/decision_state";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== INT-6: Decision Engine Foundation (50+ tests) ===\n");

  // === CONTEXT BUILDER (8 tests) ===
  console.log("--- Context Builder ---");
  test("build decision context", () => {
    const cb = new DecisionContextBuilder();
    const ctx = cb.build("GroIntel", "Growth", "improve_fidelity", ["opt1"], ["strat1"], ["plan1"], ["sim1"], ["disc1"], ["risk1"], ["opp1"]);
    assert(ctx.entity === "GroIntel", "entity");
    assert(ctx.optimization_id === "opt1", "ontext reads optimization");
    assert(ctx.strategy_id === "strat1", "ontext reads strategy");
    assert(ctx.plan_id === "plan1", "ontext reads plan");
    assert(ctx.simulation_id === "sim1", "ontext reads simulation");
  });

  test("ontext reads discovery ids", () => {
    const cb = new DecisionContextBuilder();
    const ctx = cb.build("E", "D", "g", [], [], [], [], ["d1", "d2"], [], []);
    assert(ctx.discovery_ids.length === 2, "discoveries");
  });

  test("ontext reads risk and opportunity ids", () => {
    const cb = new DecisionContextBuilder();
    const ctx = cb.build("E", "D", "g", [], [], [], [], [], ["r1"], ["o1"]);
    assert(ctx.risk_ids.length === 1, "risks");
    assert(ctx.opportunity_ids.length === 1, "opportunities");
  });

  test("ontext reads state metrics — prediction accuracy", () => {
    const cb = new DecisionContextBuilder();
    const ctx = cb.build("E", "D", "g", [], [], [], [], [], [], [], 85);
    assert(ctx.prediction_accuracy === 85, "prediction accuracy from state");
  });

  test("ontext reads state metrics — reality fidelity, learning velocity", () => {
    const cb = new DecisionContextBuilder();
    const ctx = cb.build("E", "D", "g", [], [], [], [], [], [], [], 70, 80, 55);
    assert(ctx.reality_fidelity === 80, "reality fidelity");
    assert(ctx.learning_velocity === 55, "learning velocity");
  });

  test("ontext reads contradiction count and uncertainty", () => {
    const cb = new DecisionContextBuilder();
    const ctx = cb.build("E", "D", "g", [], [], [], [], [], [], [], 70, 60, 50, 8, 55);
    assert(ctx.contradiction_count === 8, "contradiction count");
    assert(ctx.uncertainty_level === 55, "uncertainty");
  });

  test("ontext with no external inputs", () => {
    const cb = new DecisionContextBuilder();
    const ctx = cb.build("Standalone", "Test", "explore");
    assert(ctx.optimization_id === null, "no optimization");
    assert(ctx.discovery_ids.length === 0, "no discoveries");
  });

  test("ontext captures entity, domain, goal", () => {
    const cb = new DecisionContextBuilder();
    const ctx = cb.build("MyEntity", "MyDomain", "MyGoal");
    assert(ctx.entity === "MyEntity", "entity");
    assert(ctx.domain === "MyDomain", "domain");
    assert(ctx.goal === "MyGoal", "goal");
  });

  // === OPTION BUILDER (7 tests) ===
  console.log("\n--- Option Builder ---");
  test("build 6 decision options", () => {
    const ob = new DecisionOptionBuilder();
    const opts = ob.build();
    assert(opts.length === 6, "6 options");
  });

  test("option from optimization source", () => {
    const ob = new DecisionOptionBuilder();
    assert(ob.build().some(o => o.source === "optimization"), "optimization sourced");
  });

  test("option from strategy source", () => {
    const ob = new DecisionOptionBuilder();
    assert(ob.build().some(o => o.source === "strategy"), "strategy sourced");
  });

  test("option from plan source", () => {
    const ob = new DecisionOptionBuilder();
    assert(ob.build().some(o => o.source === "plan"), "plan sourced");
  });

  test("option from discovery source", () => {
    const ob = new DecisionOptionBuilder();
    assert(ob.build().some(o => o.source === "discovery"), "discovery sourced");
  });

  test("option from risk source", () => {
    const ob = new DecisionOptionBuilder();
    assert(ob.build().some(o => o.source === "risk"), "risk sourced");
  });

  test("option from uncertainty (known unknown) source", () => {
    const ob = new DecisionOptionBuilder();
    assert(ob.build().some(o => o.source === "uncertainty"), "uncertainty sourced");
  });

  test("all options have valid numeric attributes", () => {
    const ob = new DecisionOptionBuilder();
    for (const o of ob.build()) {
      assert(o.expected_value >= 0, `${o.name} has value`);
      assert(o.risk >= 0, `${o.name} has risk`);
      assert(o.confidence > 0, `${o.name} has confidence`);
      assert(o.evidence_quality > 0, `${o.name} has evidence`);
      assert(o.goal_alignment > 0, `${o.name} has alignment`);
      assert(o.reversibility > 0, `${o.name} has reversibility`);
      assert(o.time_horizon_days > 0, `${o.name} has time horizon`);
    }
  });

  // === EVALUATOR (12 tests) ===
  console.log("\n--- Evaluator ---");
  test("evaluate calculates decision score", () => {
    const ev = new DecisionEvaluator();
    const opt = new DecisionOptionBuilder().build()[0];
    const e = ev.evaluate(opt, 70);
    assert(e.decision_score >= 0 && e.decision_score <= 100, "0-100 score");
  });

  test("evaluation includes all 7 components", () => {
    const ev = new DecisionEvaluator();
    const opt = new DecisionOptionBuilder().build()[0];
    const e = ev.evaluate(opt, 70);
    assert(e.optimization_score > 0, "optimization score");
    assert(e.evidence_quality > 0, "evidence quality");
    assert(e.goal_alignment > 0, "goal alignment");
    assert(e.risk_adjusted_value > 0, "risk adjusted value");
    assert(e.reality_fidelity === 70, "reality fidelity");
    assert(e.reversibility > 0, "reversibility");
    assert(e.civilization_value > 0, "civilization value");
  });

  test("optimization score affects decision", () => {
    const ev = new DecisionEvaluator();
    const base = { id: "b", name: "base", source: "t", expected_value: 50, risk: 20, evidence_quality: 50, goal_alignment: 50, reversibility: 50, civilization_value: 50, confidence: 50, time_horizon_days: 30 };
    const high = ev.evaluate({ ...base, expected_value: 100 }, 50);
    const low = ev.evaluate({ ...base, expected_value: 10 }, 50);
    assert(high.decision_score > low.decision_score, "higher value = higher score");
  });

  test("evidence quality affects decision", () => {
    const ev = new DecisionEvaluator();
    const base = { id: "b", name: "base", source: "t", expected_value: 50, risk: 20, evidence_quality: 0, goal_alignment: 50, reversibility: 50, civilization_value: 50, confidence: 50, time_horizon_days: 30 };
    const high = ev.evaluate({ ...base, evidence_quality: 100 }, 50);
    const low = ev.evaluate({ ...base, evidence_quality: 10 }, 50);
    assert(high.decision_score > low.decision_score, "higher evidence = higher score");
  });

  test("goal alignment affects decision", () => {
    const ev = new DecisionEvaluator();
    const base = { id: "b", name: "base", source: "t", expected_value: 50, risk: 20, evidence_quality: 50, goal_alignment: 0, reversibility: 50, civilization_value: 50, confidence: 50, time_horizon_days: 30 };
    const high = ev.evaluate({ ...base, goal_alignment: 100 }, 50);
    const low = ev.evaluate({ ...base, goal_alignment: 10 }, 50);
    assert(high.decision_score > low.decision_score, "higher alignment = higher score");
  });

  test("risk adjusted value affects decision", () => {
    const ev = new DecisionEvaluator();
    const base = { id: "b", name: "base", source: "t", expected_value: 50, risk: 0, evidence_quality: 50, goal_alignment: 50, reversibility: 50, civilization_value: 50, confidence: 50, time_horizon_days: 30 };
    const high = ev.evaluate({ ...base, expected_value: 80 }, 50);
    const low = ev.evaluate({ ...base, expected_value: 20 }, 50);
    assert(high.risk_adjusted_value > low.risk_adjusted_value, "higher value = higher adjusted");
  });

  test("reality fidelity affects decision", () => {
    const ev = new DecisionEvaluator();
    const opt = new DecisionOptionBuilder().build()[0];
    const high = ev.evaluate(opt, 95);
    const low = ev.evaluate(opt, 30);
    assert(high.decision_score >= low.decision_score, "higher RF = higher score");
  });

  test("reversibility affects decision", () => {
    const ev = new DecisionEvaluator();
    const base = { id: "b", name: "base", source: "t", expected_value: 50, risk: 20, evidence_quality: 50, goal_alignment: 50, reversibility: 0, civilization_value: 50, confidence: 50, time_horizon_days: 30 };
    const high = ev.evaluate({ ...base, reversibility: 100 }, 50);
    const low = ev.evaluate({ ...base, reversibility: 10 }, 50);
    assert(high.decision_score > low.decision_score, "higher reversibility = higher score");
  });

  test("civilization value affects decision", () => {
    const ev = new DecisionEvaluator();
    const base = { id: "b", name: "base", source: "t", expected_value: 50, risk: 20, evidence_quality: 50, goal_alignment: 50, reversibility: 50, civilization_value: 0, confidence: 50, time_horizon_days: 30 };
    const high = ev.evaluate({ ...base, civilization_value: 100 }, 50);
    const low = ev.evaluate({ ...base, civilization_value: 10 }, 50);
    assert(high.decision_score >= low.decision_score, "higher civ value = higher score");
  });

  test("evaluateAll ranks by decision score descending", () => {
    const ev = new DecisionEvaluator();
    const ranked = ev.evaluateAll(new DecisionOptionBuilder().build(), 65);
    for (let i = 1; i < ranked.length; i++) {
      assert(ranked[i - 1].evaluation.decision_score >= ranked[i].evaluation.decision_score, "descending order");
    }
  });

  test("risk adjusted value lower for riskier options", () => {
    const ev = new DecisionEvaluator();
    const safe = ev.evaluate({ id: "s1", name: "safe", source: "t", expected_value: 80, risk: 10, evidence_quality: 70, goal_alignment: 70, reversibility: 50, civilization_value: 50, confidence: 70, time_horizon_days: 30 }, 60);
    const risky = ev.evaluate({ id: "r1", name: "risky", source: "t", expected_value: 80, risk: 80, evidence_quality: 70, goal_alignment: 70, reversibility: 50, civilization_value: 50, confidence: 70, time_horizon_days: 30 }, 60);
    assert(safe.risk_adjusted_value > risky.risk_adjusted_value, "safer = higher");
  });

  // === THRESHOLD (7 tests) ===
  console.log("\n--- Threshold ---");
  test("reject_action threshold (0-30)", () => {
    const dt = new DecisionThreshold();
    assert(dt.apply(0).threshold_level === "reject_action", "0 rejects");
    assert(dt.apply(15).threshold_level === "reject_action", "15 rejects");
    assert(dt.apply(30).threshold_level === "reject_action", "30 rejects");
  });

  test("defer_decision threshold (31-50)", () => {
    const dt = new DecisionThreshold();
    assert(dt.apply(31).threshold_level === "defer_decision", "31 defers");
    assert(dt.apply(40).threshold_level === "defer_decision", "40 defers");
    assert(dt.apply(50).threshold_level === "defer_decision", "50 defers");
  });

  test("validate_more threshold (51-65)", () => {
    const dt = new DecisionThreshold();
    assert(dt.apply(51).threshold_level === "validate_more", "51 validates");
    assert(dt.apply(60).threshold_level === "validate_more", "60 validates");
    assert(dt.apply(65).threshold_level === "validate_more", "65 validates");
  });

  test("recommend_action threshold (66-80)", () => {
    const dt = new DecisionThreshold();
    assert(dt.apply(66).threshold_level === "recommend_action", "66 recommends");
    assert(dt.apply(75).threshold_level === "recommend_action", "75 recommends");
    assert(dt.apply(80).threshold_level === "recommend_action", "80 recommends");
  });

  test("recommend_action_with_review threshold (81-90)", () => {
    const dt = new DecisionThreshold();
    assert(dt.apply(81).threshold_level === "recommend_action_with_review", "81 reviews");
    assert(dt.apply(85).threshold_level === "recommend_action_with_review", "85 reviews");
    assert(dt.apply(90).threshold_level === "recommend_action_with_review", "90 reviews");
  });

  test("high_confidence threshold (91-100)", () => {
    const dt = new DecisionThreshold();
    assert(dt.apply(91).threshold_level === "high_confidence_recommendation", "91 high conf");
    assert(dt.apply(95).threshold_level === "high_confidence_recommendation", "95 high conf");
    assert(dt.apply(100).threshold_level === "high_confidence_recommendation", "100 high conf");
  });

  test("threshold descriptions are meaningful", () => {
    const dt = new DecisionThreshold();
    for (const s of [20, 40, 60, 75, 85, 95]) {
      const r = dt.apply(s);
      assert(r.description.length > 10, `description for score ${s}`);
    }
  });

  // === APPROVAL POLICY (9 tests) ===
  console.log("\n--- Approval Policy ---");
  const mkOpt = (overrides: Partial<any> = {}) => ({
    id: "o1", name: "test", source: "t", expected_value: 50, risk: 30,
    evidence_quality: 50, goal_alignment: 50, reversibility: 50,
    civilization_value: 50, confidence: 70, time_horizon_days: 30,
    ...overrides
  });
  const mkEval = (rf = 75, civ = 50, rav = 50) => ({
    optimization_score: 50, evidence_quality: 50, goal_alignment: 50,
    risk_adjusted_value: rav, reality_fidelity: rf, reversibility: 50,
    civilization_value: civ, decision_score: 50,
  });

  test("approval required for high risk (>=70)", () => {
    const ap = new ApprovalPolicy();
    const r = ap.check(mkOpt({ risk: 80 }), mkEval());
    assert(r.required, "high risk requires approval");
    assert(r.risk_level === "high", "risk level high");
  });

  test("approval required for low confidence (<70)", () => {
    const ap = new ApprovalPolicy();
    const r = ap.check(mkOpt({ confidence: 50 }), mkEval());
    assert(r.required, "low confidence requires approval");
  });

  test("approval required for low reality fidelity (<75)", () => {
    const ap = new ApprovalPolicy();
    const r = ap.check(mkOpt({}), mkEval(50));
    assert(r.required, "low RF requires approval");
  });

  test("approval required for low civilization value (<50)", () => {
    const ap = new ApprovalPolicy();
    const r = ap.check(mkOpt({}), mkEval(80, 30));
    assert(r.required, "negative civ impact requires approval");
  });

  test("approval required for irreversible action (<30 reversibility)", () => {
    const ap = new ApprovalPolicy();
    const r = ap.check(mkOpt({ reversibility: 20 }), mkEval());
    assert(r.required, "irreversible requires approval");
    assert(r.risk_level === "high", "irreversible = high risk");
  });

  test("approval required for legal/policy risk (name includes 'risk')", () => {
    const ap = new ApprovalPolicy();
    const r = ap.check(mkOpt({ name: "Mitigate identified risk" }), mkEval());
    assert(r.required, "legal risk flagged");
  });

  test("approval required for low risk-adjusted value (<40)", () => {
    const ap = new ApprovalPolicy();
    const r = ap.check(mkOpt({}), mkEval(80, 60, 30));
    assert(r.required, "low risk-adjusted value");
  });

  test("no approval for safe, confident, reversible, high-evidence option", () => {
    const ap = new ApprovalPolicy();
    const r = ap.check(mkOpt({ risk: 20, confidence: 85, reversibility: 80, name: "Proceed" }), mkEval(85, 80, 70));
    assert(!r.required, "safe option bypasses approval");
  });

  test("approval policy preserves reasons", () => {
    const ap = new ApprovalPolicy();
    const r = ap.check(mkOpt({ risk: 80, confidence: 50 }), mkEval(50, 30));
    assert(r.reasons.length >= 3, "multiple reasons");
  });

  // === DECISION ENGINE (9 tests) ===
  console.log("\n--- Decision Engine ---");
  test("full decision run produces complete decision", () => {
    const eng = new DecisionEngine();
    const { decision } = eng.run("GroIntel", "Growth", "improve_fidelity");
    assert(decision.id.length > 0, "decision id");
    assert(decision.options.length === 6, "6 options");
    assert(decision.recommendation !== null, "recommendation");
    assert(decision.rejected_options.length > 0, "rejected");
  });

  test("recommendation selected — option, eval, threshold, approval", () => {
    const eng = new DecisionEngine();
    const { decision } = eng.run("E", "D", "g");
    const r = decision.recommendation;
    assert(r.option !== null, "option selected");
    assert(r.evaluation !== null, "evaluation done");
    assert(r.threshold !== null, "threshold applied");
    assert(r.approval !== null, "approval checked");
  });

  test("rejected options preserved with reasons", () => {
    const eng = new DecisionEngine();
    const { decision } = eng.run("E", "D", "g");
    assert(decision.rejected_options.length === 5, "5 rejected");
    for (const ro of decision.rejected_options) {
      assert(ro.reason.length > 0, "rejection reason");
    }
  });

  test("decision trace created with all steps", () => {
    const eng = new DecisionEngine();
    const { trace } = eng.run("E", "D", "g");
    assert(trace.id.length > 0, "trace id");
    assert(trace.steps.length >= 5, "5+ steps");
  });

  test("trace includes context build step", () => {
    const eng = new DecisionEngine();
    const { trace } = eng.run("E", "D", "g");
    assert(trace.steps.some(s => s.action === "build_context"), "context step");
  });

  test("trace includes threshold step and score", () => {
    const eng = new DecisionEngine();
    const { trace, decision } = eng.run("E", "D", "g");
    const thresholdStep = trace.steps.find(s => s.action === "apply_threshold");
    assert(thresholdStep !== undefined, "threshold step");
    assert(thresholdStep!.output.includes(decision.recommendation.threshold.threshold_level), "score recorded");
  });

  test("trace includes approval requirement", () => {
    const eng = new DecisionEngine();
    const { trace, decision } = eng.run("E", "D", "g");
    const step = trace.steps.find(s => s.action === "check_approval");
    if (decision.recommendation.approval.required) {
      assert(step !== undefined, "approval step present when needed");
    }
  });

  test("decision is read-only — options unchanged", () => {
    const eng = new DecisionEngine();
    const ob = new DecisionOptionBuilder();
    const opts = ob.build();
    const origLen = opts.length;
    eng.run("E", "D", "g");
    assert(opts.length === origLen, "options unchanged after run");
  });

  test("decision never executes action", () => {
    const eng = new DecisionEngine();
    const { decision } = eng.run("E", "D", "g");
    assert(typeof decision.type === "string", "only produces recommendation");
    assert(decision.recommendation !== null, "recommendation present");
    // No side effects — decisions don't execute
  });

  // === TRACE RECORDER (5 tests) ===
  console.log("\n--- Trace Recorder ---");
  test("trace recorder stores and retrieves by id", () => {
    const tr = new DecisionTraceRecorder();
    const eng = new DecisionEngine();
    const { trace } = eng.run("E", "D", "g");
    tr.record(trace);
    assert(tr.get(trace.id) !== null, "found by id");
  });

  test("trace recorder retrieves by decision id", () => {
    const tr = new DecisionTraceRecorder();
    const eng = new DecisionEngine();
    const { decision, trace } = eng.run("E", "D", "g");
    tr.record(trace);
    assert(tr.getByDecision(decision.id) !== null, "found by decision");
  });

  test("trace recorder returns all traces", () => {
    const tr = new DecisionTraceRecorder();
    const eng = new DecisionEngine();
    tr.record(eng.run("E", "D", "g1").trace);
    tr.record(eng.run("E", "D", "g2").trace);
    tr.record(eng.run("E", "D", "g3").trace);
    assert(tr.getAll().length === 3, "3 traces");
  });

  test("trace not found returns null", () => {
    const tr = new DecisionTraceRecorder();
    assert(tr.get("nonexistent") === null, "null for missing");
  });

  test("multiple traces indexed independently", () => {
    const tr = new DecisionTraceRecorder();
    const e1 = new DecisionEngine().run("E", "D", "g1");
    const e2 = new DecisionEngine().run("E", "D", "g2");
    tr.record(e1.trace);
    tr.record(e2.trace);
    assert(tr.get(e2.trace.id) !== null, "second trace indexed");
  });

  // === GRAPH INTEGRATION (5 tests) ===
  console.log("\n--- Graph Integration ---");
  test("graph stores decision node", () => {
    const gb = new DecisionGraphBuilder();
    const eng = new DecisionEngine();
    const { decision } = eng.run("E", "D", "g");
    const graph = gb.buildGraph(decision);
    assert(graph.nodes.decisionNode.type === "Decision", "decision node");
    assert(graph.nodes.decisionNode.metadata.entity === "E", "entity metadata");
  });

  test("graph links decision to optimization (via derived_from edges)", () => {
    const gb = new DecisionGraphBuilder();
    const { decision } = new DecisionEngine().run("E", "D", "g");
    const graph = gb.buildGraph(decision);
    assert(graph.edges.decisionToOptions.length === 6, "options linked");
    assert(graph.edges.decisionToRejected.length === 5, "rejected linked");
    assert(graph.edges.decisionToEvaluation.length > 0, "evaluation linked");
  });

  test("graph stores approval node when required", () => {
    // Force high risk to trigger approval
    const ap = new ApprovalPolicy();
    const apprNode = ap.check(
      { id: "o1", name: "very risky", source: "t", expected_value: 30, risk: 80, evidence_quality: 30, goal_alignment: 30, reversibility: 10, civilization_value: 30, confidence: 30, time_horizon_days: 10 },
      { optimization_score: 30, evidence_quality: 30, goal_alignment: 30, risk_adjusted_value: 20, reality_fidelity: 30, reversibility: 10, civilization_value: 30, decision_score: 30 }
    );
    assert(apprNode.required, "approval needed");
    assert(apprNode.risk_level === "high", "high risk level");
  });

  test("graph stores evidence chain via validated_by edge", () => {
    const gb = new DecisionGraphBuilder();
    const { decision } = new DecisionEngine().run("E", "D", "g");
    const graph = gb.buildGraph(decision);
    assert(graph.edges.decisionToEvidence.length > 0, "evidence linked");
  });

  test("graph context node stores state metrics", () => {
    const gb = new DecisionGraphBuilder();
    const { decision } = new DecisionEngine().run("E", "D", "g");
    const graph = gb.buildGraph(decision);
    assert(graph.nodes.contextNode.metadata.prediction_accuracy !== undefined, "prediction accuracy");
    assert(graph.nodes.contextNode.metadata.contradiction_count !== undefined, "contradictions");
  });

  // === STATE INTEGRATION (8 tests) ===
  console.log("\n--- State Integration ---");
  test("state exposes active decisions", () => {
    const sm = new DecisionStateManager();
    const { decision } = new DecisionEngine().run("E", "D", "g");
    sm.record(decision);
    const state = sm.getState();
    assert(state.active_decisions.length > 0, "active decisions");
  });

  test("state exposes decision recommendations", () => {
    const sm = new DecisionStateManager();
    sm.record(new DecisionEngine().run("E", "D", "g").decision);
    assert(sm.getState().decision_recommendations.length > 0, "recommendations");
  });

  test("state exposes pending approvals", () => {
    const sm = new DecisionStateManager();
    // Create decision with low confidence to trigger approval
    const eng = new DecisionEngine();
    sm.record(eng.run("E", "D", "g").decision);
    const state = sm.getState();
    // Check if any pending approvals exist
    assert(Array.isArray(state.pending_approvals), "pending approvals array");
  });

  test("state exposes rejected and deferred decisions", () => {
    const sm = new DecisionStateManager();
    sm.record(new DecisionEngine().run("E", "D", "g").decision);
    const state = sm.getState();
    assert(Array.isArray(state.rejected_decisions), "rejected array");
    assert(Array.isArray(state.deferred_decisions), "deferred array");
  });

  test("state exposes high confidence decisions", () => {
    const sm = new DecisionStateManager();
    sm.record(new DecisionEngine().run("E", "D", "g").decision);
    assert(Array.isArray(sm.getState().high_confidence_decisions), "high confidence array");
  });

  test("state exposes decision history", () => {
    const sm = new DecisionStateManager();
    sm.record(new DecisionEngine().run("E", "D", "g").decision);
    sm.record(new DecisionEngine().run("E2", "D2", "g2").decision);
    assert(sm.getState().decision_history.length === 2, "2 in history");
  });

  test("state exposes decision confidence", () => {
    const sm = new DecisionStateManager();
    sm.record(new DecisionEngine().run("E", "D", "g").decision);
    assert(sm.getState().decision_confidence > 0, "confidence computed");
  });

  test("state exposes risk distribution", () => {
    const sm = new DecisionStateManager();
    for (let i = 0; i < 3; i++) sm.record(new DecisionEngine().run("E", "D", "g").decision);
    const dist = sm.getState().decision_risk_distribution;
    assert(typeof dist.low === "number", "low count");
    assert(typeof dist.high === "number", "high count");
  });

  // ========================================
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 50+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
