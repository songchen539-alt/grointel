// GroIntel KNOWLEDGE-2 — Knowledge2 Flow (main orchestrator)
import { ObservationResult, ObservationBatch, ObservationSignal, ObservationDiff } from "./reality_observation_types";
import { CompanyObserver } from "./company_observer";
import { ObservationNormalizer } from "./observation_normalizer";
import { ObservationDiffEngine } from "./observation_diff_engine";
import { MemoryObservationBridge } from "./memory_observation_bridge";
import { DecisionReactivityEngine } from "./decision_reactivity_engine";
import { ObservationScheduler } from "./observation_scheduler";
import { CompanyMemoryFlow } from "../../product/company_memory/company_memory_flow";

export class Knowledge2Flow {
  public readonly observer = new CompanyObserver();
  public readonly normalizer = new ObservationNormalizer();
  public readonly diffEngine = new ObservationDiffEngine();
  public readonly bridge = new MemoryObservationBridge();
  public readonly decisionReactivity = new DecisionReactivityEngine();
  public readonly scheduler = new ObservationScheduler();

  private previousSignals: Map<string, ObservationSignal[]> = new Map();

  observeAndUpdate(flow: CompanyMemoryFlow, memoryId: string, companyWebsite: string): ObservationResult {
    const { batch, job } = this.scheduler.trigger(flow, memoryId, companyWebsite, this.observer);
    const signals = this.normalizer.normalize(batch);
    const prevSig = this.previousSignals.get(memoryId) || [];
    const diff = this.diffEngine.diff(prevSig, batch);
    this.previousSignals.set(memoryId, signals);

    const memUpdated = this.bridge.updateMemory(flow, memoryId, batch, signals);
    const decisionUpdate = this.decisionReactivity.react(flow, memoryId, batch, signals);

    const mem = flow.store.get(memoryId);
    return {
      batch, diff,
      memory_updated: memUpdated,
      decision_updated: decisionUpdate.decision_updated,
      workspace_state: (mem || {}) as any,
    };
  }

  simulateAndUpdate(flow: CompanyMemoryFlow, memoryId: string, simulatedSignals: Record<string, string>): ObservationResult {
    const batch = this.scheduler.simulateObservation(flow, memoryId, simulatedSignals);
    const signals = this.normalizer.normalize(batch);
    const prevSig = this.previousSignals.get(memoryId) || [];
    const diff = this.diffEngine.diff(prevSig, batch);
    this.previousSignals.set(memoryId, signals);

    const memUpdated = this.bridge.updateMemory(flow, memoryId, batch, signals);
    const decisionUpdate = this.decisionReactivity.react(flow, memoryId, batch, signals);

    const mem = flow.store.get(memoryId);
    return {
      batch, diff,
      memory_updated: memUpdated,
      decision_updated: decisionUpdate.decision_updated,
      workspace_state: (mem || {}) as any,
    };
  }
}
