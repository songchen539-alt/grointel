// WORLD-1 — Reality Coverage Tracker
import { RealityCoverageMetric } from "./world_metrics_types";

export class RealityCoverageTracker {
  private metrics: Map<string, RealityCoverageMetric> = new Map();

  update(domain: string, totalTargets: number, covered: number, confidence: number): RealityCoverageMetric {
    const m: RealityCoverageMetric = { domain, total_targets: totalTargets, covered, coverage_pct: Math.round(covered / Math.max(1, totalTargets) * 100), confidence };
    this.metrics.set(domain, m);
    return m;
  }

  get(domain: string): RealityCoverageMetric | null { return this.metrics.get(domain) || null; }
  getAll(): RealityCoverageMetric[] { return Array.from(this.metrics.values()); }
  averageCoverage(): number { const all = this.getAll(); return all.length > 0 ? Math.round(all.reduce((s, m) => s + m.coverage_pct, 0) / all.length) : 0; }
}
