// GENESIS-2 — Exploration Memory
import { ExplorationMemoryEntry } from "./exploration_types";

export class ExplorationMemory {
  private entries: ExplorationMemoryEntry[] = [];
  private counter = 0;

  record(entityName: string, sourceType: string, url: string, signalHash: string, signalCount: number): ExplorationMemoryEntry {
    const existing = this.entries.find(e => e.url === url);
    if (existing) {
      existing.last_visited = new Date().toISOString();
      existing.last_signal_hash = signalHash;
      existing.signal_count += signalCount;
      existing.visit_count++;
      return existing;
    }
    const entry: ExplorationMemoryEntry = { id: "emem_" + (++this.counter).toString(16).padStart(6, "0"), entity_name: entityName, source_type: sourceType, url, last_visited: new Date().toISOString(), last_signal_hash: signalHash, signal_count: signalCount, visit_count: 1 };
    this.entries.push(entry);
    return entry;
  }

  getByEntity(entityName: string): ExplorationMemoryEntry[] { return this.entries.filter(e => e.entity_name === entityName); }
  getStale(maxAgeHours = 48): ExplorationMemoryEntry[] { return this.entries.filter(e => Date.now() - new Date(e.last_visited).getTime() > maxAgeHours * 3600000); }
  getAll(): ExplorationMemoryEntry[] { return this.entries; }
}
