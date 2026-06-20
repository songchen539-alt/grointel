// GroIntel EVOLUTION-1 — Evolution Types
export type ReflectionDomain = "knowledge" | "decision" | "prediction" | "pattern" | "cause_graph" | "hypothesis" | "attention" | "exploration" | "workers" | "connectors" | "runtime" | "memory" | "world_model" | "learning";

export interface ReflectionResult { id: string; domain: ReflectionDomain; score: number; findings: string[]; recommendations: string[]; timestamp: string; }
export interface BlindSpot { id: string; domain: string; description: string; severity: "low" | "medium" | "high" | "critical"; evidence: string[]; suggested_action: string; }
export interface OptimizationProposal { id: string; title: string; description: string; expected_impact: string; risk: number; evidence: string[]; status: "proposed" | "approved" | "applied" | "rejected"; created_at: string; }
export interface WisdomEntry { id: string; statement: string; domain: string; confidence: number; evidence_count: number; first_observed: string; last_validated: string; cross_domain: boolean; }
export interface SelfEvaluation { knowledge_quality: number; decision_quality: number; prediction_accuracy: number; pattern_stability: number; evidence_reliability: number; learning_velocity: number; reflection_quality: number; coverage_completeness: number; hypothesis_success_rate: number; attention_efficiency: number; connector_accuracy: number; overall_intelligence_index: number; }
export interface EvolutionEvent { id: string; type: string; details: string; timestamp: string; }
