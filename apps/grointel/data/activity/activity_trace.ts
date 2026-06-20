// GroIntel DATA-3 — Activity Trace
import { ActivityTrace } from "./activity_types";

export class ActivityTraceRecorder {
  private traces: ActivityTrace[] = [];
  private counter = 0;
  record(action: string, activityId: string, details: string): ActivityTrace {
    const t: ActivityTrace = { id:"atr_"+(++this.counter).toString(16).padStart(6,"0"), action, activity_id: activityId, details, timestamp: new Date().toISOString() };
    this.traces.push(t); return t;
  }
  getAll(): ActivityTrace[] { return this.traces; }
  findByAction(action: string): ActivityTrace[] { return this.traces.filter(t => t.action === action); }
}
