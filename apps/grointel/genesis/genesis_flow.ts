// GENESIS-1 — Genesis Flow (connect all subsystems)
import { LivingKernel } from "./living_kernel";
import { AutonomousLearningLoop } from "../life/autonomous_learning_loop";
import { CompanyMemoryFlow } from "../product/company_memory/company_memory_flow";

export class GenesisFlow {
  public readonly kernel = new LivingKernel();
  public readonly life = new AutonomousLearningLoop();

  runFullCycle(memories: { id: string; changes: number; confidence: number; hypotheses: number; freshness: number; volatility: number }[]): { attention: number; plans: number; lifeResults: any } {
    // 1. Attention
    const entities = memories.map(m => ({ id: m.id, recent_changes: m.changes, confidence_drop: Math.max(0, 80 - m.confidence), hypothesis_count: m.hypotheses, observation_freshness: m.freshness, signal_volatility: m.volatility }));
    const attention = this.kernel.runAttention(entities);

    // 2. Schedule from attention
    const plans = this.kernel.runScheduler(attention, this.life.hypotheses.getActive().length, this.life.hypotheses.getActive().filter(h => h.status === "supported").length, memories.filter(m => m.freshness < 30).length);

    // 3. Life iteration
    const lifeResult = this.life.runIteration();

    // 4. World clock
    this.kernel.clock.tickObservation();
    this.kernel.clock.tickLearning();
    this.kernel.clock.tickDecision();
    this.kernel.clock.tickWorldUpdate();

    // 5. Metrics
    this.kernel.metrics.recordObservation();
    this.kernel.metrics.recordQuestion();
    this.kernel.metrics.recordQueueThroughput(plans.length);
    this.kernel.events.record("kernel_iteration_completed", `Full cycle: ${attention.length} attention targets, ${plans.length} plans, ${lifeResult.questions} questions`);

    return { attention: attention.length, plans: plans.length, lifeResults: lifeResult };
  }
}
