// GroIntel DATA-5 — Cause Graph
import { CauseNode, CauseEdge, CauseNodeType, CauseEdgeType, CauseChain } from "./cause_types";

export class CauseGraph {
  public nodes: Map<string, CauseNode> = new Map();
  public edges: Map<string, CauseEdge> = new Map();
  public chains: Map<string, CauseChain> = new Map();

  addNode(n: CauseNode): void { this.nodes.set(n.id, n); }
  addEdge(e: CauseEdge): void { this.edges.set(e.id, e); }

  getNode(id: string): CauseNode | null { return this.nodes.get(id) || null; }
  getEdge(id: string): CauseEdge | null { return this.edges.get(id) || null; }
  getAllNodes(): CauseNode[] { return Array.from(this.nodes.values()); }
  getAllEdges(): CauseEdge[] { return Array.from(this.edges.values()); }

  getEdgesFrom(sourceId: string): CauseEdge[] { return this.getAllEdges().filter(e => e.source_id === sourceId); }
  getEdgesTo(targetId: string): CauseEdge[] { return this.getAllEdges().filter(e => e.target_id === targetId); }
  getEdgesByType(type: CauseEdgeType): CauseEdge[] { return this.getAllEdges().filter(e => e.type === type); }

  getNodeTypes(): CauseNodeType[] { return ["company","person","product","supply","activity","pattern","decision","market","technology","capability","trust","evidence","outcome"]; }
  getEdgeTypes(): CauseEdgeType[] { return ["causes","contributes_to","blocks","accelerates","delays","amplifies","weakens","depends_on"]; }

  findPath(fromId: string, toId: string, maxDepth = 5): { path: CauseEdge[]; found: boolean } {
    const visited = new Set<string>();
    const path: CauseEdge[] = [];
    const dfs = (currentId: string, depth: number): boolean => {
      if (depth > maxDepth || visited.has(currentId)) return false;
      visited.add(currentId);
      if (currentId === toId && depth > 0) return true;
      for (const edge of this.getEdgesFrom(currentId)) {
        path.push(edge);
        if (dfs(edge.target_id, depth + 1)) return true;
        path.pop();
      }
      return false;
    };
    dfs(fromId, 0);
    return { path, found: path.length > 0 };
  }

  addChain(chain: CauseChain): void { this.chains.set(chain.id, chain); }
  getChain(id: string): CauseChain | null { return this.chains.get(id) || null; }
  getAllChains(): CauseChain[] { return Array.from(this.chains.values()); }
  countNodes(): number { return this.nodes.size; }
  countEdges(): number { return this.edges.size; }
}
