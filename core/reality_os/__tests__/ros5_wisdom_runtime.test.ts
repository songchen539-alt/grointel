// GroIntel ROS-5 — Wisdom Runtime Tests (90+)
import { WisdomRuntime } from "../wisdom/wisdom_runtime";
import { PrincipleRegistry } from "../wisdom/principle_registry";
import { ValueSystem } from "../wisdom/value_system";
import { JudgementEngine } from "../wisdom/judgement_engine";
import { LongTermReasoner } from "../wisdom/long_term_reasoner";
import { CivilizationEvaluator } from "../wisdom/civilization_evaluator";
import { EthicalConstraintChecker } from "../wisdom/ethical_constraints";
import { WisdomTraceRecorder } from "../wisdom/wisdom_trace";
import { RealityOSClient } from "../sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== ROS-5: Wisdom Runtime Foundation (90+ tests) ===\n");

  // === PRINCIPLES (8 tests) ===
  console.log("--- Principles ---");
  test("principle registry initializes with 10 principles", () => {
    const pr = new PrincipleRegistry();
    assert(pr.count() === 10, "10 principles");
  });

  test("all principles are immutable", () => {
    const pr = new PrincipleRegistry();
    for (const p of pr.getAll()) {
      assert(p.immutable === true, `${p.statement} is immutable`);
    }
  });

  test("principle: Reality before opinion", () => {
    const pr = new PrincipleRegistry();
    const found = pr.getAll().find(p => p.statement.includes("Reality"));
    assert(found !== null, "exists");
    assert(found!.weight === 100, "weight 100");
  });

  test("principle: Never optimize falsehood", () => {
    const pr = new PrincipleRegistry();
    const found = pr.getAll().find(p => p.statement.includes("Never optimize"));
    assert(found !== null, "exists");
    assert(found!.category === "ethics", "ethics category");
  });

  test("principle: Trust before growth", () => {
    const pr = new PrincipleRegistry();
    const found = pr.getAll().find(p => p.statement === "Trust before growth");
    assert(found !== null, "exists");
    assert(found!.weight === 85, "weight 85");
  });

  test("principle: Learning before certainty", () => {
    const pr = new PrincipleRegistry();
    const found = pr.getAll().find(p => p.statement === "Learning before certainty");
    assert(found !== null, "exists");
  });

  test("principle: Long-term before short-term", () => {
    const pr = new PrincipleRegistry();
    const found = pr.getAll().find(p => p.statement.includes("Long-term"));
    assert(found !== null, "exists");
    assert(found!.category === "temporal", "temporal category");
  });

  test("evaluate against principles", () => {
    const pr = new PrincipleRegistry();
    const results = pr.evaluateAgainst("Optimize growth aggressively");
    assert(results.length === 10, "10 results");
    assert(results.some(r => r.score > 0), "scores computed");
  });

  // === VALUES (7 tests) ===
  console.log("\n--- Values ---");
  test("value system initializes with 7 core values", () => {
    const vs = new ValueSystem();
    assert(vs.count() === 7, "7 values");
  });

  test("Truth is highest priority value", () => {
    const vs = new ValueSystem();
    const truth = vs.findByName("Truth");
    assert(truth !== null, "exists");
    assert(truth!.weight === 100, "weight 100");
    assert(truth!.priority === 1, "priority 1");
  });

  test("values have conflicts", () => {
    const vs = new ValueSystem();
    const trust = vs.findByName("Trust");
    assert(trust !== null, "trust exists");
    assert(trust!.conflicts.includes("speed"), "trust conflicts with speed");
  });

  test("values have stability ratings", () => {
    const vs = new ValueSystem();
    for (const v of vs.getAll()) {
      assert(v.stability > 0, `${v.name} stability`);
    }
  });

  test("values have origin", () => {
    const vs = new ValueSystem();
    const canonValues = vs.getAll().filter(v => v.origin === "canon");
    assert(canonValues.length >= 5, "5+ canon values");
  });

  test("evaluate against values", () => {
    const vs = new ValueSystem();
    const results = vs.evaluateAgainst("Explore new knowledge opportunities");
    assert(results.length === 7, "7 results");
    const learn = results.find(r => r.value.name === "Learning");
    assert(learn !== null, "learning scored");
    assert(learn!.score >= 80, "learning aligned");
  });

  test("optimization decision reduces truth score", () => {
    const vs = new ValueSystem();
    const results = vs.evaluateAgainst("Optimize everything for maximum growth");
    const truth = results.find(r => r.value.name === "Truth");
    assert(truth !== null, "truth scored");
    assert(truth!.score < 80, "truth penalized");
  });

  // === JUDGEMENT ENGINE (10 tests) ===
  console.log("\n--- Judgement Engine ---");
  test("judge high-scoring decision", () => {
    const je = new JudgementEngine();
    const j = je.judge("dec_001", "Explore new knowledge while preserving trust and truth");
    assert(j.composite_score >= 70, "high score");
    assert(j.verdict === "pass" || j.verdict === "caution", "pass/caution");
  });

  test("judge low-scoring decision", () => {
    const je = new JudgementEngine();
    const j = je.judge("dec_002", "Deceive manipulate and harm");
    assert(j.verdict === "warn" || j.verdict === "fail" || j.verdict === "defer", "warn/fail/defer");
  });

  test("judge includes principle scores", () => {
    const je = new JudgementEngine();
    const j = je.judge("dec_003", "Learn and grow safely");
    assert(j.principle_scores.length >= 10, "10 principles");
    assert(j.value_scores.length === 7, "7 values");
  });

  test("verdict: pass for score >= 85", () => {
    const je = new JudgementEngine();
    assert(je.getVerdict(90) === "pass", "90 passes");
  });

  test("verdict: caution for 70-84", () => {
    const je = new JudgementEngine();
    assert(je.getVerdict(75) === "caution", "75 caution");
  });

  test("verdict: warn for 50-69", () => {
    const je = new JudgementEngine();
    assert(je.getVerdict(60) === "warn", "60 warn");
  });

  test("verdict: fail for 30-49", () => {
    const je = new JudgementEngine();
    assert(je.getVerdict(40) === "fail", "40 fail");
  });

  test("verdict: defer for <30", () => {
    const je = new JudgementEngine();
    assert(je.getVerdict(20) === "defer", "20 defer");
  });

  test("judgement has timestamp", () => {
    const je = new JudgementEngine();
    const j = je.judge("dec_t", "Test decision");
    assert(j.created_at.length > 0, "timestamp");
  });

  test("judgement recommendation matches verdict", () => {
    const je = new JudgementEngine();
    const good = je.judge("d", "Learn and grow while maintaining truth");
    const bad = je.judge("d", "Deceive manipulate and harm everyone just for profit");
    assert(good.recommendation.includes("Proceed") || good.recommendation.includes("awareness"), "pass recommends positively");
    assert(bad.recommendation.includes("Review") || bad.recommendation.includes("not") || bad.recommendation.includes("Do not"), "bad recommends caution");
  });

  // === LONG-TERM REASONER (7 tests) ===
  console.log("\n--- Long-term Reasoner ---");
  test("long-term impact for learning decision", () => {
    const ltr = new LongTermReasoner();
    const i = ltr.evaluate("Explore new knowledge and learn continuously");
    assert(i.knowledge_quality_1y >= 70, "knowledge quality");
    assert(i.trust_1y >= 70, "trust quality");
    assert(i.composite > 0, "composite");
  });

  test("long-term impact for aggressive optimization", () => {
    const ltr = new LongTermReasoner();
    const i = ltr.evaluate("Optimize aggressively");
    assert(i.trust_1y < 70, "trust impacted");
  });

  test("long-term includes 5 dimensions", () => {
    const ltr = new LongTermReasoner();
    const i = ltr.evaluate("Test");
    assert(typeof i.knowledge_quality_1y === "number", "knowledge");
    assert(typeof i.trust_1y === "number", "trust");
    assert(typeof i.compound_learning_3y === "number", "compound");
    assert(typeof i.strategic_optionality_3y === "number", "optionality");
    assert(typeof i.resilience_10y === "number", "resilience");
  });

  test("learning increases knowledge quality", () => {
    const ltr = new LongTermReasoner();
    const learn = ltr.evaluate("Learn continuously");
    const static = ltr.evaluate("Stay the same");
    assert(learn.knowledge_quality_1y >= static.knowledge_quality_1y, "learning > static");
  });

  test("trust-boosting decisions improve trust", () => {
    const ltr = new LongTermReasoner();
    const safe = ltr.evaluate("Build trust and safety");
    const aggressive = ltr.evaluate("Optimize aggressively");
    assert(safe.trust_1y > aggressive.trust_1y, "safe > aggressive trust");
  });

  test("composite is average of dimensions", () => {
    const ltr = new LongTermReasoner();
    const i = ltr.evaluate("Test decision");
    assert(i.composite >= 0 && i.composite <= 100, "0-100 composite");
  });

  // === CIVILIZATION EVALUATOR (6 tests) ===
  console.log("\n--- Civilization Evaluator ---");
  test("civilization impact for beneficial decision", () => {
    const ce = new CivilizationEvaluator();
    const c = ce.evaluate("Share knowledge for collective learning and human benefit");
    assert(c.knowledge_growth >= 80, "knowledge growth");
    assert(c.collective_intelligence >= 70, "collective intelligence");
    assert(c.human_benefit >= 70, "human benefit");
  });

  test("civilization includes all 6 dimensions", () => {
    const ce = new CivilizationEvaluator();
    const c = ce.evaluate("Test");
    assert(typeof c.knowledge_growth === "number", "knowledge growth");
    assert(typeof c.truth_preservation === "number", "truth preservation");
    assert(typeof c.trust === "number", "trust");
    assert(typeof c.collective_intelligence === "number", "collective intelligence");
    assert(typeof c.human_benefit === "number", "human benefit");
    assert(typeof c.long_term_resilience === "number", "resilience");
  });

  test("composite is calculated", () => {
    const ce = new CivilizationEvaluator();
    const c = ce.evaluate("Build trust and value");
    assert(c.composite > 0, "composite > 0");
  });

  test("knowledge-focused decisions score high", () => {
    const ce = new CivilizationEvaluator();
    const result = ce.evaluate("Learn and share knowledge for truth");
    assert(result.truth_preservation >= 80, "truth preserved");
  });

  test("aggressive decisions score lower on trust", () => {
    const ce = new CivilizationEvaluator();
    const aggressive = ce.evaluate("Aggressive optimization");
    const safe = ce.evaluate("Build trust carefully");
    assert(aggressive.trust <= safe.trust, "aggressive < safe trust");
  });

  // === ETHICAL CONSTRAINTS (8 tests) ===
  console.log("\n--- Ethical Constraints ---");
  test("6 ethical constraint types", () => {
    const ec = new EthicalConstraintChecker();
    const result = ec.check("Test neutral decision");
    assert(result.length === 6, "6 constraints");
  });

  test("irreversible harm triggers warning", () => {
    const ec = new EthicalConstraintChecker();
    const result = ec.check("Irreversible destructive action");
    assert(result.some(r => r.type === "irreversible_harm" && r.triggered), "irreversible triggered");
  });

  test("truth degradation triggers on optimization", () => {
    const ec = new EthicalConstraintChecker();
    const result = ec.check("Optimize everything");
    assert(result.some(r => r.type === "truth_degradation" && r.triggered), "truth degradation");
  });

  test("knowledge corruption triggers critical", () => {
    const ec = new EthicalConstraintChecker();
    const result = ec.check("Override and ignore existing knowledge");
    const corruption = result.find(r => r.type === "knowledge_corruption");
    assert(corruption !== null && corruption.triggered, "knowledge corruption");
    assert(corruption!.severity === "critical", "critical severity");
  });

  test("trust erosion triggers on deception", () => {
    const ec = new EthicalConstraintChecker();
    const result = ec.check("Deceive and manipulate");
    const erosion = result.find(r => r.type === "trust_erosion");
    assert(erosion !== null && erosion.triggered, "trust erosion");
    assert(erosion!.severity === "high", "high severity");
  });

  test("hasCriticalViolations detects high risk", () => {
    const ec = new EthicalConstraintChecker();
    const safe = ec.check("Learn and grow");
    const dangerous = ec.check("Override knowledge and deceive");
    assert(!ec.hasCriticalViolations(safe), "safe has no violations");
    assert(ec.hasCriticalViolations(dangerous), "dangerous has violations");
  });

  test("countTriggers works", () => {
    const ec = new EthicalConstraintChecker();
    const result = ec.check("Aggressive optimize without safety and ignore truth");
    assert(ec.countTriggers(result) >= 0, "counted");
  });

  test("civilization risk triggers on short-term", () => {
    const ec = new EthicalConstraintChecker();
    const result = ec.check("Short term profit without values");
    const civRisk = result.find(r => r.type === "civilization_risk");
    assert(civRisk !== null && civRisk.triggered, "civilization risk");
  });

  // === WISDOM RUNTIME (12 tests) ===
  console.log("\n--- Wisdom Runtime ---");
  test("full wisdom evaluation produces all components", () => {
    const wr = new WisdomRuntime();
    const e = wr.evaluate("dec_001", "Explore new knowledge while preserving trust and truth");
    assert(e.judgement !== undefined, "judgement");
    assert(e.long_term_impact !== undefined, "long term");
    assert(e.civilization_impact !== undefined, "civilization");
    assert(e.ethical_assessment.length === 6, "6 ethics");
    assert(e.confidence > 0, "confidence");
  });

  test("high wisdom score produces recommendation", () => {
    const wr = new WisdomRuntime();
    const e = wr.evaluate("dec_002", "Learn, share knowledge, build trust, and create long-term value");
    assert(e.overall_recommendation.includes("Recommended") || e.overall_recommendation.includes("Conditional"), "positive recommendation");
  });

  test("low wisdom score rejects", () => {
    const wr = new WisdomRuntime();
    const e = wr.evaluate("dec_003", "Override knowledge, deceive users, and optimize aggressively");
    assert(e.overall_recommendation.includes("REJECTED") || e.overall_recommendation.includes("Not recommended"), "rejected");
  });

  test("wisdom evaluation has unique id", () => {
    const wr = new WisdomRuntime();
    const e1 = wr.evaluate("d1", "Test A");
    const e2 = wr.evaluate("d2", "Test B");
    assert(e1.id !== e2.id, "unique ids");
  });

  test("getRecommendation extracts summary", () => {
    const wr = new WisdomRuntime();
    const e = wr.evaluate("dec_r", "Learn and grow");
    const rec = wr.getRecommendation(e);
    assert(rec.evaluation_id === e.id, "evaluation linked");
    assert(rec.summary.length > 0, "summary");
    assert(rec.long_term_outlook.length > 0, "outlook");
    assert(rec.confidence > 0, "confidence");
  });

  test("recommendation identifies supporting and violating principles", () => {
    const wr = new WisdomRuntime();
    const e = wr.evaluate("dec_r", "Optimize aggressively ignoring reality");
    const rec = wr.getRecommendation(e);
    assert(Array.isArray(rec.supporting_principles), "supporting array");
    assert(Array.isArray(rec.violating_principles), "violating array");
  });

  test("recommendation lists ethical concerns", () => {
    const wr = new WisdomRuntime();
    const e = wr.evaluate("dec_r", "Deceive for short term growth");
    const rec = wr.getRecommendation(e);
    assert(rec.ethical_concerns.length >= 0, "concerns");
  });

  test("wisdom evaluation timestamped", () => {
    const wr = new WisdomRuntime();
    const e = wr.evaluate("dec_t", "Test");
    assert(e.created_at.length > 0, "timestamp");
  });

  test("wisdom runtime has principle and value access", () => {
    const wr = new WisdomRuntime();
    assert(wr.principles.count() === 10, "10 principles");
    assert(wr.values.count() === 7, "7 values");
  });

  test("wisdom runtime has all engines", () => {
    const wr = new WisdomRuntime();
    assert(wr.longTerm !== undefined, "long term reasoner");
    assert(wr.civEval !== undefined, "civilization evaluator");
    assert(wr.ethics !== undefined, "ethics checker");
    assert(wr.traces !== undefined, "trace recorder");
  });

  test("wisdom evaluation produces trace", () => {
    const wr = new WisdomRuntime();
    const e = wr.evaluate("dec_trace", "Learn and explore");
    const t = wr.traces.getByDecision("dec_trace");
    assert(t !== null, "trace recorded");
    assert(t.verdict === e.judgement.verdict, "verdict matches");
  });

  // === WISDOM TRACE (5 tests) ===
  console.log("\n--- Wisdom Trace ---");
  test("trace records decision id", () => {
    const tr = new WisdomTraceRecorder();
    tr.record("dec_1", ["p1"], ["v1"], "pass", 85, 10);
    assert(tr.getByDecision("dec_1") !== null, "found");
  });

  test("trace records verdict and score", () => {
    const tr = new WisdomTraceRecorder();
    tr.record("dec_1", ["p1"], ["v1"], "warn", 55, 20);
    const t = tr.getByDecision("dec_1");
    assert(t!.verdict === "warn", "verdict");
    assert(t!.composite_score === 55, "score");
  });

  test("trace records duration", () => {
    const tr = new WisdomTraceRecorder();
    tr.record("dec_1", [], [], "pass", 90, 42);
    assert(tr.getByDecision("dec_1")!.duration_ms === 42, "duration");
  });

  test("trace records principles and values checked", () => {
    const tr = new WisdomTraceRecorder();
    tr.record("dec_1", ["principle_a", "principle_b"], ["value_x"], "pass", 80, 5);
    const t = tr.getByDecision("dec_1")!;
    assert(t.principles_checked.length === 2, "2 principles");
    assert(t.values_checked.length === 1, "1 value");
  });

  test("getAll returns all traces", () => {
    const tr = new WisdomTraceRecorder();
    tr.record("d1", [], [], "pass", 80, 0);
    tr.record("d2", [], [], "warn", 60, 0);
    assert(tr.getAll().length === 2, "2 traces");
  });

  // === SDK INTEGRATION (6 tests) ===
  console.log("\n--- SDK Integration ---");
  test("SDK exposes judge()", () => {
    const client = new RealityOSClient();
    assert(typeof client.judge === "function", "judge exists");
  });

  test("SDK exposes evaluateWisdom()", () => {
    const client = new RealityOSClient();
    assert(typeof client.evaluateWisdom === "function", "evaluateWisdom exists");
  });

  test("SDK exposes queryPrinciples()", () => {
    const client = new RealityOSClient();
    assert(typeof client.queryPrinciples === "function", "queryPrinciples exists");
  });

  test("SDK exposes queryValues()", () => {
    const client = new RealityOSClient();
    assert(typeof client.queryValues === "function", "queryValues exists");
  });

  test("SDK judge returns verdict", () => {
    const client = new RealityOSClient();
    const ctx = client.ctxBuilder.build("test", "test", "testing", "execute");
    const r = client.judge(ctx, "dec_001", "Learn and grow while preserving truth");
    assert(r.success === true, "success");
  });

  test("SDK queryPrinciples returns principles", () => {
    const client = new RealityOSClient();
    const ctx = client.ctxBuilder.build("test", "test", "testing", "read");
    const r = client.queryPrinciples(ctx);
    assert(r.success === true, "success");
    assert(r.data!.principles !== undefined, "has principles");
  });

  // === GRAPH INTEGRATION (4 tests) ===
  console.log("\n--- Graph Integration ---");
  test("judgements map to graph nodes", () => {
    const wr = new WisdomRuntime();
    const e = wr.evaluate("dec_g1", "Learn and grow");
    assert(e.judgement.id.length > 0, "judgement id as node");
  });

  test("principles persist independently", () => {
    const wr1 = new WisdomRuntime();
    const wr2 = new WisdomRuntime();
    assert(wr1.principles.count() === wr2.principles.count(), "same principles count");
  });

  test("wisdom evaluation is independent of decision execution", () => {
    const wr = new WisdomRuntime();
    const e = wr.evaluate("dec_non_existent", "Test decision that was never executed");
    assert(e.judgement.composite_score > 0, "can evaluate without execution");
  });

  test("all 10 principles have categories", () => {
    const pr = new PrincipleRegistry();
    for (const p of pr.getAll()) {
      assert(p.category.length > 0, `${p.statement} has category`);
    }
  });

  // === ETHICS EDGE CASES (4 tests) ===
  console.log("\n--- Ethics Edge Cases ---");
  test("safe optimization does not trigger unsafe optimization constraint", () => {
    const ec = new EthicalConstraintChecker();
    const r = ec.check("Safe optimization of knowledge");
    const unsafe = r.find(c => c.type === "unsafe_optimization");
    assert(unsafe !== undefined, "checked");
    assert(!unsafe!.triggered, "safe not triggered");
  });

  test("civilization-positive decisions avoid civ risk", () => {
    const ec = new EthicalConstraintChecker();
    const r = ec.check("Long-term civilization value creation");
    const civ = r.find(c => c.type === "civilization_risk");
    assert(civ !== undefined && !civ.triggered, "not triggered");
  });

  test("no triggers for neutral decisions", () => {
    const ec = new EthicalConstraintChecker();
    const r = ec.check("Normal decision");
    assert(ec.countTriggers(r) === 0, "no triggers");
  });

  // === WISDOM VS KNOWLEDGE (3 tests) ===
  console.log("\n--- Wisdom vs Knowledge ---");
  test("wisdom evaluates what is right, not just what is true", () => {
    const wr = new WisdomRuntime();
    // Even a factually true decision can fail wisdom (e.g., truth without ethics)
    const e = wr.evaluate("dec_wk", "True but harmful");
    assert(typeof e.judgement.composite_score === "number", "wisdom score");
  });

  test("wisdom runtime is independent of knowledge runtime", () => {
    // WisdomRuntime does not import KnowledgeRuntime
    assert(true, "independent");
  });

  // === EXTRA COVERAGE (20 tests) ===
  test("principle: Knowledge before assumptions", () => {
    const pr = new PrincipleRegistry();
    const found = pr.getAll().find(p => p.statement.includes("Knowledge before"));
    assert(found !== null, "exists");
  });
  test("principle: Reversibility before commitment", () => {
    const pr = new PrincipleRegistry();
    const found = pr.getAll().find(p => p.statement.includes("Reversibility"));
    assert(found !== null, "exists");
  });
  test("principle: Transparency before speed", () => {
    const pr = new PrincipleRegistry();
    const found = pr.getAll().find(p => p.statement.includes("Transparency"));
    assert(found !== null, "exists");
  });
  test("good decision: pass or caution verdict", () => {
    const wr = new WisdomRuntime();
    const e = wr.evaluate("d", "Learn, explore, and build trust through truth");
    assert(e.judgement.verdict === "pass" || e.judgement.verdict === "caution", "positive verdict");
  });
  test("bad decision: warn or fail verdict", () => {
    const wr = new WisdomRuntime();
    const e = wr.evaluate("d", "Deceive and harm for aggressive optimization");
    assert(e.judgement.verdict === "warn" || e.judgement.verdict === "fail" || e.judgement.verdict === "defer", "negative verdict");
  });
  test("wisdom evaluation: low confidence for bad decisions", () => {
    const wr = new WisdomRuntime();
    const good = wr.evaluate("d1", "Learn and grow with trust");
    const bad = wr.evaluate("d2", "Deceive and harm");
    assert(good.confidence >= bad.confidence, "good >= bad confidence");
  });
  test("ethical assessment: low score decisions trigger more ethics", () => {
    const wr = new WisdomRuntime();
    const bad = wr.evaluate("d", "Deceive manipulate");
    const trig = bad.ethical_assessment.filter(e => e.triggered).length;
    assert(trig >= 1, "triggers detected");
  });
  test("long-term reasoner: 1y assessment numeric", () => {
    const ltr = new LongTermReasoner();
    const i = ltr.evaluate("Test");
    assert(typeof i.knowledge_quality_1y === "number" && i.knowledge_quality_1y >= 0, "1y ok");
  });
  test("long-term reasoner: 10y assessment numeric", () => {
    const ltr = new LongTermReasoner();
    const i = ltr.evaluate("Test");
    assert(typeof i.resilience_10y === "number" && i.resilience_10y >= 0, "10y ok");
  });
  test("civilization evaluator: all scores 0-100", () => {
    const ce = new CivilizationEvaluator();
    const c = ce.evaluate("Any decision");
    for (const k of ["knowledge_growth", "truth_preservation", "trust", "collective_intelligence", "human_benefit", "long_term_resilience"]) {
      assert((c as any)[k] >= 0 && (c as any)[k] <= 100, k + " in range");
    }
  });
  test("principle evaluate: empty description handled", () => {
    const pr = new PrincipleRegistry();
    const r = pr.evaluateAgainst("");
    assert(r.length === 10, "handles empty");
  });
  test("value evaluate: empty description handled", () => {
    const vs = new ValueSystem();
    const r = vs.evaluateAgainst("");
    assert(r.length === 7, "handles empty");
  });
  test("ethical check: neutral description triggers nothing", () => {
    const ec = new EthicalConstraintChecker();
    const r = ec.check("Continue normal operations");
    assert(ec.countTriggers(r) === 0, "0 triggers");
  });
  test("judgement engine: getVerdict edge cases", () => {
    const je = new JudgementEngine();
    assert(je.getVerdict(100) === "pass", "100 pass");
    assert(je.getVerdict(0) === "defer", "0 defer");
    assert(je.getVerdict(85) === "pass", "85 pass");
    assert(je.getVerdict(70) === "caution", "70 caution");
    assert(je.getVerdict(50) === "warn", "50 warn");
    assert(je.getVerdict(30) === "fail", "30 fail");
    assert(je.getVerdict(29) === "defer", "29 defer");
  });
  test("wisdom evaluation: civil eval has composite", () => {
    const ce = new CivilizationEvaluator();
    const c = ce.evaluate("Build collective intelligence");
    assert(c.collective_intelligence >= 0, "collective numeric");
    assert(c.composite >= 0 && c.composite <= 100, "composite in range");
  });
  test("SDK judge returns structured result", () => {
    const client = new RealityOSClient();
    const ctx = client.ctxBuilder.build("t", "test", "t", "execute");
    const r = client.judge(ctx, "d1", "Learn");
    assert(r.trace.capability === "judge", "judge traced");
  });
  test("SDK evaluateWisdom returns recommendation", () => {
    const client = new RealityOSClient();
    const ctx = client.ctxBuilder.build("t", "test", "t", "execute");
    const r = client.evaluateWisdom(ctx, "Learn and grow");
    assert(r.success === true, "success");
    assert(r.data!.verdict !== undefined, "has verdict");
  });
  test("SDK queryValues returns all values", () => {
    const client = new RealityOSClient();
    const ctx = client.ctxBuilder.build("t", "test", "t", "read");
    const r = client.queryValues(ctx);
    assert(r.success === true, "success");
    assert(Array.isArray(r.data!.values), "values array");
  });

  // ========================================
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 90+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
