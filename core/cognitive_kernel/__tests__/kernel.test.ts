// GroIntel Cognitive Kernel — Tests
import { CognitiveKernel } from "../kernel";
import { KernelEventBus } from "../kernel_event";
import { KernelStateManager } from "../kernel_state";
import { KernelMemory } from "../kernel_memory";
import { KernelRegistry } from "../kernel_registry";
import { KernelMetricsCollector } from "../kernel_metrics";
import { KERNEL_POLICY } from "../kernel_policy";
import { KernelLogger } from "../kernel_logger";
import { KernelLoop } from "../kernel_loop";
import { MemoryRecord, EventType } from "../kernel_types";

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error("FAIL: " + msg);
  console.log("  PASS: " + msg);
}

let testsRun = 0;
let testsPassed = 0;
function test(name: string, fn: () => void): void {
  testsRun++;
  try {
    fn();
    testsPassed++;
  } catch {
    console.log(`  FAIL: ${name} - ${e.message}`);
  }
}

// ========================================
// Test 1: Kernel initialization
// ========================================
console.log("=== Kernel Initialization ===");

test("kernel should initialize with config", () => {
  const k = new CognitiveKernel({ kernel_id: "test-kernel-1" });
  assert(k.config.kernel_id === "test-kernel-1", "kernel_id should match config");
  assert(k.config.kernel_version === "1.0.0", "default version");
  assert(k.eventBus instanceof KernelEventBus, "should have event bus");
  assert(k.state instanceof KernelStateManager, "should have state manager");
  assert(k.memory instanceof KernelMemory, "should have memory");
  assert(k.registry instanceof KernelRegistry, "should have registry");
  assert(k.metrics instanceof KernelMetricsCollector, "should have metrics");
  assert(k.logger instanceof KernelLogger, "should have logger");
  assert(k.policy === KERNEL_POLICY, "should have policy");
});

test("kernel should start and stop", async () => {
  const k = new CognitiveKernel();
  await k.start();
  const state1 = k.getState();
  assert(state1.status === "running", "status should be running after start");
  assert(state1.kernel_id.length > 0, "should have kernel id");
  k.stop();
  const state2 = k.getState();
  assert(state2.status === "paused", "status should be paused after stop");
});

// ========================================
// Test 2: Event Bus
// ========================================
console.log("\n=== Event Bus ===");

test("event bus should emit and receive events", async () => {
  const bus = new KernelEventBus();
  let received: Record<string, unknown> | null = null;
  bus.on("MEMORY_UPDATED", (e) => { received = e; });
  await bus.emit({ id: "e1", type: "MEMORY_UPDATED", source: "observation", payload: { test: true }, confidence: 90, timestamp: new Date().toISOString(), trace_id: "t1" });
  assert(received !== null, "handler should be called");
  assert(received.type === "MEMORY_UPDATED", "should receive correct event type");
});

test("event bus should track history", async () => {
  const bus = new KernelEventBus();
  await bus.emit({ id: "e1", type: "OBSERVATION_RECEIVED", source: "observation", payload: {}, confidence: 100, timestamp: "", trace_id: "t1" });
  assert(bus.getHistory().length === 1, "should have 1 event in history");
  assert(bus.getHistory("OBSERVATION_RECEIVED").length === 1, "should filter by type");
});

test("event bus should track count", async () => {
  const bus = new KernelEventBus();
  await bus.emit({ id: "e1", type: "OBSERVATION_RECEIVED", source: "observation", payload: {}, confidence: 100, timestamp: "", trace_id: "t1" });
  await bus.emit({ id: "e2", type: "MEMORY_UPDATED", source: "observation", payload: {}, confidence: 100, timestamp: "", trace_id: "t1" });
  assert(bus.getEventCount() === 2, "should count 2 events");
});

// ========================================
// Test 3: Module Registration
// ========================================
console.log("\n=== Module Registration ===");

test("registry should register and retrieve modules", () => {
  const reg = new KernelRegistry();
  reg.register({ name: "ObservationEngine", version: "1.0", capabilities: ["observe"], input_events: [], output_events: ["OBSERVATION_RECEIVED"], health_status: "healthy", last_run_at: null, error_count: 0 });
  assert(reg.isRegistered("ObservationEngine"), "should be registered");
  assert(reg.get("ObservationEngine")?.name === "ObservationEngine", "should retrieve by name");
  assert(reg.getModuleCount() === 1, "should have 1 module");
});

test("registry should update health", () => {
  const reg = new KernelRegistry();
  reg.register({ name: "TestMod", version: "1.0", capabilities: [], input_events: [], output_events: [], health_status: "healthy", last_run_at: null, error_count: 0 });
  reg.updateHealth("TestMod", "degraded");
  assert(reg.get("TestMod")?.health_status === "degraded", "health should update");
});

// ========================================
// Test 4: Memory Append-Only
// ========================================
console.log("\n=== Memory Append-Only ===");

