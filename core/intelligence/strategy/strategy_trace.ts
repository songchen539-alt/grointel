// GroIntel INT-3 — Strategy Trace
import { StrategyTrace } from "./strategy_types";

export class StrategyTraceRecorder {
  private traces: Map<string, StrategyTrace> = new Map();
  record(trace: StrategyTrace): void { this.traces.set(trace.id, trace); }
  get(id: string): StrategyTrace | null { return this.traces.get(id) || null; }
  getByStrategy(strategyId: string): StrategyTrace | null {
    return Array.from(this.traces.values()).find(t => t.strategy_id === strategyId) || null;
  }
  getAll(): StrategyTrace[] { return Array.from(this.traces.values()); }
  clear(): void { this.traces.clear(); }
}
