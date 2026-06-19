// GroIntel Cognitive Kernel — Metrics
import { KernelMetrics, RealityFidelityScore } from "./kernel_types";

export class KernelMetricsCollector {
  private metrics: KernelMetrics[] = [];
  private maxHistory: number;

  constructor(maxHistory = 1000) {
    this.maxHistory = maxHistory;
  }

  record(metrics: KernelMetrics): void {
    this.metrics.push(metrics);
    if (this.metrics.length > this.maxHistory) {
      this.metrics.shift();
    }
  }

  getLatest(): KernelMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getHistory(limit?: number): KernelMetrics[] {
    if (limit) return this.metrics.slice(-limit);
    return [...this.metrics];
  }

  calculateFromFidelity(fidelity: RealityFidelityScore): KernelMetrics {
    return {
      reality_fidelity: fidelity.overall,
      prediction_accuracy: 0,
      learning_velocity: 0,
      knowledge_density: 0,
      contradiction_resolution_rate: 0,
      observation_freshness: 0,
      memory_growth: 0,
      decision_confidence: fidelity.confidence,
      civilization_contribution_score: 0,
      recorded_at: new Date().toISOString(),
    };
  }

  getRealityFidelityTrend(): number[] {
    return this.metrics.map(m => m.reality_fidelity);
  }

  getPredictionAccuracyTrend(): number[] {
    return this.metrics.map(m => m.prediction_accuracy);
  }
}
