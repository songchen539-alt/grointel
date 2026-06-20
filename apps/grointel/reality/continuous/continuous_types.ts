// GroIntel REALITY-3 — Continuous Living Types
export type LoopPhase = "attention" | "observe" | "learn" | "curiosity" | "explore" | "queue" | "idle";
export type CoverageArea = "companies" | "supply" | "activities" | "patterns" | "causes" | "hypotheses" | "knowledge";

export interface LivingLoopState { phase: LoopPhase; iteration: number; started_at: string; last_phase_change: string; entities_explored: number; hypotheses_active: number; }

export interface ContinuousAttentionScore { entity_id: string; name: string; score: number; freshness: number; uncertainty: number; confidence_drop: number; hypothesis_count: number; emerging_industry: boolean; rapid_change: boolean; high_impact: boolean; }

export interface ExplorationCandidate { entity: string; reason: string; priority: number; suggested_capabilities: string[]; }

export interface LivingMetrics { reality_coverage: number; knowledge_growth_rate: number; signal_flow_rate: number; evidence_flow: number; world_updates: number; decision_updates: number; active_hypotheses: number; exploration_queue_depth: number; connector_health_avg: number; runtime_health: string; learning_velocity: number; knowledge_age_hours: number; }

export interface ContinuousEvent { id: string; type: string; details: string; entity: string | null; timestamp: string; }
