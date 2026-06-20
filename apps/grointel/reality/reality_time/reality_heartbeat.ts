// AWAKENING-3 — Reality Heartbeat
import { RealityHeartbeat } from "./reality_time_types";
import { RealityEventBus } from "./reality_event_bus";

export class RealityHeartbeatGenerator {
  private heartbeatCount = 0;

  generate(bus: RealityEventBus, activeWorkers: number, attentionDist: Record<string, number>, wu: { composite: number }): RealityHeartbeat {
    this.heartbeatCount++;
    const recent = bus.getRecent(100);
    const eventsLastMinute = recent.filter(e => Date.now() - new Date(e.timestamp).getTime() < 60000).length;
    const knowledgeImpacts = recent.filter(e => e.knowledge_impact > 0).length;
    const evidenceVel = recent.filter(e => e.type.includes("evidence") || e.type.includes("signal")).length;
    const predAcc = 75; // would come from reflection engine
    const unknown = 100 - wu.composite;

    return {
      heartbeat_id: this.heartbeatCount, event_count: bus.count(),
      last_event_at: recent.length > 0 ? recent[0].timestamp : null,
      active_workers: activeWorkers, attention_distribution: attentionDist,
      knowledge_velocity: knowledgeImpacts, evidence_velocity: evidenceVel,
      prediction_accuracy: predAcc, world_understanding: wu.composite,
      unknown_frontier: unknown, learning_velocity: Math.round((knowledgeImpacts + evidenceVel) / 2),
      generated_at: new Date().toISOString(),
    };
  }
}