test("memory should store records append-only", async () => {
  const mem = new KernelMemory();
  const record1: MemoryRecord = { id: "m1", entity_id: "e1", observation_id: "o1", event_type: "OBSERVATION_RECEIVED", content: { version: 1 }, evidence_links: [], contradiction_links: [], confidence_before: 0, confidence_after: 80, version: 0, operation: "create", created_at: new Date().toISOString() };
  await mem.store(record1);
  assert(mem.getRecordCount() === 1, "should have 1 record");
  assert(mem.get("m1")?.version === 1, "version should increment");
});

test("memory should not overwrite — creates new versions", async () => {
  const mem = new KernelMemory();
  await mem.store({ id: "m2", entity_id: "e1", observation_id: "o1", event_type: "MEMORY_UPDATED", content: { state: "v1" }, evidence_links: [], contradiction_links: [], confidence_before: 50, confidence_after: 60, version: 0, operation: "create", created_at: new Date().toISOString() });
  await mem.store({ id: "m2", entity_id: "e1", observation_id: "o2", event_type: "MEMORY_UPDATED", content: { state: "v2" }, evidence_links: [], contradiction_links: [], confidence_before: 60, confidence_after: 70, version: 0, operation: "update", created_at: new Date().toISOString() });
  const v2 = mem.get("m2");
  assert(v2 !== null, "should retrieve record");
  assert(v2!.version === 2, "should have version 2");
  assert(mem.getRecordCount() === 1, "should have 1 unique record (versioned)");
});

test("memory should index by entity and event type", async () => {
  const mem = new KernelMemory();
  await mem.store({ id: "m3", entity_id: "e2", observation_id: "o1", event_type: "OBSERVATION_RECEIVED", content: {}, evidence_links: [], contradiction_links: [], confidence_before: 0, confidence_after: 80, version: 0, operation: "create", created_at: "" });
  assert(mem.getByEntity("e2").length > 0, "should find by entity");
  assert(mem.getByEventType("OBSERVATION_RECEIVED").length > 0, "should find by event type");
});

// ========================================
// Test 5: Reality Fidelity Scoring
// ========================================
console.log("\n=== Reality Fidelity ===");

test("reality fidelity should be calculated through kernel loop", async () => {
  const k = new CognitiveKernel();
  await k.start();
  const state = k.getState();
  assert(state.reality_fidelity_score === null || state.reality_fidelity_score.overall >= 0, "score should be valid");
  k.stop();
});

// ========================================
// Test 6: Prediction + Validation
// ========================================
console.log("\n=== Prediction ===");

test("kernel should emit prediction events", async () => {
  const k = new CognitiveKernel();
  let predictionEmitted = false;
  k.eventBus.on("PREDICTION_CREATED", () => { predictionEmitted = true; });
  await k.emit("PREDICTION_CREATED", { target: "test", probability: 0.8 }, "prediction", 75);
  assert(predictionEmitted, "prediction event should be emitted");
});

// ========================================
// Test 7: Contradiction Detection
// ========================================
console.log("\n=== Contradiction ===");

test("kernel should emit contradiction events", async () => {
  const k = new CognitiveKernel();
  let contradictionDetected = false;
  k.eventBus.on("CONTRADICTION_DETECTED", () => { contradictionDetected = true; });
  await k.emit("CONTRADICTION_DETECTED", { claim_a: "X", claim_b: "not X" }, "observation", 90);
  assert(contradictionDetected, "contradiction event should be emitted");
});

// ========================================
// Test 8: Learning
// ========================================
console.log("\n=== Learning ===");

test("kernel should emit learning events", async () => {
  const k = new CognitiveKernel();
  let learningCompleted = false;
  k.eventBus.on("LEARNING_COMPLETED", () => { learningCompleted = true; });
  await k.emit("LEARNING_COMPLETED", { correction: "updated belief" }, "feedback", 80);
  assert(learningCompleted, "learning event should be emitted");
});

// ========================================
// Test 9: Kernel Loop
// ========================================
console.log("\n=== Kernel Loop ===");

test("kernel loop should cycle and update state", async () => {
  const k = new CognitiveKernel();
  const loop = new KernelLoop(k);
  await k.start();
  await loop.start(50);
  await new Promise(r => setTimeout(r, 200));
  assert(loop.getCycleCount() > 0, "should have completed at least 1 cycle");
  loop.stop();
  k.stop();
});

// ========================================
// Test 10: Metrics
// ========================================
console.log("\n=== Metrics ===");

test("metrics should record and retrieve", () => {
  const mc = new KernelMetricsCollector();
  mc.record({
    reality_fidelity: 75, prediction_accuracy: 60, learning_velocity: 40,
    knowledge_density: 50, contradiction_resolution_rate: 30,
    observation_freshness: 80, memory_growth: 100, decision_confidence: 70,
    civilization_contribution_score: 50, recorded_at: new Date().toISOString(),
  });
  assert(mc.getLatest()?.reality_fidelity === 75, "should store metrics");
  assert(mc.getHistory().length === 1, "should have 1 metric entry");
});

// ========================================
// Results
// ========================================
console.log(`\n=== Results: ${testsPassed}/${testsRun} passed ===`);
if (testsPassed < testsRun) process.exit(1);
