// GroIntel Cognitive Kernel — Graph Query
// High-level query functions built on GraphEngine
import { GraphEngine } from "./graph_engine";
import { GraphNode, GraphEdge } from "./graph_types";

export class GraphQuery {
  constructor(private engine: GraphEngine) {}

  getNode(id: string): GraphNode | null { return this.engine.getNode(id); }
  getEdges(nodeId: string): GraphEdge[] { return this.engine.getEdges(nodeId); }
  getNeighbors(nodeId: string): GraphNode[] { return this.engine.getNeighbors(nodeId); }
  findNodesByType(type: string): GraphNode[] { return this.engine.getNodesByType(type as any); }
  findEdgesByType(type: string): GraphEdge[] { return this.engine.getEdgesByType(type as any); }
  findPath(from: string, to: string, maxDepth = 5): GraphNode[] | null { return this.engine.findPath(from, to, maxDepth); }
  getEntitySubgraph(entityId: string) { return this.engine.getEntitySubgraph(entityId); }
  getContradictionsForEntity(entityId: string): GraphNode[] {
    const sub = this.engine.getEntitySubgraph(entityId);
    return sub?.contradictions || [];
  }
  getPredictionsForEntity(entityId: string): GraphNode[] {
    const sub = this.engine.getEntitySubgraph(entityId);
    return sub?.predictions || [];
  }
  getEvidenceChain(nodeId: string) { return this.engine.getEvidenceChain(nodeId); }
}
