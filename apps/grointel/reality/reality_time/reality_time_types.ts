// GroIntel AWAKENING-3 — Reality Time Types
export type WorkerType = "reality" | "knowledge" | "decision" | "memory" | "reflection" | "evolution" | "validation" | "scheduler";

export interface RealityEvent {
  id: string; type: string; entity: string; entity_type: string;
  source: string; confidence: number; importance: "low" | "medium" | "high" | "critical";
  evidence: string; knowledge_impact: number; decision_impact: number; world_impact: number;
  payload: Record<string, unknown>; timestamp: string;
}

export interface RealityHeartbeat {
  heartbeat_id: number; event_count: number; last_event_at: string | null;
  active_workers: number; attention_distribution: Record<string, number>;
  knowledge_velocity: number; evidence_velocity: number;
  prediction_accuracy: number; world_understanding: number;
  unknown_frontier: number; learning_velocity: number; generated_at: string;
}

export interface ContinuousWorkerState {
  id: string; type: WorkerType; status: "idle" | "processing" | "waiting" | "error";
  events_processed: number; last_event_at: string | null; uptime_events: number;
}

export interface AttentionDrivenSchedule {
  entity: string; current_attention: number; knowledge_age: number; confidence: number;
  uncertainty: number; prediction_error: number; business_importance: number;
  observation_cost: number; change_velocity: number; expected_information_gain: number;
  priority_score: number;
}

export interface WorldUnderstandingIndex {
  reality_coverage: number; evidence_density: number; knowledge_confidence: number;
  prediction_accuracy: number; decision_accuracy: number; blind_spot_reduction: number;
  freshness: number; relationship_completeness: number; entity_completeness: number;
  unknown_space: number; composite: number;
}
