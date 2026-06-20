// GroIntel DATA-4 — Pattern Library
import { GrowthPattern } from "./pattern_types";

export class PatternLibrary {
  private patterns: Map<string, GrowthPattern> = new Map();

  add(p: GrowthPattern): void { this.patterns.set(p.id, p); }
  get(id: string): GrowthPattern | null { return this.patterns.get(id) || null; }
  getAll(): GrowthPattern[] { return Array.from(this.patterns.values()); }
  getByCluster(cluster: string): GrowthPattern[] { return this.getAll().filter(p => p.cluster === cluster); }
  getValidated(): GrowthPattern[] { return this.getAll().filter(p => p.status === "validated" || p.status === "stable"); }
  count(): number { return this.patterns.size; }
}
