// GroIntel Cognitive Kernel — GCK-5 Learning Tests
import { PredictionValidator } from "../learning/prediction_validator";
import { OutcomeComparator } from "../learning/outcome_comparator";
import { LearningEngine } from "../learning/learning_engine";
import { CorrectionEngine } from "../learning/correction_engine";
import { ConfidenceUpdater } from "../learning/confidence_updater";
import { LearningTraceRecorder } from "../learning/learning_trace";
import { Prediction, Observation } from "../kernel_types";

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error("FAIL: " + msg);
}

let passed = 0, failed = 0;
function test(name: string, fn: () => void): void {
  try { fn(); passed++; console.log("  PASS:", name); }
  catch (e: any) { failed++; console.log("  FAIL:", name, "-", e.message); }
}

const now = new Date();
const past = new Date(now.getTime() - 1000).toISOString();
const future = new Date(now.getTime() + 86400000).toISOString();

function makePrediction(id: string, targetField: string, state: Record<string, unknown>, conf = 70, dueAt?: string): Prediction {
  return {
    id, target_entity_id: "ent-1", target_field: targetField,
    predicted_state: state, current_state: {},
    time_horizon_seconds: 86400, probability: 70, confidence: conf,
    evidence: [], assumptions: [], unknown_variables: [],
    status: "active", validation_due_at: dueAt || past,
    actual_outcome: null, prediction_error: null,
    created_at: new Date().toISOString(), validated_at: null,
  };
}

function makeObservation(id: string, entityId: string, data: Record<string, unknown>, conf = 80): Observation {
  return {
    id, event_id: "evt-1", source: "observation", entity_id: entityId,
    entity_type: null, signal_type: "test", raw_data: data,
    extracted_data: data, confidence: conf,
    evidence_links: [], created_at: new Date().toISOString(),
  };
}

console.log("\n=== GCK-5: Prediction Validation & Learning Loop ===\n");

// === TASK 2: Prediction Validator ===
console.log("--- Prediction Validator ---");
test("find due predictions", () => {
  const v = new PredictionValidator();
  const pastPred = makePrediction("p1", "test", { a: "b" }, 70, past);
  const futurePred = makePrediction("p2", "test", { a: "b" }, 70, future);
  const due = v.findDuePredictions([pastPred, futurePred]);
  assert(due.length === 1, "only past-due prediction found");
  assert(due[0].id === "p1", "correct prediction");
});

test("validate exact match", () => {
  const v = new PredictionValidator();
  const pred = makePrediction("p1", "trajectory", { trajectory: "positive" }, 70, past);
  const obs = makeObservation("o1", "ent-1", { trajectory: "positive" });
  const val = v.validate(pred, [obs]);
  assert(val.validation_result === "validated", "exact match validation");
  assert(val.confidence_after > val.confidence_before, "confidence increased");
});

test("validate partial match", () => {
  const v = new PredictionValidator();
  const pred = makePrediction("p1", "position", { market_position: "strengthening" }, 70, past);
  const obs = makeObservation("o1", "ent-1", { market_position: "strengthening somewhat" });
  const val = v.validate(pred, [obs]);
  const validRs = ["validated", "partially_validated"];
  assert(validRs.includes(val.validation_result), "partial match: " + val.validation_result);
});

test("validate miss", () => {
  const v = new PredictionValidator();
  const pred = makePrediction("p1", "trajectory", { trajectory: "growing" }, 70, past);
  const obs = makeObservation("o1", "ent-1", { trajectory: "declining" });
  const val = v.validate(pred, [obs]);
  assert(val.validation_result === "miss", "miss detected");
  assert(val.confidence_after < val.confidence_before, "confidence decreased");
});

test("insufficient evidence", () => {
  const v = new PredictionValidator();
  const pred = makePrediction("p1", "trajectory", { trajectory: "positive" }, 70, past);
  const val = v.validate(pred, []);
  assert(val.validation_result === "insufficient_evidence", "insufficient evidence");
});

