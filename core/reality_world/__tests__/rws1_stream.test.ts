// GroIntel Reality World — RWS-1 Stream Tests
import { RealityStream } from "../reality_stream/reality_stream";
import { RealityRouter } from "../event_router/reality_router";
import { WorldStateManager } from "../world_state/world_state";
import { DomainRegistry } from "../reality_domains/domain_registry";
import { DomainMemoryStore } from "../reality_domains/domain_memory";
import { DomainGraph } from "../reality_domains/domain_graph";
import { RealityScheduler } from "../schedulers/reality_scheduler";
import { DomainName } from "../reality_stream/world_types";

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error("FAIL: " + msg);
}

let passed = 0, failed = 0;
function test(name: string, fn: () => Promise<void> | void): void {
  try {
    const r = fn();
    if (r instanceof Promise) {
      r.then(() => { passed++; console.log("  PASS:", name); }).catch(e => { failed++; console.log("  FAIL:", name, "-", e.message); });
    } else {
      passed++;
      console.log("  PASS:", name);
    }
  } catch (e: any) {
    failed++;
    console.log("  FAIL:", name, "-", e.message);
  }
}

async function run() {
  console.log("\n=== RWS-1: Reality Stream Foundation ===\n");

  // === TASK 1-2: Reality Stream ===
  console.log("--- Reality Stream ---");
  test("publish event returns event with id", () => {
    const s = new RealityStream();
    const event = s.publish("Business", "funding", { amount: "$10M" }, "web_scan", 80, 85);
    assert(event.id.length > 0, "event has id");
    assert(event.domain === "Business", "correct domain");
    assert(event.event_type === "funding", "correct event type");
    assert(event.importance === 80, "correct importance");
  });

  test("append-only — events never deleted without limit", () => {
    const s = new RealityStream(100);
    for (let i = 0; i < 50; i++) s.publish("General", "test", { i });
    assert(s.getRecentEvents(200).length === 50, "50 events stored");
  });

  test("old events removed when limit exceeded", () => {
    const s = new RealityStream(10);
    for (let i = 0; i < 20; i++) s.publish("General", "test", { i });
    assert(s.getRecentEvents(200).length === 10, "only 10 events retained");
  });

  test("events indexed by domain", () => {
    const s = new RealityStream();
    s.publish("AI", "ai_release", {});
    s.publish("AI", "ai_release", {});
    s.publish("Business", "funding", {});
    assert(s.getEventsByDomain("AI").length === 2, "2 AI events");
    assert(s.getEventsByDomain("Business").length === 1, "1 Business event");
  });

  test("events indexed by entity", () => {
    const s = new RealityStream();
    s.publish("Business", "funding", {}, "web_scan", 50, 70, [], ["Stripe"]);
    s.publish("Business", "funding", {}, "web_scan", 50, 70, [], ["Stripe"]);
    assert(s.getEventsByEntity("Stripe").length === 2, "2 events for Stripe");
  });

  test("stream metrics calculated", () => {
    const s = new RealityStream();
    s.publish("Technology", "product_launch", {});
    const m = s.getMetrics();
    assert(m.total_events_received === 1, "1 event counted");
    assert(m.domains_active >= 1, "at least 1 domain");
  });

  test("stream since timestamp", () => {
    const s = new RealityStream();
    const before = new Date().toISOString();
    s.publish("General", "test", {});
    const after = s.getStreamSince(before);
    assert(after.length === 1, "event found after timestamp");
  });

  // === TASK 3: Domains ===
  console.log("\n--- Domains ---");
  test("all 24 domains registered by default", () => {
    const reg = new DomainRegistry();
    const all = reg.getAllDomains();
    assert(all.length === 25, "25 domains (24 + General)");
    assert(reg.isRegistered("Technology"), "Technology registered");
    assert(reg.isRegistered("Healthcare"), "Healthcare registered");
    assert(reg.isRegistered("Climate"), "Climate registered");
  });

  test("domain dynamically extensible", () => {
    const reg = new DomainRegistry();
    reg.registerDomain("Space");
    assert(reg.isRegistered("Space"), "Space added dynamically");
  });

  test("domain updates after events", () => {
    const reg = new DomainRegistry();
    reg.updateDomain("AI", { confidence: 80, velocity: 70 });
    const ai = reg.getDomain("AI");
    assert(ai !== null, "AI exists");
    assert(ai!.confidence === 80, "confidence updated");
    assert(ai!.event_count === 1, "event count incremented");
  });

  // === TASK 4: Router ===
  console.log("\n--- Router ---");
  test("funding event routes to Investment/Finance/Business", () => {
    const r = new RealityRouter();
    const domains = r.getRoute("funding");
    assert(domains.includes("Investment"), "routes to Investment");
    assert(domains.includes("Finance"), "routes to Finance");
    assert(domains.includes("Business"), "routes to Business");
  });

  test("unknown event type routes to General", () => {
    const r = new RealityRouter();
    const domains = r.getRoute("unknown_type");
    assert(domains.includes("General"), "unknown routes to General");
  });

  test("routes dynamically extensible", () => {
    const r = new RealityRouter();
    r.route("custom_event", "Technology", "AI");
    const domains = r.getRoute("custom_event");
    assert(domains.includes("Technology"), "custom routes to Technology");
    assert(domains.includes("AI"), "custom routes to AI");
  });

  // === TASK 5: World State ===
  console.log("\n--- World State ---");
  test("world state records events", () => {
    const ws = new WorldStateManager();
    ws.recordEvent("Technology", 80, 70);
    const state = ws.getState();
    assert(state.global_event_count === 1, "1 event recorded");
    assert(state.domains["Technology"] !== undefined, "Technology domain exists");
    assert(state.domains["Technology"].event_count === 1, "1 Technology event");
  });

  test("world state updates continuously", () => {
    const ws = new WorldStateManager();
    ws.recordEvent("AI", 90, 85);
    ws.recordEvent("AI", 60, 50);
    ws.recordEvent("Business", 70, 75);
    const state = ws.getState();
    assert(state.global_event_count === 3, "3 total events");
    assert(state.domains["AI"].event_count === 2, "2 AI events");
    assert(state.domains["Business"].event_count === 1, "1 Business event");
  });

  test("world state history", () => {
    const ws = new WorldStateManager();
    ws.recordEvent("Technology", 50, 50);
    ws.recordEvent("AI", 50, 50);
    assert(ws.getHistory().length >= 2, "history recorded");
  });

  // === TASK 6: Domain Memory ===
  console.log("\n--- Domain Memory ---");
  test("domain memory stores events", () => {
    const s = new RealityStream();
    const dm = new DomainMemoryStore();
    const event = s.publish("Technology", "product_launch", { name: "GPT-5" });
    dm.addEvent("Technology", event);
    assert(dm.getEventCount("Technology") === 1, "1 event in memory");
    assert(dm.getEvents("Technology").length === 1, "events retrievable");
  });

  test("domain memory tracks entities", () => {
    const s = new RealityStream();
    const dm = new DomainMemoryStore();
    dm.addEvent("AI", s.publish("AI", "ai_release", {}, "web_scan", 50, 70, [], ["OpenAI"]));
    assert(dm.getEntityCount("AI") >= 1, "entities tracked");
  });

  // === TASK 7: Domain Graph ===
  console.log("\n--- Domain Graph ---");
  test("domain graph connects nodes", () => {
    const g = new DomainGraph();
    g.addNode("event-1", "funding");
    g.addNode("entity-1", "Stripe");
    g.addEdge("event-1", "entity-1");
    assert(g.getNodeCount() === 2, "2 nodes");
    assert(g.getEdgeCount() === 1, "1 edge");
    assert(g.getNeighbors("event-1").includes("entity-1"), "entity is neighbor");
  });

  test("domain graph handles duplicates", () => {
    const g = new DomainGraph();
    g.addNode("e1", "test");
    g.addNode("e1", "test");
    assert(g.getNodeCount() === 1, "no duplicate node");
  });

  // === TASK 8: Scheduler ===
  console.log("\n--- Scheduler ---");
  test("scheduler publishes and routes events", async () => {
    const sch = new RealityScheduler();
    sch.start(100);
    sch.publishEvent("Business", "funding", { amount: "$10M" }, 80, 85, ["Stripe"]);
    await new Promise(r => setTimeout(r, 50));
    const state = sch.getWorldState().getState();
    assert(state.global_event_count >= 1, "event processed");
    sch.stop();
  });

  test("scheduler notifies kernel callback", async () => {
    const sch = new RealityScheduler();
    let notified = false;
    sch.onKernelEvent(() => { notified = true; });
    sch.start(100);
    sch.publishEvent("Technology", "product_launch", {});
    await new Promise(r => setTimeout(r, 50));
    assert(notified, "kernel callback invoked");
    sch.stop();
  });

  test("scheduler domain registry updates", async () => {
    const sch = new RealityScheduler();
    sch.start(100);
    sch.publishEvent("AI", "ai_release", { model: "GPT-5" }, 90, 95);
    await new Promise(r => setTimeout(r, 50));
    const ai = sch.getDomainRegistry().getDomain("AI");
    assert(ai !== null, "AI domain exists");
    assert(ai!.event_count >= 1, "AI event counted");
    sch.stop();
  });

  test("scheduler stores domain memory", async () => {
    const sch = new RealityScheduler();
    sch.start(100);
    sch.publishEvent("Healthcare", "breakthrough", { drug: "new" }, 95, 90);
    await new Promise(r => setTimeout(r, 50));
    const mem = sch.getDomainMemory("Healthcare");
    assert(mem !== null, "Healthcare memory exists");
    assert(mem!.getEventCount("Healthcare") >= 1, "event stored");
    sch.stop();
  });

  test("scheduler builds domain graph", async () => {
    const sch = new RealityScheduler();
    sch.start(100);
    sch.publishEvent("Technology", "product_launch", {}, 50, 70, ["OpenAI"]);
    await new Promise(r => setTimeout(r, 50));
    const graph = sch.getDomainGraph("Technology");
    assert(graph !== null, "Technology graph exists");
    assert(graph!.getNodeCount() >= 1, "graph has nodes");
    sch.stop();
  });

  // === TASK 9: Stream API ===
  console.log("\n--- Stream API ---");
  test("get recent events", () => {
    const s = new RealityStream();
    s.publish("Business", "funding", {});
    s.publish("Technology", "product_launch", {});
    const recent = s.getRecentEvents(10);
    assert(recent.length === 2, "2 recent events");
  });

  test("subscription notified of events", async () => {
    const s = new RealityStream();
    let received: any = null;
    s.subscribe("test", (e) => { received = e; });
    s.publish("General", "test", {});
    assert(received !== null, "subscriber notified");
    assert(received!.event_type === "test", "correct event type");
  });

  test("unsubscribe stops notifications", () => {
    const s = new RealityStream();
    let count = 0;
    s.subscribe("test", () => { count++; });
    s.unsubscribe("test");
    s.publish("General", "test", {});
    assert(count === 0, "no notifications after unsubscribe");
  });

  // === TASK 10: Edge Cases ===
  console.log("\n--- Edge Cases ---");
  test("stream handles high volume", () => {
    const s = new RealityStream(1000);
    for (let i = 0; i < 500; i++) s.publish("General", "bulk", { i });
    assert(s.getMetrics().total_events_received === 500, "500 events stored");
  });

  test("domain events indexed after publish", () => {
    const s = new RealityStream();
    s.publish("Climate", "report", { co2: "high" });
    assert(s.getEventsByDomain("Climate").length === 1, "Climate event indexed");
  });

  test("clear resets stream", () => {
    const s = new RealityStream();
    s.publish("General", "test", {});
    s.clear();
    assert(s.getRecentEvents().length === 0, "stream empty after clear");
  });

  test("scheduler cycle count increments", async () => {
    const sch = new RealityScheduler();
    sch.start(50);
    await new Promise(r => setTimeout(r, 200));
    assert(sch.getCycleCount() > 0, "cycles completed");
    sch.stop();
  });

  // ========================================
  // Results
  // ========================================
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed ===`);
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error("Fatal:", e); process.exit(1); });
