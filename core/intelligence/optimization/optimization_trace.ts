// GroIntel INT-5 — Optimization Trace
import { OptimizationTrace } from "./optimization_types";

export class OptimizationTraceRecorder {
  private traces: Map<string, OptimizationTrace> = new Map();
  record(t: OptimizationTrace): void { this.traces.set(t.id, t); }
  get(id: string): OptimizationTrace | null { return this.traces.get(id) || null; }
  getByResult(resultId: string): OptimizationTrace | null {
    return Array.from(this.traces.values()).find(t => t.result_id === resultId) || null;
  }
  getAll(): OptimizationTrace[] { return Array.from(this.traces.values()); }
}
