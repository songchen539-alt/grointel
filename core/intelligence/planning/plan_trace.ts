// GroIntel INT-2 — Plan Trace
import { PlanTrace } from "./planning_types";

let trCounter = 0;
function genId(): string { return "ptr_" + (++trCounter).toString(16).padStart(6, "0"); }

export class PlanTraceRecorder {
  private traces: Map<string, PlanTrace> = new Map();

  record(trace: PlanTrace): void {
    this.traces.set(trace.id, trace);
  }

  get(id: string): PlanTrace | null { return this.traces.get(id) || null; }
  getByPlan(planId: string): PlanTrace | null {
    return Array.from(this.traces.values()).find(t => t.plan_id === planId) || null;
  }
  getAll(): PlanTrace[] { return Array.from(this.traces.values()); }
  clear(): void { this.traces.clear(); }
}
