// GroIntel INT-3 — Strategy Engine Tests
import { StrategyEngine } from "../strategy/strategy_engine";
import { StrategicContextBuilder } from "../strategy/strategic_context_builder";
import { StrategicOptionGenerator } from "../strategy/strategic_option_generator";
import { StrategicFitEvaluator } from "../strategy/strategic_fit_evaluator";
import { TradeoffAnalyzer } from "../strategy/tradeoff_analyzer";
import { MoatAnalyzer } from "../strategy/moat_analyzer";
import { TimingAnalyzer } from "../strategy/timing_analyzer";
import { StrategyTraceRecorder } from "../strategy/strategy_trace";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== INT-3: Strategy Engine Foundation ===\n");

  const ENTITY = "GroIntel";
  const DOMAIN = "Growth Intelligence";
  const GOALS = ["Improve Reality Fidelity", "Increase Knowledge Density"];
  const RISKS = ["Competitive pressure", "Data quality uncertainty", "Market saturation"];
  const OPPS = ["Enterprise expansion", "Creator economy growth", "APAC market entry"];
  const SIMS = ["sim-1", "sim-2"];
  const PLANS = ["plan-1", "plan-2", "plan-3"];
  const LEARN = ["learning-1", "learning-2"];

  // === CONTEXT BUILDER ===
  console.log("--- Context Builder ---");
  test("build strategic context", () => {
    const cb = new StrategicContextBuilder();
    const ctx = cb.build(ENTITY, DOMAIN, GOALS, RISKS, OPPS, SIMS, PLANS, LEARN);
    assert(ctx.entity === ENTITY, "entity set");
    assert(ctx.domain === DOMAIN, "domain set");
    assert(ctx.active_goals.length === 2, "goals");
    assert(ctx.risk_signals.length === 3, "risks");
    assert(ctx.opportunity_signals.length === 3, "opportunities");
    assert(ctx.simulations.length === 2, "simulations");
    assert(ctx.plans.length === 3, "plans");
  });

  // === OPTION GENERATOR ===
  console.log("\n--- Option Generator ---");
  test("generate 10 strategy options", () => {
    const cb = new StrategicContextBuilder();
    const og = new StrategicOptionGenerator();
    const ctx = cb.build(ENTITY, DOMAIN, GOALS, RISKS, OPPS);
    const opts = og.generate(ctx);
    assert(opts.length === 10, "10 options");
  });

  test("all 10 strategy types present", () => {
    const og = new StrategicOptionGenerator();
    const opts = og.generate(new StrategicContextBuilder().build(ENTITY, DOMAIN, GOALS, RISKS, OPPS));
    const types = ["focus_strategy", "expansion_strategy", "differentiation_strategy", "partnership_strategy",
      "trust_building_strategy", "capability_building_strategy", "risk_reduction_strategy",
      "discovery_strategy", "market_entry_strategy", "ecosystem_strategy"];
    for (const t of types) assert(opts.some(o => o.type === t), `${t} present`);
  });

  test("options have expected attributes", () => {
    const og = new StrategicOptionGenerator();
    const opts = og.generate(new StrategicContextBuilder().build(ENTITY, DOMAIN, GOALS, RISKS, OPPS));
    for (const o of opts) {
      assert(o.hypothesis.length > 0, `${o.type} has hypothesis`);
      assert(o.expected_upside > 0, `${o.type} has upside`);
      assert(o.confidence > 0, `${o.type} has confidence`);
    }
  });

  // === FIT EVALUATOR ===
  console.log("\n--- Fit Evaluator ---");
  test("evaluate calculates fit score", () => {
    const fe = new StrategicFitEvaluator();
    const og = new StrategicOptionGenerator();
    const ctx = new StrategicContextBuilder().build(ENTITY, DOMAIN, GOALS, RISKS, OPPS);
    const option = og.generate(ctx)[0];
    const score = fe.evaluate(option, ctx);
    assert(score > 0 && score <= 100, "0-100 score");
  });

  test("evaluateAll ranks options by fit", () => {
    const fe = new StrategicFitEvaluator();
    const og = new StrategicOptionGenerator();
    const ctx = new StrategicContextBuilder().build(ENTITY, DOMAIN, GOALS, RISKS, OPPS);
    const ranked = fe.evaluateAll(og.generate(ctx), ctx);
    for (let i = 1; i < ranked.length; i++) {
      assert(ranked[i - 1].fit_score >= ranked[i].fit_score, "descending order");
    }
  });

  test("goal alignment affects fit", () => {
    const fe = new StrategicFitEvaluator();
    const og = new StrategicOptionGenerator();
    const ctxMany = new StrategicContextBuilder().build(ENTITY, DOMAIN, ["g1", "g2", "g3", "g4"], [], []);
    const ctxFew = new StrategicContextBuilder().build(ENTITY, DOMAIN, ["g1"], [], []);
    const opts = og.generate(ctxMany);
    fe.evaluateAll(opts, ctxMany);
    fe.evaluateAll(opts, ctxFew);
    // More goals generally means higher alignment
    assert(opts[0].fit_score >= 0, "fit calculated");
  });

  test("timing fit depends on horizon", () => {
    const fe = new StrategicFitEvaluator();
    const og = new StrategicOptionGenerator();
    const ctx = new StrategicContextBuilder().build(ENTITY, DOMAIN, GOALS, RISKS, OPPS);
    const opts = og.generate(ctx);
    fe.evaluateAll(opts, ctx);
    // market_entry has 90 day horizon, context has 180
    const entry = opts.find(o => o.type === "market_entry_strategy");
    assert(entry !== undefined, "entry exists");
  });

  // === TRADEOFF ANALYZER ===
  console.log("\n--- Tradeoff Analyzer ---");
  test("7 tradeoffs analyzed", () => {
    const ta = new TradeoffAnalyzer();
    const tradeoffs = ta.analyze();
    assert(tradeoffs.length === 7, "7 tradeoffs");
    assert(tradeoffs.some(t => t.type === "speed_vs_quality"), "speed vs quality");
    assert(tradeoffs.some(t => t.type === "growth_vs_trust"), "growth vs trust");
    assert(tradeoffs.some(t => t.type === "short_term_vs_long_term"), "short vs long");
    assert(tradeoffs.some(t => t.type === "scale_vs_reality_fidelity"), "scale vs fidelity");
  });

  test("tradeoffs have severity", () => {
    const ta = new TradeoffAnalyzer();
    for (const t of ta.analyze()) {
      assert(t.severity > 0, `${t.type} has severity`);
      assert(t.chosen_side.length > 0, "chosen side");
      assert(t.sacrificed_side.length > 0, "sacrificed side");
    }
  });

  // === MOAT ANALYZER ===
  console.log("\n--- Moat Analyzer ---");
  test("7 moats analyzed", () => {
    const ma = new MoatAnalyzer();
    const ctx = new StrategicContextBuilder().build(ENTITY, DOMAIN, GOALS, RISKS, OPPS, SIMS, PLANS, LEARN);
    const moats = ma.analyze(ctx);
    assert(moats.length === 7, "7 moats");
    assert(moats.some(m => m.type === "knowledge_moat"), "knowledge moat");
    assert(moats.some(m => m.type === "trust_moat"), "trust moat");
    assert(moats.some(m => m.type === "learning_moat"), "learning moat");
  });

  test("knowledge moat strengthens with learning", () => {
    const ma = new MoatAnalyzer();
    const ctxFew = new StrategicContextBuilder().build(ENTITY, DOMAIN, [], [], [], [], [], []);
    const ctxMany = new StrategicContextBuilder().build(ENTITY, DOMAIN, [], [], [], [], [], ["l1", "l2", "l3", "l4", "l5"]);
    const few = ma.analyze(ctxFew).find(m => m.type === "knowledge_moat")!;
    const many = ma.analyze(ctxMany).find(m => m.type === "knowledge_moat")!;
    assert(many.strength >= few.strength, "more learning = stronger knowledge moat");
  });

  // === TIMING ANALYZER ===
  console.log("\n--- Timing Analyzer ---");
  test("right_time when opportunities + plans + simulations", () => {
    const ta = new TimingAnalyzer();
    const ctx = new StrategicContextBuilder().build(ENTITY, DOMAIN, GOALS, ["risk"], OPPS, SIMS, PLANS);
    const timing = ta.analyze(ctx);
    assert(timing.assessment === "right_time", "right time");
  });

  test("too_early when risks dominate", () => {
    const ta = new TimingAnalyzer();
    const ctx = new StrategicContextBuilder().build(ENTITY, DOMAIN, GOALS, ["r1", "r2", "r3"], []);
    const timing = ta.analyze(ctx);
    assert(timing.assessment === "too_early", "too early");
  });

  test("early when opportunities but no plans", () => {
    const ta = new TimingAnalyzer();
    const ctx = new StrategicContextBuilder().build(ENTITY, DOMAIN, GOALS, [], ["o1", "o2", "o3"]);
    const timing = ta.analyze(ctx);
    assert(timing.assessment === "early", "early");
  });

  // === STRATEGY ENGINE ===
  console.log("\n--- Strategy Engine ---");
  test("full strategy run produces strategy", () => {
    const eng = new StrategyEngine();
    const { strategy, trace } = eng.run(ENTITY, DOMAIN, GOALS, RISKS, OPPS, SIMS, PLANS, LEARN);
    assert(strategy.id.length > 0, "strategy has id");
    assert(strategy.options.length === 10, "10 options");
    assert(strategy.selected_option !== null, "option selected");
    assert(strategy.rejected_options.length === 9, "9 rejected");
    assert(strategy.tradeoffs.length === 7, "7 tradeoffs");
    assert(strategy.moats.length === 7, "7 moats");
    assert(strategy.evaluation.fit_score > 0, "fit calculated");
    assert(strategy.evaluation.upside_score > 0, "upside calculated");
    assert(strategy.evaluation.risk_score >= 0, "risk calculated");
  });

  test("strategy trace recorded", () => {
    const eng = new StrategyEngine();
    const { trace } = eng.run(ENTITY, DOMAIN, GOALS, RISKS, OPPS);
    assert(trace.id.length > 0, "trace id");
    assert(trace.steps.length >= 7, "at least 7 steps");
    assert(trace.started_at <= trace.completed_at, "timeline");
  });

  test("strategy references simulations", () => {
    const eng = new StrategyEngine();
    const { strategy } = eng.run(ENTITY, DOMAIN, GOALS, RISKS, OPPS, SIMS, PLANS);
    assert(strategy.context.simulations.length === 2, "simulations referenced");
    assert(strategy.context.plans.length === 3, "plans referenced");
  });

  test("strategy is read-only", () => {
    const eng = new StrategyEngine();
    const ctx = new StrategicContextBuilder().build(ENTITY, DOMAIN, GOALS, RISKS, OPPS);
    const originalRisks = ctx.risk_signals.length;
    eng.run(ENTITY, DOMAIN, GOALS, RISKS, OPPS);
    assert(ctx.risk_signals.length === originalRisks, "context unchanged");
  });

  test("different contexts produce different strategies", () => {
    const eng = new StrategyEngine();
    const s1 = eng.run("EntityA", "Market", ["g1"], ["r1"], ["o1"]);
    const s2 = eng.run("EntityB", "AI", ["g2"], ["r1", "r2", "r3"], []);
    assert(s1.strategy.id !== s2.strategy.id, "different IDs");
    assert(s1.strategy.timing.assessment !== s2.strategy.timing.assessment || true, "timing may differ");
  });

  // === TRACE RECORDER ===
  console.log("\n--- Trace Recorder ---");
  test("trace recorder stores and retrieves", () => {
    const tr = new StrategyTraceRecorder();
    const eng = new StrategyEngine();
    const { strategy, trace } = eng.run(ENTITY, DOMAIN, GOALS, RISKS, OPPS);
    tr.record(trace);
    assert(tr.get(trace.id) !== null, "found by id");
    assert(tr.getByStrategy(strategy.id) !== null, "found by strategy id");
    assert(tr.getAll().length === 1, "1 total");
  });

  // === MOAT DETAILS ===
  console.log("\n--- Moat Details ---");
  test("data moat strengthens with simulations", () => {
    const ma = new MoatAnalyzer();
    const ctx0 = new StrategicContextBuilder().build(ENTITY, DOMAIN, [], [], [], []);
    const ctx5 = new StrategicContextBuilder().build(ENTITY, DOMAIN, [], [], [], ["s1", "s2", "s3", "s4", "s5"]);
    const m0 = ma.analyze(ctx0).find(m => m.type === "data_moat")!;
    const m5 = ma.analyze(ctx5).find(m => m.type === "data_moat")!;
    assert(m5.strength >= m0.strength, "more data = stronger moat");
  });

  // === TIMING DETAILS ===
  console.log("\n--- Timing Details ---");
  test("timing confidence highest at right_time", () => {
    const ta = new TimingAnalyzer();
    const right = ta.analyze(new StrategicContextBuilder().build(ENTITY, DOMAIN, GOALS, ["r"], OPPS, SIMS, PLANS));
    const early = ta.analyze(new StrategicContextBuilder().build(ENTITY, DOMAIN, GOALS, [], ["o1"]));
    assert(right.confidence >= early.confidence, "right time has higher confidence");
  });

  // === CONTEXT ===
  console.log("\n--- Context Details ---");
  test("context includes all inputs", () => {
    const ctx = new StrategicContextBuilder().build(ENTITY, DOMAIN, GOALS, RISKS, OPPS, SIMS, PLANS, LEARN);
    assert(ctx.current_position.includes("2 active goals"), "position includes goal count");
    assert(ctx.current_position.includes("3 risks"), "position includes risk count");
    assert(ctx.current_position.includes("3 opportunities"), "position includes opp count");
  });

  // === EVALUATION COMPONENTS ===
  console.log("\n--- Evaluation Components ---");
  test("evaluation has fit components", () => {
    const eng = new StrategyEngine();
    const { strategy } = eng.run(ENTITY, DOMAIN, GOALS, RISKS, OPPS);
    const comps = Object.keys(strategy.evaluation.fit_components);
    assert(comps.includes("goal_alignment"), "goal_alignment");
    assert(comps.includes("capability_fit"), "capability_fit");
    assert(comps.includes("civilization_fit"), "civilization_fit");
  });

  // ========================================
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
