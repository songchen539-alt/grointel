// REALITY-3 — Living Loop Flow (continuous orchestration)
import { LivingLoopState, LoopPhase, ContinuousAttentionScore, ExplorationCandidate } from "./continuous_types";
import { LivingMetricsTracker } from "./living_metrics";
import { ContinuousAttentionManager } from "./continuous_attention";
import { ContinuousCuriosityEngine } from "./continuous_curiosity";
import { ContinuousSafetyGuard } from "./continuous_safety";
import { ConnectorRegistry } from "../connectors/connector_registry";

export class LivingLoopFlow {
  public readonly metrics = new LivingMetricsTracker();
  public readonly attention = new ContinuousAttentionManager();
  public readonly curiosity = new ContinuousCuriosityEngine();
  public readonly safety = new ContinuousSafetyGuard();
  public readonly connectors = new ConnectorRegistry();

  public queue: ExplorationCandidate[] = [];
  private state: LivingLoopState = { phase: "idle", iteration: 0, started_at: new Date().toISOString(), last_phase_change: new Date().toISOString(), entities_explored: 0, hypotheses_active: 0 };

  get currentState(): LivingLoopState { return { ...this.state }; }

  setPhase(phase: LoopPhase): void { this.state.phase = phase; this.state.last_phase_change = new Date().toISOString(); }

  runIteration(entities?: { id: string; name: string; freshness: number; knowledge_uncertainty: number; confidence: number; hypothesis_count: number; emerging_industry: boolean; rapid_change: boolean; high_impact: boolean }[]): { phase: LoopPhase; explored: number; candidates: number } {
    this.state.iteration++;
    let explored = 0;

    // Phase 1: Attention
    this.setPhase("attention");
    const scores = this.attention.score(entities || [{id:"default",name:"Default",freshness:50,knowledge_uncertainty:30,confidence:70,hypothesis_count:0,emerging_industry:false,rapid_change:false,high_impact:false}]);
    this.metrics.setHypotheses(scores.reduce((s, sc) => s + sc.hypothesis_count, 0));

    // Phase 2: Observe (process top attention target)
    this.setPhase("observe");
    const topTarget = scores[0];
    if (topTarget && topTarget.score > 20) {
      // Use connector registry to observe
      this.connectors.runAll(topTarget.entity_id).then(result => {
        for (const sig of result.signals) this.metrics.recordSignal();
        for (const ev of result.evidence) this.metrics.recordEvidence();
      });
      this.state.entities_explored++;
      explored++;
    }

    // Phase 3: Learn
    this.setPhase("learn");
    if (scores.some(s => s.confidence_drop > 20)) {
      this.metrics.recordWorldUpdate();
      this.metrics.recordDecisionUpdate();
    }

    // Phase 4: Curiosity
    this.setPhase("curiosity");
    const curiosityCandidates = this.curiosity.generateFromHypotheses(
      scores.filter(s => s.hypothesis_count > 0).length,
      scores.filter(s => s.hypothesis_count > 0).length,
      scores.filter(s => s.confidence_drop > 30).length
    );

    // Phase 5: Explore
    this.setPhase("explore");
    const candidates = this.attention.generateCandidates(scores, this.queue.length);
    this.queue = [...this.queue, ...curiosityCandidates, ...candidates].slice(0, 20);
    this.metrics.setQueueDepth(this.queue.length);

    // Safety check
    const safetyCheck = this.safety.check(0, this.queue.length, this.state.iteration);
    if (!safetyCheck.allowed) {
      this.setPhase("idle");
      return { phase: "idle", explored, candidates: 0 };
    }

    // Phase 6: Queue
    this.setPhase("queue");
    if (this.queue.length > 0 && scores.length > 0) {
      const next = this.queue.shift()!;
      this.connectors.runAll(next.entity);
    }

    this.setPhase("idle");
    return { phase: "idle", explored, candidates: candidates.length };
  }

  getPhase(): LoopPhase { return this.state.phase; }
  getIteration(): number { return this.state.iteration; }
  getQueue(): ExplorationCandidate[] { return [...this.queue]; }
}
