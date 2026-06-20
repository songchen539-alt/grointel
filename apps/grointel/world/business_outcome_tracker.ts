// WORLD-1 — Business Outcome Tracker
import { BusinessOutcomeMetric } from "./world_metrics_types";

export class BusinessOutcomeTracker {
  private metrics: Map<string, BusinessOutcomeMetric> = new Map();

  update(domain: string, leads: number, cac: number, revenue: number, retention: number, traffic: number, creators: number, partners: number): BusinessOutcomeMetric {
    const m: BusinessOutcomeMetric = { domain, leads_improved: leads, cac_improved: cac, revenue_improved: revenue, retention_improved: retention, traffic_improved: traffic, creator_collabs_improved: creators, partner_matches_improved: partners };
    this.metrics.set(domain, m);
    return m;
  }

  get(domain: string): BusinessOutcomeMetric | null { return this.metrics.get(domain) || null; }
  getAll(): BusinessOutcomeMetric[] { return Array.from(this.metrics.values()); }
  totalImprovements(): number { return this.getAll().reduce((s, m) => s + m.leads_improved + m.cac_improved + m.revenue_improved + m.retention_improved + m.traffic_improved + m.creator_collabs_improved + m.partner_matches_improved, 0); }
}
