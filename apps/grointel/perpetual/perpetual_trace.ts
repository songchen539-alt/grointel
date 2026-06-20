// GroIntel PGIR-1 — Perpetual Trace
import { PerpetualTrace } from "./perpetual_types";

export class PerpetualTraceRecorder {
  private traces: PerpetualTrace[] = [];

  record(action: string, entityId: string | null, details: string): PerpetualTrace {
    const t: PerpetualTrace = { id: "ppt_" + (++PerpetualTraceRecorder.counter).toString(16).padStart(6, "0"), action, entity_id: entityId, details, timestamp: new Date().toISOString() };
    this.traces.push(t);
    return t;
  }

  getAll(): PerpetualTrace[] { return this.traces; }
  findByAction(action: string): PerpetualTrace[] { return this.traces.filter(t => t.action === action); }
  private static counter = 0;
}
