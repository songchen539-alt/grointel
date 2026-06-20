// GroIntel DATA-5 — Cause Types
export type CauseNodeType = "company" | "person" | "product" | "supply" | "activity" | "pattern" | "decision" | "market" | "technology" | "capability" | "trust" | "evidence" | "outcome";
export type CauseEdgeType = "causes" | "contributes_to" | "blocks" | "accelerates" | "delays" | "amplifies" | "weakens" | "depends_on";

export interface CauseNode { id: string; type: CauseNodeType; name: string; confidence: number; created_at: string; }
export interface CauseEdge { id: string; source_id: string; target_id: string; type: CauseEdgeType; strength: number; confidence: number; evidence: string[]; created_at: string; updated_at: string; }
export interface CauseChain { id: string; name: string; nodes: string[]; edges: string[]; confidence: number; supporting_patterns: string[]; supporting_companies: string[]; }
export interface CauseEvidence { id: string; edge_id: string; source: string; observation_id: string; confidence: number; timestamp: string; }
export interface CauseStrength { frequency: number; effect_size: number; confidence: number; time_delay_days: number; cross_company_reuse: number; cross_industry_reuse: number; composite: number; }
export interface CauseConfidence { sample_size: number; validation_rate: number; prediction_consistency: number; temporal_ordering_score: number; contradiction_rate: number; composite: number; }
export interface CauseValidation { id: string; edge_id: string; observation_count: number; temporal_ordering_confirmed: boolean; evidence_score: number; prediction_consistent: boolean; confidence_threshold_met: boolean; passed: boolean; validated_at: string; }
export interface CauseTrace { id: string; action: string; cause_id: string; details: string; timestamp: string; }
