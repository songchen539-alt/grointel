// GroIntel PGIR-1 — Perpetual Stream (append-only, never stops)
import { PerpetualEvent } from "./perpetual_types";

export class PerpetualStream {
  private events: PerpetualEvent[] = [];
  private listeners: ((event: PerpetualEvent) => void)[] = [];
  private counter = 0;

  push(type: string, entityId: string | null, data: Record<string, unknown>, confidence = 70): PerpetualEvent {
    const ev: PerpetualEvent = {
      id: "evt_" + (++this.counter).toString(16).padStart(6, "0"),
      type, entity_id: entityId, data, observed_at: new Date().toISOString(), confidence,
    };
    this.events.push(ev);
    for (const l of this.listeners) l(ev);
    return ev;
  }

  onEvent(listener: (event: PerpetualEvent) => void): void { this.listeners.push(listener); }
  getEvents(): PerpetualEvent[] { return this.events; }
  getCount(): number { return this.events.length; }
  getSince(timestamp: string): PerpetualEvent[] { return this.events.filter(e => e.observed_at >= timestamp); }
}
