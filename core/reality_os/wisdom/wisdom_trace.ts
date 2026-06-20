// GroIntel ROS-5 — Wisdom Trace
import { WisdomTrace, JudgementVerdict } from "./wisdom_types";

let tCounter = 0;
function genId(): string { return "wist_" + (++tCounter).toString(16).padStart(6, "0"); }

export class WisdomTraceRecorder {
  private traces: Map<string, WisdomTrace> = new Map();

  record(decisionId: string, principlesChecked: string[], valuesChecked: string[], verdict: JudgementVerdict, score: number, durationMs: number): WisdomTrace {
    const t: WisdomTrace = { id: genId(), decision_id: decisionId, principles_checked: principlesChecked, values_checked: valuesChecked, verdict, composite_score: score, duration_ms: durationMs, created_at: new Date().toISOString() };
    this.traces.set(t.id, t);
    return t;
  }

  getByDecision(decisionId: string): WisdomTrace | null {
    return Array.from(this.traces.values()).find(t => t.decision_id === decisionId) || null;
  }
  getAll(): WisdomTrace[] { return Array.from(this.traces.values()); }
}
