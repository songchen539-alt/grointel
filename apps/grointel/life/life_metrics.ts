// LIFE-1 — Life Metrics
import { LifeMetrics } from "./life_types";

export class LifeMetricsTracker {
  private m: LifeMetrics = { questions_generated: 0, hypotheses_created: 0, hypotheses_validated: 0, hypotheses_rejected: 0, evidence_collected: 0, world_updates: 0, knowledge_revisions: 0, decision_improvements: 0 };

  recordQuestion(): void { this.m.questions_generated++; }
  recordHypothesis(): void { this.m.hypotheses_created++; }
  recordValidation(): void { this.m.hypotheses_validated++; }
  recordRejection(): void { this.m.hypotheses_rejected++; }
  recordEvidence(): void { this.m.evidence_collected++; }
  recordWorldUpdate(): void { this.m.world_updates++; }
  recordKnowledgeRevision(): void { this.m.knowledge_revisions++; }
  recordDecisionImprovement(): void { this.m.decision_improvements++; }

  get(): LifeMetrics { return { ...this.m }; }
  reset(): void { this.m = { questions_generated: 0, hypotheses_created: 0, hypotheses_validated: 0, hypotheses_rejected: 0, evidence_collected: 0, world_updates: 0, knowledge_revisions: 0, decision_improvements: 0 }; }
}
