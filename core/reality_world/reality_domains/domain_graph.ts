// GroIntel Reality World — Domain Graph
import { DomainName } from "../reality_stream/world_types";

export class DomainGraph {
  private adjacencies: Map<string, Set<string>> = new Map();
  private nodeLabels: Map<string, string> = new Map();

  addNode(id: string, label: string): void {
    if (!this.adjacencies.has(id)) {
      this.adjacencies.set(id, new Set());
      this.nodeLabels.set(id, label);
    }
  }

  addEdge(fromId: string, toId: string): void {
    this.addNode(fromId, this.nodeLabels.get(fromId) || fromId);
    this.addNode(toId, this.nodeLabels.get(toId) || toId);
    this.adjacencies.get(fromId)!.add(toId);
    this.adjacencies.get(toId)!.add(fromId);
  }

  getNeighbors(id: string): string[] {
    return Array.from(this.adjacencies.get(id) || []);
  }

  getNodeCount(): number { return this.adjacencies.size; }
  getEdgeCount(): number {
    let count = 0;
    for (const [_, neighbors] of this.adjacencies) count += neighbors.size;
    return Math.floor(count / 2);
  }
}
