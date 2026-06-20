// GroIntel DATA-5 — Cause Trace
import { CauseTrace } from "./cause_types";

export class CauseTraceRecorder {
  private traces: CauseTrace[] = []; private counter = 0;
  record(action: string, causeId: string, details: string): CauseTrace {
    const t: CauseTrace = { id:"ct_"+(++this.counter).toString(16).padStart(6,"0"), action, cause_id: causeId, details, timestamp: new Date().toISOString() };
    this.traces.push(t); return t;
  }
  getAll(): CauseTrace[] { return this.traces; }
  findByAction(action: string): CauseTrace[] { return this.traces.filter(t => t.action === action); }
}
