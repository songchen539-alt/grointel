// GroIntel ROS-4 — Knowledge Trace
import { KnowledgeTrace } from "./knowledge_types";

let tCounter = 0;
function genId(): string { return "ktr_" + (++tCounter).toString(16).padStart(6, "0"); }

export class KnowledgeTraceRecorder {
  private traces: KnowledgeTrace[] = [];

  record(action: string, entityId: string | null, factId: string | null, details: string): KnowledgeTrace {
    const t: KnowledgeTrace = { id: genId(), action, entity_id: entityId, fact_id: factId, timestamp: new Date().toISOString(), details };
    this.traces.push(t);
    return t;
  }

  getAll(): KnowledgeTrace[] { return this.traces; }
  findByEntity(entityId: string): KnowledgeTrace[] { return this.traces.filter(t => t.entity_id === entityId); }
  findByFact(factId: string): KnowledgeTrace[] { return this.traces.filter(t => t.fact_id === factId); }
  findByAction(action: string): KnowledgeTrace[] { return this.traces.filter(t => t.action === action); }
}
