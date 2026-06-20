// LIFE-1 — Life Event Log (append-only)
import { LifeEvent, LifeEventEntry } from "./life_types";

export class LifeEventLog {
  private entries: LifeEventEntry[] = [];
  private counter = 0;

  record(event: LifeEvent, details: string, entityId: string | null): LifeEventEntry {
    const entry: LifeEventEntry = { id: "levt_" + (++this.counter).toString(16).padStart(6, "0"), event, details, related_entity_id: entityId, timestamp: new Date().toISOString() };
    this.entries.push(entry);
    return entry;
  }

  getAll(): LifeEventEntry[] { return this.entries; }
  getRecent(limit = 20): LifeEventEntry[] { return this.entries.slice(-limit).reverse(); }
  findByEvent(event: LifeEvent): LifeEventEntry[] { return this.entries.filter(e => e.event === event); }
  count(): number { return this.entries.length; }
}
