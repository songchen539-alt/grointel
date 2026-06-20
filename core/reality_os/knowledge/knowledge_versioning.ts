// GroIntel ROS-4 — Knowledge Versioning (append-only history)
import { KnowledgeFact, KnowledgeVersion } from "./knowledge_types";

let vCounter = 0;
function genId(): string { return "kv_" + (++vCounter).toString(16).padStart(6, "0"); }

export class KnowledgeVersioning {
  private versions: Map<string, KnowledgeVersion[]> = new Map();

  record(fact: KnowledgeFact, reason: string, source: string): KnowledgeVersion {
    const v: KnowledgeVersion = {
      id: genId(), fact_id: fact.id, version: fact.version,
      snapshot: { ...fact }, // shallow copy
      diff: `v${fact.version} -> created/updated`,
      reason, source,
      timestamp: new Date().toISOString(),
    };
    const list = this.versions.get(fact.id) || [];
    list.push(v);
    this.versions.set(fact.id, list);
    return v;
  }

  getHistory(factId: string): KnowledgeVersion[] { return this.versions.get(factId) || []; }
  getLatest(factId: string): KnowledgeVersion | null {
    const list = this.versions.get(factId);
    return list && list.length > 0 ? list[list.length - 1] : null;
  }
  getAll(): KnowledgeVersion[] { return Array.from(this.versions.values()).flat(); }
}
