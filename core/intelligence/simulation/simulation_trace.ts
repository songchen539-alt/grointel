// GroIntel INT-1 — Simulation Trace
import { SimulationTrace } from "./simulation_types";

export class SimulationTraceRecorder {
  private traces: Map<string, SimulationTrace> = new Map();

  record(trace: SimulationTrace): void {
    this.traces.set(trace.id, trace);
  }

  get(id: string): SimulationTrace | null {
    return this.traces.get(id) || null;
  }

  getByResult(resultId: string): SimulationTrace | null {
    return Array.from(this.traces.values()).find(t => t.result_id === resultId) || null;
  }

  getAll(): SimulationTrace[] {
    return Array.from(this.traces.values());
  }

  clear(): void {
    this.traces.clear();
  }
}
