// GroIntel DATA-2 — Supply Source Registry
import { SupplySource, SupplySourceType } from "./supply_types";

export class SupplySourceRegistry {
  private sources: Map<string, SupplySource> = new Map();
  register(type: SupplySourceType, url: string, trustScore = 50, freshness = 60, coverage = 30): SupplySource {
    const id = "ssrc_" + (++SupplySourceRegistry.counter).toString(16).padStart(6, "0");
    const s: SupplySource = { source_id: id, type, url, trust_score: trustScore, freshness, coverage, rate_limit: 100, enabled: true };
    this.sources.set(id, s); return s;
  }
  get(id: string): SupplySource | null { return this.sources.get(id) || null; }
  getAll(): SupplySource[] { return Array.from(this.sources.values()); }
  getByType(type: SupplySourceType): SupplySource[] { return this.getAll().filter(s => s.type === type); }
  count(): number { return this.sources.size; }
  private static counter = 0;
}
