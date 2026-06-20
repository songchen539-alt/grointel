// GroIntel KNOWLEDGE-1 — World Model Trace
import { WorldModelTrace } from "./world_model_types";

export class WorldModelTraceRecorder {
  private traces: WorldModelTrace[] = []; private counter = 0;
  record(action: string, entityId: string | null, details: string): WorldModelTrace {
    const t: WorldModelTrace = { id:"wmt_"+(++this.counter).toString(16).padStart(6,"0"), action, entity_id: entityId, details, timestamp: new Date().toISOString() };
    this.traces.push(t); return t;
  }
  getAll(): WorldModelTrace[] { return this.traces; }
  findByAction(action: string): WorldModelTrace[] { return this.traces.filter(t => t.action === action); }
}
