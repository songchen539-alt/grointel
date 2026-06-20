// GroIntel DATA-5 — Cause Chain Builder
import { CauseChain, CauseNode, CauseEdge } from "./cause_types";

export class CauseChainBuilder {
  private counter = 0;

  build(name: string, nodes: CauseNode[], edges: CauseEdge[], supportingPatterns: string[], supportingCompanies: string[]): CauseChain {
    return {
      id: "cc_" + (++this.counter).toString(16).padStart(6, "0"),
      name, nodes: nodes.map(n => n.id), edges: edges.map(e => e.id),
      confidence: Math.round(edges.reduce((s, e) => s + e.confidence, 0) / Math.max(1, edges.length)),
      supporting_patterns: supportingPatterns, supporting_companies: supportingCompanies,
    };
  }

  inferChain(nodes: CauseNode[], edges: CauseEdge[], startNodeId: string, endNodeId: string): CauseChain | null {
    const path: CauseEdge[] = [];
    let current = startNodeId;
    for (let i = 0; i < 20; i++) {
      const next = edges.filter(e => e.source_id === current);
      if (next.length === 0) break;
      const chosen = next[0];
      path.push(chosen);
      current = chosen.target_id;
      if (current === endNodeId) break;
    }
    if (path.length === 0 || path[path.length - 1].target_id !== endNodeId) return null;
    // Filter nodes in path
    const involvedIds = new Set<string>();
    involvedIds.add(startNodeId); involvedIds.add(endNodeId);
    path.forEach(e => { involvedIds.add(e.source_id); involvedIds.add(e.target_id); });
    const involvedNodes = nodes.filter(n => involvedIds.has(n.id));
    return this.build(`Chain: ${nodes.find(n => n.id === startNodeId)?.name || startNodeId} → ${nodes.find(n => n.id === endNodeId)?.name || endNodeId}`, involvedNodes, path, [], []);
  }
}
