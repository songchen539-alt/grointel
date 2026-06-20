// REALITY-3 — Living Metrics Tracker
import { LivingMetrics } from "./continuous_types";

export class LivingMetricsTracker {
  private m: LivingMetrics = { reality_coverage: 0, knowledge_growth_rate: 0, signal_flow_rate: 0, evidence_flow: 0, world_updates: 0, decision_updates: 0, active_hypotheses: 0, exploration_queue_depth: 0, connector_health_avg: 0, runtime_health: "active", learning_velocity: 0, knowledge_age_hours: 0 };
  private signalHistory: number[] = [];
  private evidenceHistory: number[] = [];

  recordSignal(): void { this.m.signal_flow_rate++; this.signalHistory.push(Date.now()); if (this.signalHistory.length > 100) this.signalHistory.shift(); }
  recordEvidence(): void { this.m.evidence_flow++; this.evidenceHistory.push(Date.now()); if (this.evidenceHistory.length > 100) this.evidenceHistory.shift(); }
  recordWorldUpdate(): void { this.m.world_updates++; }
  recordDecisionUpdate(): void { this.m.decision_updates++; }
  setHypotheses(n: number): void { this.m.active_hypotheses = n; }
  setQueueDepth(n: number): void { this.m.exploration_queue_depth = n; }
  setCoverage(n: number): void { this.m.reality_coverage = n; }
  setKnowledgeGrowth(n: number): void { this.m.knowledge_growth_rate = n; }
  setConnectorHealth(n: number): void { this.m.connector_health_avg = n; }

  get(): LivingMetrics {
    const now = Date.now();
    this.m.signal_flow_rate = this.signalHistory.filter(t => now - t < 3600000).length;
    this.m.evidence_flow = this.evidenceHistory.filter(t => now - t < 3600000).length;
    this.m.learning_velocity = Math.round((this.m.knowledge_growth_rate + this.m.signal_flow_rate) / 2);
    return { ...this.m };
  }
}
