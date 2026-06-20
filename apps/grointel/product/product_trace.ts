// GroIntel PRODUCT-1 — Product Trace
import { DecisionTrace } from "./growth_decision_types";

export class ProductTraceRecorder {
  private traces: DecisionTrace[] = []; private counter = 0;
  record(action: string, reportId: string, details: string): DecisionTrace {
    const t: DecisionTrace = { id:"pt_"+(++this.counter).toString(16).padStart(6,"0"), action, report_id: reportId, details, timestamp: new Date().toISOString() };
    this.traces.push(t); return t;
  }
  getAll(): DecisionTrace[] { return this.traces; }
  findByAction(action: string): DecisionTrace[] { return this.traces.filter(t => t.action === action); }
}
