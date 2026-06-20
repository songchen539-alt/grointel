// GENESIS-1 — Kernel Metrics
import { KernelMetrics } from "./genesis_types";

export class KernelMetricsTracker {
  private m: KernelMetrics = { observations_completed: 0, questions_generated: 0, hypotheses_validated: 0, knowledge_revisions: 0, world_updates: 0, decisions_improved: 0, queue_throughput: 0, runtime_utilization: 0, attention_shifts: 0 };

  recordObservation(): void { this.m.observations_completed++; }
  recordQuestion(): void { this.m.questions_generated++; }
  recordValidation(): void { this.m.hypotheses_validated++; }
  recordRevision(): void { this.m.knowledge_revisions++; }
  recordWorldUpdate(): void { this.m.world_updates++; }
  recordDecisionImprovement(): void { this.m.decisions_improved++; }
  recordQueueThroughput(n: number): void { this.m.queue_throughput += n; }
  recordAttentionShift(): void { this.m.attention_shifts++; }
  get(): KernelMetrics { return { ...this.m }; }
}
