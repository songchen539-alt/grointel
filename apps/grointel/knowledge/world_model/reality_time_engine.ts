// GroIntel KNOWLEDGE-1 — Reality Time Engine (event-driven, no cron)
import { LivingWorldEntity, LivingWorldRelationship, LivingWorldActivity, LivingWorldOutcome, LivingWorldCause, LivingWorldPattern, WorldModelHypothesis } from "./world_model_types";

export class RealityTimeEngine {
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  on(event: string, cb: (data: any) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
  }

  emit(event: string, data: any): void {
    const cbs = this.listeners.get(event);
    if (cbs) for (const cb of cbs) cb(data);
  }

  // Event types — no cron, no schedule
  readonly EVENTS = {
    COMPANY_OBSERVED: "company_observed",
    SUPPLY_OBSERVED: "supply_observed",
    ACTIVITY_OBSERVED: "activity_observed",
    PATTERN_UPDATED: "pattern_updated",
    CAUSE_UPDATED: "cause_updated",
    HYPOTHESIS_UPDATED: "hypothesis_updated",
    PREDICTION_UPDATED: "prediction_updated",
    RECOMMENDATION_UPDATED: "recommendation_updated",
    WORLD_STATE_CHANGED: "world_state_changed",
  };
}
