// GroIntel RWS-2 — Attention Trace
import { AttentionTrace } from "./attention_types";

export class AttentionTraceRecorder {
  private traces: AttentionTrace[] = [];
  private maxTraces = 10000;

  record(trace: AttentionTrace): void {
    this.traces.push(trace);
    if (this.traces.length > this.maxTraces) this.traces.shift();
  }

  getTraces(limit = 100): AttentionTrace[] {
    return this.traces.slice(-limit);
  }

  getTracesByDecision(decision: string): AttentionTrace[] {
    return this.traces.filter(t => t.decision === decision);
  }

  getDeepAnalyzeCount(): number {
    return this.traces.filter(t => t.decision === "deep_analyze").length;
  }

  getIgnoreCount(): number {
    return this.traces.filter(t => t.decision === "ignore").length;
  }

  clear(): void {
    this.traces = [];
  }
}
