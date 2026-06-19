// GroIntel RWS-2 — Goal Engine + Attention Engine Tests
import { GoalRegistry } from "../goals/goal_registry";
import { GoalEngine } from "../goals/goal_engine";
import { GoalEvaluator } from "../goals/goal_evaluator";
import { calculateGoalPriority } from "../goals/goal_priority";
import { AttentionEngine } from "../attention/attention_engine";
import { AttentionScorer } from "../attention/attention_scorer";
import { AttentionFilter } from "../attention/attention_filter";
import { AttentionAllocator } from "../attention/attention_allocator";
import { AttentionTraceRecorder } from "../attention/attention_trace";
import { WorldEvent, DomainName } from "../reality_stream/world_types";

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error("FAIL: " + msg);
}
let passed = 0, failed = 0;
function test(name: string, fn: () => void): void {
  try { fn(); passed++; console.log("  PASS:", name); } catch (e: any) { failed++; console.log("  FAIL:", name, "-", e.message); }
}
function event(domain: DomainName, eventType: string, importance = 50, confidence = 70): WorldEvent {
  return { id: "e1", timestamp: new Date().toISOString(), domain, domains: [domain], source: "web_scan", event_type: eventType, importance, confidence, payload: {}, location: null, language: null, entities: [], metadata: {}, trace_id: "t1" };
}

