// LIFE-1 — Autonomous Learning Loop
import { CuriosityEngine } from "./curiosity_engine";
import { HypothesisManager } from "./hypothesis_manager";
import { ExplorationEngine } from "./exploration_engine";
import { EvidenceAccumulator } from "./evidence_accumulator";
import { KnowledgeRevisionEngine } from "./knowledge_revision_engine";
import { WorldModelUpdater } from "./world_model_updater";
import { LifeMetricsTracker } from "./life_metrics";
import { LifeEventLog } from "./life_event_log";

export class AutonomousLearningLoop {
  public readonly curiosity = new CuriosityEngine();
  public readonly hypotheses = new HypothesisManager();
  public readonly exploration = new ExplorationEngine();
  public readonly evidence = new EvidenceAccumulator();
  public readonly revision = new KnowledgeRevisionEngine();
  public readonly worldUpdater = new WorldModelUpdater();
  public readonly metrics = new LifeMetricsTracker();
  public readonly events = new LifeEventLog();

  runIteration(signals: string[] = [], confidences: { entity: string; confidence: number }[] = [], memoryCount = 0): { questions: number; hypotheses: number; revisions: number; worldChanges: number } {
    // 1. Generate questions
    const questions = this.curiosity.generate(signals, confidences, memoryCount);
    for (const q of questions) {
      this.metrics.recordQuestion();
      this.events.record("question_generated", q.question, q.related_entities[0] || null);
    }

    // 2. Create hypotheses from questions
    let hypothesesCreated = 0;
    for (const q of questions) {
      const h = this.hypotheses.propose(q.question, q.source, q.related_entities);
      this.metrics.recordHypothesis();
      this.events.record("hypothesis_created", h.statement, h.id);
      hypothesesCreated++;

      // 3. Plan exploration
      const plan = this.exploration.plan(q);
      this.events.record("exploration_planned", `${plan.tasks.length} tasks`, h.id);

      // 4. Add simulated evidence
      for (const task of plan.tasks) {
        this.evidence.add(h.id, task.capability, "observed", `Signal from ${task.capability}`, 60);
        this.metrics.recordEvidence();
        this.events.record("evidence_added", `${task.capability} evidence collected`, h.id);
      }

      // Update hypothesis with evidence
      this.hypotheses.addEvidence(h.id, `Explored via ${plan.tasks.length} sources`);
      if (plan.tasks.length >= 3) this.metrics.recordValidation();
    }

    // 5. Revision
    const revisions = this.revision.revise(this.hypotheses, this.evidence);
    for (const rev of revisions) {
      this.metrics.recordKnowledgeRevision();
      this.events.record("knowledge_revised", `${rev.revision_type}: ${rev.reason}`, rev.hypothesis_id);
    }

    // 6. World model updates
    const changes = this.worldUpdater.apply(revisions);
    for (const ch of changes) {
      this.metrics.recordWorldUpdate();
      this.events.record("world_updated", `${ch.change_type}: ${ch.reason}`, ch.entity_id);
    }

    return { questions: questions.length, hypotheses: hypothesesCreated, revisions: revisions.length, worldChanges: changes.length };
  }

  runBatch(count: number): { iterations: number; totalQuestions: number; totalHypotheses: number; totalRevisions: number } {
    let q = 0, h = 0, r = 0;
    for (let i = 0; i < count; i++) {
      const result = this.runIteration();
      q += result.questions; h += result.hypotheses; r += result.revisions;
    }
    return { iterations: count, totalQuestions: q, totalHypotheses: h, totalRevisions: r };
  }
}
