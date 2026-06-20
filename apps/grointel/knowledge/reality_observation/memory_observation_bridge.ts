// GroIntel KNOWLEDGE-2 — Memory Observation Bridge
import { ObservationBatch, ObservationSignal, ObservationDiff } from "./reality_observation_types";
import { CompanyMemoryFlow } from "../../product/company_memory/company_memory_flow";

export class MemoryObservationBridge {
  private counter = 0;

  updateMemory(flow: CompanyMemoryFlow, memoryId: string, batch: ObservationBatch, signals: ObservationSignal[]): boolean {
    const mem = flow.store.get(memoryId);
    if (!mem) return false;

    // Append new snapshot derived from signals
    const oldSnapshot = mem.current_snapshot;
    const newSnapshot = {
      snapshot_id: "obs_snap_" + (++this.counter).toString(16).padStart(6, "0"),
      growth_goal: oldSnapshot.growth_goal,
      target_market: oldSnapshot.target_market,
      budget_range: oldSnapshot.budget_range,
      timeline: oldSnapshot.timeline,
      constraints: oldSnapshot.constraints,
      signals: signals.map(s => `${s.type}:${s.label}:${s.value}`),
      known_unknowns: oldSnapshot.known_unknowns,
      captured_at: new Date().toISOString(),
    };

    flow.store.appendSnapshot(mem, newSnapshot);
    flow.store.updateProfile(mem, { ...mem.current_profile, confidence: Math.min(100, mem.current_profile.confidence + 2) });
    return true;
  }
}
