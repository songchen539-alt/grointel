// GroIntel DATA-4 — Pattern Trace
import { PatternTrace } from "./pattern_types";

export class PatternTraceRecorder {
  private traces: PatternTrace[] = []; private counter = 0;
  record(action: string, patternId: string, details: string): PatternTrace {
    const t: PatternTrace = { id:"pt_"+(++this.counter).toString(16).padStart(6,"0"), action, pattern_id: patternId, details, timestamp: new Date().toISOString() };
    this.traces.push(t); return t;
  }
  getAll(): PatternTrace[] { return this.traces; }
  findByAction(action: string): PatternTrace[] { return this.traces.filter(t => t.action === action); }
}