test("not-due predictions ignored", () => {
  const v = new PredictionValidator();
  const futurePred = makePrediction("p1", "test", { a: "b" }, 70, future);
  const due = v.findDuePredictions([futurePred]);
  assert(due.length === 0, "no due predictions");
});

// === TASK 3: Outcome Comparator ===
console.log("\n--- Outcome Comparator ---");
test("exact match comparison", () => {
  const v = new PredictionValidator();
  const c = new OutcomeComparator();
  const pred = makePrediction("p1", "trajectory", { trajectory: "positive" }, 70, past);
  const obs = makeObservation("o1", "ent-1", { trajectory: "positive" });
  const val = v.validate(pred, [obs]);
  const comp = c.compare(val);
  assert(comp.comparison === "exact_match", "exact match");
});

test("opposite outcome detected", () => {
  const v = new PredictionValidator();
  const c = new OutcomeComparator();
  const pred = makePrediction("p1", "t", { trajectory: "increased" }, 70, past);
  const obs = makeObservation("o1", "ent-1", { trajectory: "decreased" });
  const val = v.validate(pred, [obs]);
  const comp = c.compare(val);
  assert(comp.comparison !== "unknown", "comparison made");
});

test("unknown comparison when no observations", () => {
  const v = new PredictionValidator();
  const c = new OutcomeComparator();
  const pred = makePrediction("p1", "t", { a: "b" }, 70, past);
  const val = v.validate(pred, []);
  const comp = c.compare(val);
  assert(comp.comparison === "unknown", "unknown comparison");
});

// === TASK 4: Learning Engine ===
console.log("\n--- Learning Engine ---");
test("learning insight generated for exact match", () => {
  const v = new PredictionValidator();
  const c = new OutcomeComparator();
  const l = new LearningEngine();
  const pred = makePrediction("p1", "t", { trajectory: "positive" }, 70, past);
  const obs = makeObservation("o1", "ent-1", { trajectory: "positive" });
  const val = v.validate(pred, [obs]);
  const comp = c.compare(val);
  const insight = l.generateInsight(val, comp);
  assert(insight.id.length > 0, "insight has id");
  assert(insight.what_kernel_should_update.includes("increase_confidence"), "increase confidence suggested");
});

test("learning insight for miss includes decrease", () => {
  const v = new PredictionValidator();
  const c = new OutcomeComparator();
  const l = new LearningEngine();
  const pred = makePrediction("p1", "t", { trajectory: "growing" }, 70, past);
  const obs = makeObservation("o1", "ent-1", { trajectory: "declining" });
  const val = v.validate(pred, [obs]);
  const comp = c.compare(val);
  const insight = l.generateInsight(val, comp);
  assert(insight.what_kernel_should_update.includes("decrease_confidence"), "decrease confidence suggested");
});

test("learning insight for insufficient evidence", () => {
  const v = new PredictionValidator();
  const c = new OutcomeComparator();
  const l = new LearningEngine();
  const pred = makePrediction("p1", "t", { a: "b" }, 70, past);
  const val = v.validate(pred, []);
  const comp = c.compare(val);
  const insight = l.generateInsight(val, comp);
  assert(insight.what_kernel_should_update.includes("request_more_evidence"), "request more evidence");
});

// === TASK 5: Correction Engine ===
console.log("\n--- Correction Engine ---");
test("corrections generated from insight", () => {
  const v = new PredictionValidator();
  const c = new OutcomeComparator();
  const l = new LearningEngine();
  const ce = new CorrectionEngine();
  const pred = makePrediction("p1", "t", { trajectory: "growing" }, 70, past);
  const obs = makeObservation("o1", "ent-1", { trajectory: "declining" });
  const val = v.validate(pred, [obs]);
  const comp = c.compare(val);
  const insight = l.generateInsight(val, comp);
  const corrections = ce.generateCorrections(insight);
  assert(corrections.length > 0, "corrections generated");
  assert(corrections.some(c => c.correction_type === "decrease_confidence"), "decrease confidence correction");
});

