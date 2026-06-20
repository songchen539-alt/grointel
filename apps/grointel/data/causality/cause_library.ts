// GroIntel DATA-5 — Cause Library
import { CauseNode, CauseEdge, CauseChain } from "./cause_types";

export class CauseLibrary {
  addNode(n: CauseNode, graph: { nodes: Map<string, CauseNode> }): void { graph.nodes.set(n.id, n); }
  addEdge(e: CauseEdge, graph: { edges: Map<string, CauseEdge> }): void { graph.edges.set(e.id, e); }
  addChain(chain: CauseChain, graph: { chains: Map<string, CauseChain> }): void { graph.chains.set(chain.id, chain); }
}
