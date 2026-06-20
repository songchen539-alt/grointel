// GroIntel DATA-2 — Supply Trace
import { SupplyTrace } from "./supply_types";

export class SupplyTraceRecorder {
  private traces: SupplyTrace[] = [];
  private counter = 0;
  record(action: string, supplyId: string, details: string): SupplyTrace {
    const t: SupplyTrace = { id:"st_"+(++this.counter).toString(16).padStart(6,"0"), action, supply_id: supplyId, details, timestamp: new Date().toISOString() };
    this.traces.push(t); return t;
  }
  getAll(): SupplyTrace[] { return this.traces; }
  findByAction(action: string): SupplyTrace[] { return this.traces.filter(t => t.action === action); }
}