test("correction has target type", () => {
  const ce = new CorrectionEngine();
  const insight = {
    id: "i1", prediction_id: "p1", comparison_id: "c1",
    what_was_expected: "X", what_happened: "Y", why_difference_may_exist: "Z",
    what_kernel_should_update: ["increase_confidence", "adjust_rule_weight"],
    future_prediction_adjustment: "A", severity: 30, created_at: "",
  };
  const corrections = ce.generateCorrections(insight);
  assert(corrections.length === 2, "2 corrections");
  assert(corrections.every(c => c.target_type.length > 0), "all have target types");
});

// === TASK 6: Confidence Updater ===
console.log("\n--- Confidence Updater ---");
test("confidence increases on correct prediction", () => {
  const cu = new ConfidenceUpdater();
  const correction = {
    id: "c1", learning_insight_id: "i1", correction_type: "increase_confidence" as const,
    target_id: "rule-1", target_type: "prediction_rule",
    previous_value: null, new_value: null, reason: "", created_at: "",
  };
  const update = cu.generateUpdate(correction, 70);
  assert(update.confidence_after === 80, "confidence increased from 70 to 80");
  assert(update.version === 1, "first version");
});

test("confidence decreases on miss", () => {
  const cu = new ConfidenceUpdater();
  const correction = {
    id: "c1", learning_insight_id: "i1", correction_type: "decrease_confidence" as const,
    target_id: "rule-1", target_type: "prediction_rule",
    previous_value: null, new_value: null, reason: "", created_at: "",
  };
  const update = cu.generateUpdate(correction, 70);
  assert(update.confidence_after === 50, "confidence decreased from 70 to 50");
});

test("confidence history preserved", () => {
  const cu = new ConfidenceUpdater();
  for (let i = 0; i < 3; i++) {
    const c = {
      id: `c${i}`, learning_insight_id: "i1", correction_type: "increase_confidence" as const,
      target_id: "rule-hist", target_type: "prediction_rule",
      previous_value: null, new_value: null, reason: "", created_at: "",
    };
    cu.generateUpdate(c, 50 + i * 10);
  }
  const history = cu.getHistory("rule-hist");
  assert(history.length === 3, "3 versions");
  assert(history[2].version === 3, "version increments");
  assert(cu.getLatestConfidence("rule-hist") === 80, "latest confidence is 80");
});

test("confidence never goes below 0 or above 100", () => {
  const cu = new ConfidenceUpdater();
  const inc = {
    id: "c1", learning_insight_id: "i1", correction_type: "increase_confidence" as const,
    target_id: "r1", target_type: "prediction_rule",
    previous_value: null, new_value: null, reason: "", created_at: "",
  };
  const dec = {
    id: "c2", learning_insight_id: "i2", correction_type: "decrease_confidence" as const,
    target_id: "r2", target_type: "prediction_rule",
    previous_value: null, new_value: null, reason: "", created_at: "",
  };
  assert(cu.generateUpdate(inc, 100).confidence_after === 100, "capped at 100");
  assert(cu.generateUpdate(dec, 0).confidence_after === 0, "floored at 0");
});

