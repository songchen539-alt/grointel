// GroIntel Cognitive Kernel — Graph Engine
// In-memory graph v1 — no external database
import { GraphNode, GraphNodeType, GraphEdge, GraphEdgeType, GraphMetrics, EntitySubgraph, EvidenceChain } from "./graph_types";

let nodeCounter = 0;
let edgeCounter = 0;
function nid(): string { return "gn_" + (++nodeCounter).toString(16).padStart(6, "0"); }
function eid(): string { return "ge_" + (++edgeCounter).toString(16).padStart(6, "0"); }

export class GraphEngine {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];
  private typeIndex: Map<GraphNodeType, Set<string>> = new Map();
  private adjacency: Map<string, Set<string>> = new Map();
  private externalIndex: Map<string, string> = new Map(); // external_id -> node_id

  addNode(type: GraphNodeType, label: string, externalId: string | null = null, confidence = 50, fidelity = 50, metadata: Record<string, unknown> = {}): GraphNode {
    // Prevent duplicate by external id
    if (externalId && this.externalIndex.has(externalId)) {
      return this.nodes.get(this.externalIndex.get(externalId)!)!;
    }

    const now = new Date().toISOString();
    const node: GraphNode = {
      id: nid(), type, label, external_id: externalId,
      memory_record_id: null, confidence, reality_fidelity: fidelity,
      metadata, version: 1, created_at: now, updated_at: now,
    };

    this.nodes.set(node.id, node);
    if (!this.typeIndex.has(type)) this.typeIndex.set(type, new Set());
    this.typeIndex.get(type)!.add(node.id);
    this.adjacency.set(node.id, new Set());

    if (externalId) this.externalIndex.set(externalId, node.id);

    return node;
  }

  addEdge(type: GraphEdgeType, fromId: string, toId: string, confidence = 50, evidence: string[] = [], metadata: Record<string, unknown> = {}): GraphEdge | null {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) return null;
    if (fromId === toId) return null;

    const edge: GraphEdge = {
      id: eid(), type, from_node_id: fromId, to_node_id: toId,
      confidence, evidence, metadata, created_at: new Date().toISOString(),
    };

    this.edges.push(edge);
    this.adjacency.get(fromId)!.add(toId);
    this.adjacency.get(toId)!.add(fromId);

    return edge;
  }

  getNode(id: string): GraphNode | null { return this.nodes.get(id) || null; }

  getNodesByType(type: GraphNodeType): GraphNode[] {
    const ids = this.typeIndex.get(type);
    return ids ? Array.from(ids).map(id => this.nodes.get(id)!).filter(Boolean) : [];
  }

  getEdges(nodeId: string): GraphEdge[] {
    return this.edges.filter(e => e.from_node_id === nodeId || e.to_node_id === nodeId);
  }

  getEdgesByType(type: GraphEdgeType): GraphEdge[] {
    return this.edges.filter(e => e.type === type);
  }

  getNeighbors(nodeId: string): GraphNode[] {
    const neighborIds = this.adjacency.get(nodeId);
    return neighborIds ? Array.from(neighborIds).map(id => this.nodes.get(id)!).filter(Boolean) : [];
  }

  findByExternalId(externalId: string): GraphNode | null {
    const nodeId = this.externalIndex.get(externalId);
    return nodeId ? this.nodes.get(nodeId) || null : null;
  }

  linkMemory(nodeId: string, memoryRecordId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) node.memory_record_id = memoryRecordId;
  }

  findPath(fromId: string, toId: string, maxDepth = 5): GraphNode[] | null {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) return null;
    const visited = new Set<string>();
    const queue: { id: string; path: GraphNode[] }[] = [{ id: fromId, path: [this.nodes.get(fromId)!] }];
    visited.add(fromId);

    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      if (id === toId) return path;
      if (path.length >= maxDepth) continue;

      for (const neighborId of this.adjacency.get(id) || []) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          const neighbor = this.nodes.get(neighborId)!;
          queue.push({ id: neighborId, path: [...path, neighbor] });
        }
      }
    }
    return null;
  }

  getEntitySubgraph(entityId: string): EntitySubgraph | null {
    const entityNode = this.nodes.get(entityId);
    if (!entityNode) return null;

    const allEdges = this.getEdges(entityId);
    const neighborIds = this.adjacency.get(entityId) || new Set();

    const observations: GraphNode[] = [];
    const signals: GraphNode[] = [];
    const memories: GraphNode[] = [];
    const predictions: GraphNode[] = [];
    const contradictions: GraphNode[] = [];

    for (const nid of neighborIds) {
      const node = this.nodes.get(nid);
      if (!node) continue;
      if (node.type === "Observation") observations.push(node);
      else if (node.type === "Signal") signals.push(node);
      else if (node.type === "MemoryRecord") memories.push(node);
      else if (node.type === "Prediction") predictions.push(node);
      else if (node.type === "Contradiction") contradictions.push(node);
    }

    return {
      entityNode,
      observations, signals, memories, predictions, contradictions,
      relationships: allEdges,
      neighbors: Array.from(neighborIds).map(id => this.nodes.get(id)!).filter(Boolean),
    };
  }

  getEvidenceChain(nodeId: string): EvidenceChain | null {
    const startNode = this.nodes.get(nodeId);
    if (!startNode) return null;

    const chain: GraphEdge[] = [];
    const chainNodes: GraphNode[] = [startNode];
    const visited = new Set<string>();
    visited.add(nodeId);

    // BFS backward through edges
    const queue: string[] = [nodeId];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const incomingEdges = this.edges.filter(e => e.to_node_id === currentId);
      for (const edge of incomingEdges) {
        if (!visited.has(edge.from_node_id)) {
          visited.add(edge.from_node_id);
          chain.push(edge);
          const fromNode = this.nodes.get(edge.from_node_id);
          if (fromNode) chainNodes.push(fromNode);
          queue.push(edge.from_node_id);
        }
      }
    }

    return {
      startNode, chain, nodes: chainNodes,
      confidence: Math.round(startNode.confidence * (chainNodes.length > 0 ? 0.8 : 1)),
    };
  }

  getMetrics(): GraphMetrics {
    const nodeCount = this.nodes.size;
    const edgeCount = this.edges.length;
    const entityNodes = this.getNodesByType("Entity");
    const entitiesWithConnections = entityNodes.filter(e => (this.adjacency.get(e.id)?.size || 0) > 0);

    let totalDegree = 0;
    const degrees: { nodeId: string; label: string; degree: number }[] = [];
    for (const e of entityNodes) {
      const deg = this.adjacency.get(e.id)?.size || 0;
      totalDegree += deg;
      degrees.push({ nodeId: e.id, label: e.label, degree: deg });
    }

    const signalCount = this.getNodesByType("Signal").length;
    const contradictionCount = this.getNodesByType("Contradiction").length;
    const predictionCount = this.getNodesByType("Prediction").length;

    const allFidelities = Array.from(this.nodes.values()).map(n => n.reality_fidelity);
    const avgFidelity = allFidelities.length > 0 ? Math.round(allFidelities.reduce((a, b) => a + b, 0) / allFidelities.length) : 0;
    const isolated = entityNodes.filter(e => (this.adjacency.get(e.id)?.size || 0) === 0);

    degrees.sort((a, b) => b.degree - a.degree);

    return {
      node_count: nodeCount,
      edge_count: edgeCount,
      entity_degree: entityNodes.length > 0 ? Math.round(totalDegree / entityNodes.length) : 0,
      signal_density: nodeCount > 0 ? Math.round((signalCount / nodeCount) * 100) : 0,
      contradiction_density: nodeCount > 0 ? Math.round((contradictionCount / nodeCount) * 100) : 0,
      prediction_density: nodeCount > 0 ? Math.round((predictionCount / nodeCount) * 100) : 0,
      knowledge_density: edgeCount > 0 ? Math.round((edgeCount / Math.max(1, nodeCount)) * 10) : 0,
      trust_density: entityNodes.length > 0 ? Math.round((entitiesWithConnections.length / entityNodes.length) * 100) : 0,
      reality_fidelity_average: avgFidelity,
      isolated_nodes: isolated.length,
      most_connected_entities: degrees.slice(0, 5),
    };
  }

  clear(): void {
    this.nodes.clear();
    this.edges = [];
    this.typeIndex.clear();
    this.adjacency.clear();
    this.externalIndex.clear();
  }
}
