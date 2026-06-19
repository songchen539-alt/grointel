// GroIntel Reality World — WorldState
import { DomainName, DomainState, WorldState } from "../reality_stream/world_types";

let stateCounter = 0;
function genId(): string { return "ws_" + (++stateCounter).toString(16).padStart(6, "0"); }

export class WorldStateManager {
  private domains: Map<DomainName, DomainState> = new Map();
  private history: WorldState[] = [];
  private maxHistory = 100;
  private totalEvents = 0;

  registerDomain(domain: DomainName): void {
    if (!this.domains.has(domain)) {
      this.domains.set(domain, {
        domain,
        current_status: "active",
        trend: 0, velocity: 0,
        risk_level: 30, opportunity_level: 50,
        confidence: 50, reality_fidelity: 30,
        knowledge_density: 0, prediction_accuracy: 0,
        learning_velocity: 0, event_count: 0,
        last_event_at: null,
      });
    }
  }

  recordEvent(domain: DomainName, importance: number, confidence: number): void {
    this.totalEvents++;
    this.registerDomain(domain);
    const state = this.domains.get(domain)!;
    state.event_count++;
    state.last_event_at = new Date().toISOString();
    state.velocity = Math.round((state.velocity + importance) / 2);
    state.confidence = Math.round((state.confidence + confidence) / 2);
    state.reality_fidelity = Math.min(100, state.reality_fidelity + 1);
    state.learning_velocity = Math.round(state.learning_velocity * 0.95 + 5);
    this.snapshot();
  }

  snapshot(): WorldState {
    const allDomains = Array.from(this.domains.values());
    const state: WorldState = {
      domains: Object.fromEntries(this.domains),
      global_event_count: this.totalEvents,
      global_confidence: Math.round(allDomains.reduce((s, d) => s + d.confidence, 0) / Math.max(1, allDomains.length)),
      global_reality_fidelity: Math.round(allDomains.reduce((s, d) => s + d.reality_fidelity, 0) / Math.max(1, allDomains.length)),
      global_prediction_accuracy: Math.round(allDomains.reduce((s, d) => s + d.prediction_accuracy, 0) / Math.max(1, allDomains.length)),
      global_learning_velocity: Math.round(allDomains.reduce((s, d) => s + d.learning_velocity, 0) / Math.max(1, allDomains.length)),
      last_event_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.history.push(state);
    if (this.history.length > this.maxHistory) this.history.shift();
    return state;
  }

  getState(): WorldState {
    return this.snapshot();
  }

  getDomainState(domain: DomainName): DomainState | null {
    return this.domains.get(domain) || null;
  }

  getHistory(): WorldState[] {
    return [...this.history];
  }
}