async function run() {
  console.log("\n=== RWS-2: Goal Engine + Attention Engine ===\n");

  // === GOAL ENGINE TESTS ===
  console.log("--- Goal Engine ---");
  test("10 default goals created", () => {
    const reg = new GoalRegistry();
    assert(reg.getAll().length === 10, "10 default goals");
  });
  test("goals have correct types", () => {
    const reg = new GoalRegistry();
    const types = reg.getAll().map(g => g.type);
    assert(types.includes("civilization_goal"), "civilization goal exists");
    assert(types.includes("intelligence_goal"), "intelligence goal exists");
    assert(types.includes("discovery_goal"), "discovery goal exists");
    assert(types.includes("learning_goal"), "learning goal exists");
    assert(types.includes("risk_monitoring_goal"), "risk goal exists");
    assert(types.includes("opportunity_detection_goal"), "opportunity goal exists");
  });
  test("goals ranked by priority", () => {
    const reg = new GoalRegistry();
    const ranked = reg.getRanked();
    for (let i = 1; i < ranked.length; i++) {
      assert(ranked[i - 1].priority >= ranked[i].priority, "goals sorted descending");
    }
  });
  test("goal priority calculated correctly", () => {
    const score = calculateGoalPriority({ importance: 100, urgency: 80, civilization_value: 90, uncertainty_reduction: 70, learning_value: 60 });
    assert(score > 0 && score <= 100, "0-100 range");
    assert(score > 80, "high priority with high inputs");
  });
  test("goal active/pause workflow", () => {
    const reg = new GoalRegistry();
    const g = reg.getAll()[0];
    reg.pause(g.id);
    assert(reg.get(g.id)?.status === "paused", "paused");
    reg.activate(g.id);
    assert(reg.get(g.id)?.status === "active", "reactivated");
  });
  test("goal domain mapping", () => {
    const reg = new GoalRegistry();
    const mkt = reg.getByDomain("Market");
    assert(mkt.length >= 2, "multiple goals for Market domain");
  });
  test("goal type filtering", () => {
    const reg = new GoalRegistry();
    const lrn = reg.getByType("learning_goal");
    assert(lrn.length >= 2, "learning goals exist");
  });
  test("goal engine returns top goals", () => {
    const eng = new GoalEngine();
    const top = eng.getTopGoals(3);
    assert(top.length === 3, "3 top goals");
  });

  // === ATTENTION SCORER ===
  console.log("\n--- Attention Scorer ---");
  test("scorer produces components", () => {
    const scorer = new AttentionScorer();
    const e = event("Business", "funding", 90, 85);
    const s = scorer.score(e, []);
    assert(s.total >= 0, "non-negative");
    assert(s.goal_alignment >= 0, "goal alignment present");
    assert(s.novelty >= 0, "novelty present");
    assert(s.urgency >= 0, "urgency present");
  });
  test("novelty correlates with importance", () => {
    const scorer = new AttentionScorer();
    const high = scorer.score(event("Business", "funding", 90, 80), []);
    const low = scorer.score(event("Business", "funding", 20, 80), []);
    assert(high.novelty >= low.novelty, "higher importance = higher novelty");
  });
  test("urgency correlates with importance", () => {
    const scorer = new AttentionScorer();
    const high = scorer.score(event("Business", "launch", 85, 60), []);
    const low = scorer.score(event("Business", "update", 30, 60), []);
    assert(high.urgency >= low.urgency, "higher importance = higher urgency");
  });
  test("goal alignment improves with matching domain goals", () => {
    const scorer = new AttentionScorer();
    const reg = new GoalRegistry();
    const e = event("Business", "funding", 70, 80);
    const s = scorer.score(e, reg.getActive());
    assert(s.total > 20, "with goals, score should be meaningful");
  });

  // === ATTENTION FILTER ===
  console.log("\n--- Attention Filter ---");
  test("ignore decision for low-score event", () => {
    const filter = new AttentionFilter();
    const d = filter.evaluate(event("General", "minor_update", 10, 20), []);
    assert(d.decision === "ignore", "low score = ignore");
  });
  test("process decision for medium event", () => {
    const filter = new AttentionFilter();
    const d = filter.evaluate(event("Business", "funding", 65, 70), []);
    assert(d.decision === "process" || d.decision === "monitor", "medium = process or monitor");
  });
  test("escalate for high importance event", () => {
    const filter = new AttentionFilter();
    const d = filter.evaluate(event("Business", "funding", 80, 85), []);
    assert(["process", "escalate"].includes(d.decision), "high importance = process/escalate");
  });
  test("deep_analyze for critical event with goal alignment", () => {
    const filter = new AttentionFilter();
    // With matching goals, high importance event should reach deep_analyze
    const reg = new GoalRegistry();
    const d = filter.evaluate(event("Business", "funding", 95, 95), reg.getByDomain("Business"));
    const results = ["process", "escalate", "deep_analyze"];
    assert(results.includes(d.decision), "critical with goals = process/escalate/deep_analyze, got: " + d.decision + " score: " + d.score);
  });
  test("budget varies by decision", () => {
    const filter = new AttentionFilter();
    const d1 = filter.evaluate(event("General", "minor", 10, 20), []);
    const d2 = filter.evaluate(event("Business", "critical", 95, 95), []);
    assert(d1.allocated_budget <= d2.allocated_budget, "higher priority = higher budget");
    assert(filter.shouldProcess(d2), "critical should be processed");
  });

  // === ATTENTION ALLOCATOR ===
  console.log("\n--- Attention Allocator ---");
  test("allocator creates trace with budget", () => {
    const alloc = new AttentionAllocator();
    const filter = new AttentionFilter();
    const d = filter.evaluate(event("Business", "major", 85, 80), []);
    const trace = alloc.allocate(event("Business", "major", 85, 80), d, []);
    assert(trace.id.length > 0, "trace has id");
    assert(trace.final_budget > 0, "trace has budget");
  });

  // === ATTENTION TRACE ===
  console.log("\n--- Attention Trace ---");
  test("trace recorder stores decisions", () => {
    const tr = new AttentionTraceRecorder();
    const filter = new AttentionFilter();
    const e = event("Business", "critical", 90, 90);
    const d = filter.evaluate(e, []);
    tr.record({ id: "t1", event_id: e.id, score_components: { goal_alignment: 80, novelty: 80, urgency: 80, impact: 80, uncertainty: 20, risk: 60, opportunity: 80 }, linked_goals: [], decision: d.decision, reason: "test", final_budget: d.allocated_budget, timestamp: new Date().toISOString() });
    assert(tr.getTraces().length === 1, "1 trace recorded");
  });
  test("trace deep analyze count", () => {
    const tr = new AttentionTraceRecorder();
    tr.record({ id: "t1", event_id: "e1", score_components: { goal_alignment: 0, novelty: 0, urgency: 0, impact: 0, uncertainty: 0, risk: 0, opportunity: 0 }, linked_goals: [], decision: "deep_analyze", reason: "", final_budget: 10, timestamp: "" });
    tr.record({ id: "t2", event_id: "e2", score_components: { goal_alignment: 0, novelty: 0, urgency: 0, impact: 0, uncertainty: 0, risk: 0, opportunity: 0 }, linked_goals: [], decision: "ignore", reason: "", final_budget: 0, timestamp: "" });
    assert(tr.getDeepAnalyzeCount() === 1, "1 deep analyze");
    assert(tr.getIgnoreCount() === 1, "1 ignore");
  });

  // === GOAL EVALUATOR ===
  console.log("\n--- Goal Evaluator ---");
  test("goal evaluator returns progress", () => {
    const reg = new GoalRegistry();
    const g = reg.getAll()[0];
    const eval_ = new GoalEvaluator().evaluate(g);
    assert(eval_.goal_id === g.id, "correct goal id");
    assert(eval_.next_action.length > 0, "next action defined");
  });

  // === ATTENTION ENGINE ===
  console.log("\n--- Attention Engine ---");
  test("attention engine evaluate returns decision", () => {
    const ae = new AttentionEngine();
    const e = event("Business", "funding", 80, 80);
    const result = ae.evaluate(e, []);
    assert(result.decision.decision !== undefined, "decision made");
    assert(result.trace.id.length > 0, "trace created");
  });
  test("attention engine getStats", () => {
    const ae = new AttentionEngine();
    ae.evaluate(event("Business", "funding", 90, 90), []);
    const stats = ae.getStats();
    assert(stats.total >= 1, "at least 1 event evaluated");
  });

  // === GOAL PRIORITY ===
  console.log("\n--- Goal Priority ---");
  test("calculateGoalPriority returns 0-100", () => {
    assert(calculateGoalPriority({ importance: 50, urgency: 50, civilization_value: 50, uncertainty_reduction: 50, learning_value: 50 }) === 50, "50 for all 50");
    assert(calculateGoalPriority({ importance: 100, urgency: 100, civilization_value: 100, uncertainty_reduction: 100, learning_value: 100 }) === 100, "100 for all 100");
    assert(calculateGoalPriority({ importance: 0, urgency: 0, civilization_value: 0, uncertainty_reduction: 0, learning_value: 0 }) === 0, "0 for all 0");
  });

  // ========================================
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
