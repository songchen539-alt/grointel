// GroIntel CRS-1 — Civilization Registry
import { CivilizationNode, CivilizationIdentity, ReputationScore } from "./civilization_types";

export class CivilizationRegistry {
  private nodes: Map<string, CivilizationNode> = new Map();

  register(identity: CivilizationIdentity): CivilizationNode {
    if (this.nodes.has(identity.id)) throw new Error(`Node '${identity.id}' already registered`);
    const node: CivilizationNode = {
      identity, current_state: "active", last_active: new Date().toISOString(),
      reputation: {
        prediction_accuracy: 70, truth_preservation: 75, knowledge_quality: 70,
        contribution: 50, trustworthiness: 75, learning_rate: 60, composite: 67,
      },
      shared_truths: [],
    };
    this.nodes.set(identity.id, node);
    return node;
  }

  get(id: string): CivilizationNode | null { return this.nodes.get(id) || null; }
  getAll(): CivilizationNode[] { return Array.from(this.nodes.values()); }
  exists(id: string): boolean { return this.nodes.has(id); }
  count(): number { return this.nodes.size; }
  updateLastActive(id: string): void {
    const n = this.nodes.get(id);
    if (n) n.last_active = new Date().toISOString();
  }
}
