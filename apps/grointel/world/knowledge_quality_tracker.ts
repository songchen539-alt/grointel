// WORLD-1 — Knowledge Quality Tracker
import { KnowledgeQualityMetric } from "./world_metrics_types";

export class KnowledgeQualityTracker {
  private metrics: Map<string, KnowledgeQualityMetric> = new Map();

  update(domain: string, evDensity: number, sourceRep: number, contradictionRate: number, freshness: number, cal: number, validated: number, rejected: number, stale: number): KnowledgeQualityMetric {
    const m: KnowledgeQualityMetric = { domain, evidence_density: evDensity, source_reputation: sourceRep, contradiction_rate: contradictionRate, freshness, confidence_calibration: cal, validated_hypotheses: validated, rejected_hypotheses: rejected, stale_knowledge_pct: stale };
    this.metrics.set(domain, m);
    return m;
  }

  get(domain: string): KnowledgeQualityMetric | null { return this.metrics.get(domain) || null; }
  getAll(): KnowledgeQualityMetric[] { return Array.from(this.metrics.values()); }
  averageQuality(): number { const all = this.getAll(); return all.length > 0 ? Math.round(all.reduce((s, m) => s + (m.evidence_density + m.source_reputation + m.confidence_calibration) / 3, 0) / all.length) : 0; }
}
