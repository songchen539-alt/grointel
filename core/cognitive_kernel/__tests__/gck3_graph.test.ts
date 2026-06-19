// GroIntel Cognitive Kernel — GCK-3 Graph Tests
import { GraphEngine } from "../graph/graph_engine";
import { GraphQuery } from "../graph/graph_query";
import { GraphMetricsCollector } from "../graph/graph_metrics";
import { GraphBuilder } from "../graph/graph_builder";
import { CognitiveKernel } from "../kernel";
import { processRealityEvent } from "../kernel_pipeline";
import { COMPANY_FUNDING_EVENT, COMPANY_LAYOFF_EVENT, AI_MODEL_EVENT } from "../__fixtures__/reality_events";

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
  console.log("\n=== GCK-3: Reality Graph Foundation ===\n");

  // ========================================
  // Task 1-3: Node and Edge Creation
  // ========================================
  console.log("--- Node & Edge Creation ---");
  test("create entity node", () => {
    const g = new GraphEngine();
    const node = g.addNode("Entity", "Stripe", "ent-1", 85, 75);
    assert(node.id.length > 0, "node should have id");
    assert(node.type === "Entity", "correct type");
    assert(node.label === "Stripe", "correct label");
    assert(node.confidence === 85, "correct confidence");
  });

  test("prevent duplicate node by externalId", () => {
    const g = new GraphEngine();
    const n1 = g.addNode("Entity", "Stripe", "ent-1", 85, 75);
    const n2 = g.addNode("Entity", "Stripe", "ent-1", 90, 80);
    assert(n1.id === n2.id, "duplicate should return same node");
  });

  test("create edge between nodes", () => {
    const g = new GraphEngine();
    const n1 = g.addNode("Entity", "A");
    const n2 = g.addNode("Entity", "B");
    const edge = g.addEdge("collaborates_with", n1.id, n2.id, 70);
    assert(edge !== null, "edge should be created");
    assert(edge!.type === "collaborates_with", "correct edge type");
    assert(edge!.confidence === 70, "correct confidence");
  });

  test("prevent self-loop edge", () => {
    const g = new GraphEngine();
    const n1 = g.addNode("Entity", "A");
    const edge = g.addEdge("contradicts", n1.id, n1.id);
    assert(edge === null, "self-loop should be rejected");
  });

  test("prevent edge between non-existent nodes", () => {
    const g = new GraphEngine();
    const edge = g.addEdge("mentions", "nonexistent", "also-nonexistent");
    assert(edge === null, "edge should be rejected");
  });

  test("create all node types", () => {
    const g = new GraphEngine();
    const types = ["Entity", "Observation", "Signal", "MemoryRecord", "Prediction", "Contradiction", "Decision", "Capability", "Need", "Opportunity", "Risk", "Knowledge", "Source", "Event"] as const;
    for (const t of types) {
      const n = g.addNode(t, `Test ${t}`);
      assert(n.type === t, `should create ${t} node`);
    }
    assert(g.getNodesByType("Entity").length === 1, "one entity");
  });

  // ========================================
  // Task 4-5: Query Functions
  // ========================================
  console.log("\n--- Query Functions ---");
  test("get neighbors returns connected nodes", () => {
    const g = new GraphEngine();
    const a = g.addNode("Entity", "A");
    const b = g.addNode("Entity", "B");
    const c = g.addNode("Entity", "C");
    g.addEdge("collaborates_with", a.id, b.id);
    g.addEdge("collaborates_with", a.id, c.id);
    const neighbors = g.getNeighbors(a.id);
    assert(neighbors.length === 2, "A should have 2 neighbors");
    assert(neighbors.some(n => n.label === "B"), "B is neighbor");
    assert(neighbors.some(n => n.label === "C"), "C is neighbor");
  });

  test("find path between two nodes", () => {
    const g = new GraphEngine();
    const a = g.addNode("Entity", "A");
    const b = g.addNode("Entity", "B");
    const c = g.addNode("Entity", "C");
    g.addEdge("collaborates_with", a.id, b.id);
    g.addEdge("collaborates_with", b.id, c.id);
    const path = g.findPath(a.id, c.id);
    assert(path !== null, "path should exist");
    assert(path!.length === 3, "A -> B -> C");
  });

  test("return null for unreachable path", () => {
    const g = new GraphEngine();
    const a = g.addNode("Entity", "A");
    const c = g.addNode("Entity", "C");
    const path = g.findPath(a.id, c.id);
    assert(path === null, "no path between disconnected nodes");
  });

  test("find nodes by type", () => {
    const g = new GraphEngine();
    g.addNode("Entity", "E1");
    g.addNode("Observation", "O1");
    g.addNode("Observation", "O2");
    g.addNode("Signal", "S1");
    assert(g.getNodesByType("Observation").length === 2, "2 observations");
    assert(g.getNodesByType("Entity").length === 1, "1 entity");
  });

  test("find edges by type", () => {
    const g = new GraphEngine();
    const a = g.addNode("Entity", "A");
    const b = g.addNode("Entity", "B");
    const c = g.addNode("Entity", "C");
    g.addEdge("collaborates_with", a.id, b.id);
    g.addEdge("competes_with", a.id, c.id);
    assert(g.getEdgesByType("collaborates_with").length === 1, "1 collaborate edge");
    assert(g.getEdgesByType("competes_with").length === 1, "1 compete edge");
  });

  test("get entity subgraph returns all linked nodes", () => {
    const g = new GraphEngine();
    const entity = g.addNode("Entity", "Stripe");
    const obs = g.addNode("Observation", "Funding Round");
    const sig = g.addNode("Signal", "funding_signal");
    const mem = g.addNode("MemoryRecord", "Memory");
    g.addEdge("describes", obs.id, entity.id);
    g.addEdge("mentions", sig.id, entity.id);
    g.addEdge("creates", obs.id, mem.id);
    const subgraph = g.getEntitySubgraph(entity.id);
    assert(subgraph !== null, "subgraph should exist");
    assert(subgraph!.observations.length >= 1, "should have observation");
  });

  // ========================================
  // Task 5: Evidence Chain
  // ========================================
  console.log("\n--- Evidence Chain ---");
  test("evidence chain traces back to sources", () => {
    const g = new GraphEngine();
    const source = g.addNode("Source", "API", "src-1");
    const obs = g.addNode("Observation", "Funding", "obs-1");
    const entity = g.addNode("Entity", "Stripe", "ent-1");
    g.addEdge("observed_from", obs.id, source.id);
    g.addEdge("describes", obs.id, entity.id);
    const chain = g.getEvidenceChain(entity.id);
    assert(chain !== null, "evidence chain should exist");
    assert(chain!.nodes.length >= 2, "should have source in chain");
  });

  // ========================================
  // Task 5: Contradictions Graph
  // ========================================
  console.log("\n--- Contradictions in Graph ---");
  test("contradictions link to conflicting observations", () => {
    const g = new GraphEngine();
    const con = g.addNode("Contradiction", "Headcount conflict", "con-1", 80);
    const obs1 = g.addNode("Observation", "500 layoffs", "obs-1");
    const obs2 = g.addNode("Observation", "50 layoffs", "obs-2");
    g.addEdge("contradicts", con.id, obs1.id, 80);
    g.addEdge("contradicts", con.id, obs2.id, 80);
    const edges = g.getEdges(con.id);
    assert(edges.length === 2, "contradiction links to both observations");
  });

  // ========================================
  // Task 5: Predictions Graph
  // ========================================
  console.log("\n--- Predictions in Graph ---");
  test("predictions link to entities", () => {
    const g = new GraphEngine();
    const ent = g.addNode("Entity", "Stripe", "ent-1");
    const pred = g.addNode("Prediction", "execution_capacity", "pred-1", 75);
    g.addEdge("predicts", pred.id, ent.id, 75);
    const edges = g.getEdges(ent.id);
    assert(edges.some(e => e.type === "predicts"), "prediction linked to entity");
  });

  // ========================================
  // Task 6: Graph Metrics
  // ========================================
  console.log("\n--- Graph Metrics ---");
  test("metrics calculate correctly", () => {
    const g = new GraphEngine();
    const a = g.addNode("Entity", "A");
    const b = g.addNode("Entity", "B");
    const c = g.addNode("Observation", "O1");
    g.addEdge("mentions", c.id, a.id);
    g.addEdge("mentions", c.id, b.id);
    const metrics = g.getMetrics();
    assert(metrics.node_count === 3, "3 nodes");
    assert(metrics.edge_count === 2, "2 edges");
    assert(metrics.entity_degree >= 1, "entity degree calculated");
  });

  test("metrics detect isolated nodes", () => {
    const g = new GraphEngine();
    g.addNode("Entity", "Connected");
    g.addNode("Entity", "Isolated");
    g.addNode("Observation", "O1");
    const metrics = g.getMetrics();
    assert(metrics.isolated_nodes >= 1, "should detect isolated node");
  });

  test("metrics identify most connected entities", () => {
    const g = new GraphEngine();
    const hub = g.addNode("Entity", "Hub");
    for (let i = 0; i < 5; i++) {
      const n = g.addNode("Entity", `Node${i}`);
      g.addEdge("collaborates_with", hub.id, n.id);
    }
    const metrics = g.getMetrics();
    assert(metrics.most_connected_entities.length > 0, "should list connected entities");
    assert(metrics.most_connected_entities[0].label === "Hub", "hub is most connected");
  });

  test("graph metrics collector stores history", () => {
    const g = new GraphEngine();
    const mc = new GraphMetricsCollector();
    g.addNode("Entity", "A");
    g.addNode("Entity", "B");
    mc.collect(g);
    g.addNode("Entity", "C");
    mc.collect(g);
    assert(mc.getHistory().length === 2, "2 metric snapshots");
    assert(mc.getLatest()!.node_count === 3, "latest has 3 nodes");
  });

  // ========================================
  // Task 7-8: Graph Builder + Pipeline Integration
  // ========================================
  console.log("\n--- Graph Builder ---");
  test("graph builder creates nodes from pipeline result", async () => {
    const k = new CognitiveKernel();
    await k.start();
    const result = await processRealityEvent(k, COMPANY_FUNDING_EVENT);
    const metrics = k.graph.getMetrics();
    assert(metrics.node_count > 0, "graph should have nodes");
    assert(metrics.edge_count > 0, "graph should have edges");
  });

  test("graph metrics available in kernel after pipeline", async () => {
    const k = new CognitiveKernel();
    await k.start();
    await processRealityEvent(k, AI_MODEL_EVENT);
    const gMetrics = k.graphMetrics.getLatest();
    assert(gMetrics !== null, "graph metrics should exist");
    assert(gMetrics!.node_count > 0, "nodes created");
  });

  test("multiple events expand the graph", async () => {
    const k = new CognitiveKernel();
    await k.start();
    await processRealityEvent(k, COMPANY_FUNDING_EVENT);
    const c1 = k.graph.getMetrics().node_count;
    await processRealityEvent(k, COMPANY_LAYOFF_EVENT);
    const c2 = k.graph.getMetrics().node_count;
    assert(c2 >= c1, "graph grows with more events");
  });

  test("entity subgraph available via graph query", async () => {
    const k = new CognitiveKernel();
    await k.start();
    await processRealityEvent(k, COMPANY_FUNDING_EVENT);
    const entities = k.graph.getNodesByType("Entity");
    assert(entities.length > 0, "entities in graph");
    if (entities.length > 0) {
      const subgraph = k.graph.getEntitySubgraph(entities[0].id);
      assert(subgraph !== null, "entity subgraph exists");
    }
  });

  // ========================================
  // Task 9: Edge Cases
  // ========================================
  console.log("\n--- Edge Cases ---");
  test("graph query returns null for missing node", () => {
    const g = new GraphEngine();
    assert(g.getNode("nonexistent") === null, "null for missing node");
    assert(g.findPath("a", "b") === null, "null path for missing nodes");
  });

  test("clear resets graph", () => {
    const g = new GraphEngine();
    g.addNode("Entity", "A");
    g.clear();
    assert(g.getMetrics().node_count === 0, "graph cleared");
  });

  test("builder handles empty pipeline result", () => {
    const g = new GraphEngine();
    const b = new GraphBuilder(g);
    const empty: any = { observation: {}, signals: [], entities: [], contradictions: [], fidelity: { overall: 0 }, predictions: [], memoryRecordCount: 0 };
    b.buildFromPipeline(empty);
    // Should not throw
  });

  // ========================================
  // Results
  // ========================================
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed ===`);
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error("Fatal:", e); process.exit(1); });
