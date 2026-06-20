// WORLD-1 — Decision Accuracy Tracker
import { DecisionAccuracyMetric } from "./world_metrics_types";

export class DecisionAccuracyTracker {
  private metrics: Map<string, DecisionAccuracyMetric> = new Map();

  update(domain: string, predObs: number, cal: number, acceptance: number, success: number, improvements: number): DecisionAccuracyMetric {
    const m: DecisionAccuracyMetric = { domain, predicted_vs_observed: predObs, confidence_calibration: cal, recommendation_acceptance: acceptance, recommendation_success: success, decision_improvements: improvements };
    this.metrics.set(domain, m);
    return m;
  }

  get(domain: string): DecisionAccuracyMetric | null { return this.metrics.get(domain) || null; }
  getAll(): DecisionAccuracyMetric[] { return Array.from(this.metrics.values()); }
  averageAccuracy(): number { const all = this.getAll(); return all.length > 0 ? Math.round(all.reduce((s, m) => s + m.predicted_vs_observed, 0) / all.length) : 0; }
}
