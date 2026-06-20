// GroIntel INT-6 — Decision Trace
import { DecisionTrace } from "./decision_types";

export class DecisionTraceRecorder {
  private traces: Map<string, DecisionTrace> = new Map();
  record(t: DecisionTrace): void { this.traces.set(t.id, t); }
  get(id: string): DecisionTrace | null { return this.traces.get(id) || null; }
  getByDecision(decisionId: string): DecisionTrace | null {
    return Array.from(this.traces.values()).find(t => t.decision_id === decisionId) || null;
  }
  getAll(): DecisionTrace[] { return Array.from(this.traces.values()); }
}
