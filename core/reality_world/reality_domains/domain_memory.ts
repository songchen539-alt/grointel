// GroIntel Reality World — Domain Memory
import { WorldEvent, DomainName, DomainMemory } from "../reality_stream/world_types";

export class DomainMemoryStore {
  private stores: Map<string, DomainMemory> = new Map();
  private defaultCapacity = 10000;

  private getOrCreate(domain: DomainName): DomainMemory {
    const key = domain;
    if (!this.stores.has(key)) {
      this.stores.set(key, {
        events: [], signals: [], entities: [],
        predictions: [], contradictions: [], learning: [],
        capacity: this.defaultCapacity,
      });
    }
    return this.stores.get(key)!;
  }

  addEvent(domain: DomainName, event: WorldEvent): void {
    const store = this.getOrCreate(domain);
    store.events.push(event);
    if (store.events.length > store.capacity) store.events.shift();
    for (const e of event.entities) {
      if (!store.entities.includes(e)) store.entities.push(e);
    }
  }

  getEvents(domain: DomainName, limit = 100): WorldEvent[] {
    const store = this.stores.get(domain);
    return store ? store.events.slice(-limit) : [];
  }

  getEntityCount(domain: DomainName): number {
    return this.stores.get(domain)?.entities.length || 0;
  }

  getEventCount(domain: DomainName): number {
    return this.stores.get(domain)?.events.length || 0;
  }
}
