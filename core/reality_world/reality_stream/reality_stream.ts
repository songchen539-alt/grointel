// GroIntel Reality World — RealityStream
// Append-only, continuous event stream
import { WorldEvent, DomainName, EventSource, StreamMetrics } from "./world_types";

let eventCounter = 0;
function genId(): string { return "wev_" + (++eventCounter).toString(16).padStart(8, "0"); }
function genTrace(): string { return "trc_" + Math.random().toString(36).slice(2, 10); }

export class RealityStream {
  private events: WorldEvent[] = [];
  private subscribers: Map<string, (event: WorldEvent) => void> = new Map();
  private startTime: number = Date.now();
  private maxEvents: number;
  private domainIndex: Map<string, string[]> = new Map();
  private entityIndex: Map<string, string[]> = new Map();

  constructor(maxEvents = 100000) {
    this.maxEvents = maxEvents;
  }

  publish(
    domain: DomainName,
    eventType: string,
    payload: Record<string, unknown>,
    source: EventSource = "web_scan",
    importance = 50,
    confidence = 70,
    extraDomains: DomainName[] = [],
    entities: string[] = [],
    location: string | null = null,
    language: string | null = null,
  ): WorldEvent {
    const allDomains = [domain, ...extraDomains.filter(d => d !== domain)];
    const event: WorldEvent = {
      id: genId(),
      timestamp: new Date().toISOString(),
      domain,
      domains: allDomains,
      source,
      event_type: eventType,
      importance,
      confidence,
      payload,
      location,
      language,
      entities,
      metadata: { source, version: "1.0" },
      trace_id: genTrace(),
    };

    this.events.push(event);
    if (this.events.length > this.maxEvents) this.events.shift();

    // Index by domain
    for (const d of allDomains) {
      if (!this.domainIndex.has(d)) this.domainIndex.set(d, []);
      this.domainIndex.get(d)!.push(event.id);
    }

    // Index by entity
    for (const e of entities) {
      if (!this.entityIndex.has(e)) this.entityIndex.set(e, []);
      this.entityIndex.get(e)!.push(event.id);
    }

    // Notify subscribers
    for (const cb of this.subscribers.values()) {
      try { cb(event); } catch { /* subscriber error — skip */ }
    }

    return event;
  }

  subscribe(id: string, callback: (event: WorldEvent) => void): void {
    this.subscribers.set(id, callback);
  }

  unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  getRecentEvents(limit = 100): WorldEvent[] {
    return this.events.slice(-limit);
  }

  getEventsByDomain(domain: DomainName, limit = 100): WorldEvent[] {
    const ids = this.domainIndex.get(domain) || [];
    return ids.slice(-limit).map(id => this.events.find(e => e.id === id)).filter(Boolean) as WorldEvent[];
  }

  getEventsByEntity(entity: string, limit = 100): WorldEvent[] {
    const ids = this.entityIndex.get(entity) || [];
    return ids.slice(-limit).map(id => this.events.find(e => e.id === id)).filter(Boolean) as WorldEvent[];
  }

  getStreamSince(timestamp: string): WorldEvent[] {
    return this.events.filter(e => e.timestamp >= timestamp);
  }

  getMetrics(): StreamMetrics {
    const newest = this.events.length > 0 ? this.events[this.events.length - 1] : null;
    const oldest = this.events.length > 0 ? this.events[0] : null;
    const elapsed = (Date.now() - this.startTime) / 1000;
    return {
      total_events_received: this.events.length,
      total_events_routed: this.events.length,
      events_per_second: elapsed > 0 ? Math.round((this.events.length / elapsed) * 100) / 100 : 0,
      domains_active: this.domainIndex.size,
      subscribers_active: this.subscribers.size,
      memory_usage_estimate: this.events.length,
      oldest_event_at: oldest?.timestamp || null,
      newest_event_at: newest?.timestamp || null,
    };
  }

  clear(): void {
    this.events = [];
    this.domainIndex.clear();
    this.entityIndex.clear();
  }
}
