// GroIntel KNOWLEDGE-2 — Decision Reactivity Engine
import { DecisionConfidenceUpdater } from "../../product/company_memory/decision_confidence_updater";
import { RealityDiffEngine } from "../../product/company_memory/reality_diff_engine";
import { CompanyMemoryFlow } from "../../product/company_memory/company_memory_flow";
import { ObservationBatch, ObservationSignal } from "./reality_observation_types";

export class DecisionReactivityEngine {
  private diffEngine = new RealityDiffEngine();
  private confidenceUpdater = new DecisionConfidenceUpdater();

  react(flow: CompanyMemoryFlow, memoryId: string, batch: ObservationBatch, signals: ObservationSignal[]): { decision_updated: boolean; confidence_change: number } {
    const mem = flow.store.get(memoryId);
    if (!mem || mem.decisions.length === 0) return { decision_updated: false, confidence_change: 0 };

    const oldSnapshot = mem.current_snapshot;
    const newSnapshot = {
      snapshot_id: "react_" + Date.now().toString(36),
      growth_goal: oldSnapshot.growth_goal,
      target_market: oldSnapshot.target_market,
      budget_range: oldSnapshot.budget_range,
      timeline: oldSnapshot.timeline,
      constraints: oldSnapshot.constraints,
      signals: signals.map(s => `${s.type}:${s.value}`),
      known_unknowns: oldSnapshot.known_unknowns,
      captured_at: new Date().toISOString(),
    };
    const diff = this.diffEngine.diff(oldSnapshot, newSnapshot);

    if (diff.overall_impact === "none") return { decision_updated: false, confidence_change: 0 };

    const lastDecision = mem.decisions[mem.decisions.length - 1];
    const update = this.confidenceUpdater.update(lastDecision, diff);
    return { decision_updated: true, confidence_change: update.delta };
  }
}
