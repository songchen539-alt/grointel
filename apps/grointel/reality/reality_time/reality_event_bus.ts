// AWAKENING-3 — Reality Event Bus (event-driven core)
import { RealityEvent } from "./reality_time_types";

export class RealityEventBus {
  private events: RealityEvent[] = [];
  private listeners: Map<string, Set<(event: RealityEvent) => void>> = new Map();
  private counter = 0;
  public eventCount = 0;

  emit(type: string, entity: string, entityType: string, source: string, confidence: number, importance: "low"|"medium"|"high"|"critical", evidence: string, knowledgeImpact: number, decisionImpact: number, worldImpact: number, payload: Record<string, unknown> = {}): RealityEvent {
    const event: RealityEvent = {
      id: "re_" + (++this.counter).toString(16).padStart(6, "0"),
      type, entity, entity_type: entityType, source, confidence, importance,
      evidence, knowledge_impact: knowledgeImpact, decision_impact: decisionImpact,
      world_impact: worldImpact, payload, timestamp: new Date().toISOString(),
    };
    this.events.push(event);
    this.eventCount++;
    const subs = this.listeners.get(type);
    if (subs) for (const cb of subs) cb(event);
    return event;
  }

  on(type: string, callback: (event: RealityEvent) => void): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(callback);
  }

  getRecent(limit = 50): RealityEvent[] { return this.events.slice(-limit).reverse(); }
  getByEntity(entity: string): RealityEvent[] { return this.events.filter(e => e.entity === entity); }
  count(): number { return this.events.length; }
}