// === TASK 7: Learning Trace ===
console.log("\n--- Learning Trace ---");
test("learning trace records full cycle", () => {
  const tr = new LearningTraceRecorder();
  const v = new PredictionValidator();
  const c = new OutcomeComparator();
  const l = new LearningEngine();
  const ce = new CorrectionEngine();
  const cu = new ConfidenceUpdater();
  const pred = makePrediction("p1", "t", { trajectory: "growing" }, 70, past);
  const obs = makeObservation("o1", "ent-1", { trajectory: "declining" });
  const val = v.validate(pred, [obs]);
  const comp = c.compare(val);
  const insight = l.generateInsight(val, comp);
  const corrections = ce.generateCorrections(insight);
  const updates = corrections.map(c => cu.generateUpdate(c, 70));
  const trace = tr.record(pred.id, val, comp, insight, corrections, updates);
  assert(trace.id.length > 0, "trace has id");
  assert(trace.validation.validation_result === "miss", "validation in trace");
  assert(trace.corrections.length > 0, "corrections in trace");
  assert(trace.confidence_updates.length > 0, "confidence updates in trace");
});

test("trace queryable by prediction", () => {
  const tr = new LearningTraceRecorder();
  const mockCorrections: any[] = [];
  const mockUpdates: any[] = [];
  const mockVal: any = { id: "v1", prediction_id: "p1", entity_id: "e1", expected_state: {}, observed_state: null, validation_result: "insufficient_evidence", confidence_before: 70, confidence_after: 70, evidence_used: [], created_at: "" };
  const mockComp: any = { id: "cmp1", prediction_id: "p1", expected_state: {}, observed_state: {}, comparison: "unknown", difference_description: "", confidence: 70, created_at: "" };
  const mockInsight: any = { id: "i1", prediction_id: "p1", comparison_id: "cmp1", what_was_expected: "", what_happened: "", why_difference_may_exist: "", what_kernel_should_update: [], future_prediction_adjustment: "", severity: 10, created_at: "" };
  tr.record("p1", mockVal, mockComp, mockInsight, [], []);
  assert(tr.getTracesByPrediction("p1").length === 1, "found by prediction");
  assert(tr.getAll().length === 1, "one total trace");
});

// === TASK 9: Full Cycle ===
console.log("\n--- Full Learning Cycle ---");
test("full learning cycle: invalidate -> decrease confidence", () => {
  const v = new PredictionValidator();
  const c = new OutcomeComparator();
  const l = new LearningEngine();
  const ce = new CorrectionEngine();
  const cu = new ConfidenceUpdater();
  const tr = new LearningTraceRecorder();
  const pred = makePrediction("p1", "t", { trajectory: "growing" }, 80, past);
  const obs = makeObservation("o1", "ent-1", { trajectory: "declining" });
  const val = v.validate(pred, [obs]);
  const comp = c.compare(val);
  const insight = l.generateInsight(val, comp);
  const corrections = ce.generateCorrections(insight);
  const updates = corrections.map(c => cu.generateUpdate(c, 80));
  const trace = tr.record(pred.id, val, comp, insight, corrections, updates);
  assert(trace.validation.validation_result !== "validated", "not validated");
  assert(trace.confidence_updates.some(u => u.confidence_after < u.confidence_before), "confidence decreased");
});

test("full learning cycle: validate -> increase confidence", () => {
  const v = new PredictionValidator();
  const c = new OutcomeComparator();
  const l = new LearningEngine();
  const ce = new CorrectionEngine();
  const cu = new ConfidenceUpdater();
  const tr = new LearningTraceRecorder();
  const pred = makePrediction("p1", "t", { trajectory: "positive" }, 70, past);
  const obs = makeObservation("o1", "ent-1", { trajectory: "positive" });
  const val = v.validate(pred, [obs]);
  const comp = c.compare(val);
  const insight = l.generateInsight(val, comp);
  const corrections = ce.generateCorrections(insight);
  const updates = corrections.map(c => cu.generateUpdate(c, 70));
  const trace = tr.record(pred.id, val, comp, insight, corrections, updates);
  assert(trace.validation.validation_result === "validated", "validated");
  assert(trace.confidence_updates.some(u => u.confidence_after > u.confidence_before), "confidence increased");
});

// ========================================
// Results
// ========================================
const total = passed + failed;
console.log(`\n=== Results: ${passed}/${total} passed ===`);
if (failed > 0) process.exit(1);
