// GroIntel INT-4 — Discovery Types
export type DiscoveryType =
  | "anomaly" | "pattern" | "weak_signal" | "opportunity" | "risk" | "gap"
  | "contradiction_cluster" | "emerging_trend" | "capability_gap" | "trust_gap"
  | "market_gap" | "knowledge_gap";

export interface Discovery {
  id: string;
  type: DiscoveryType;
  title: string;
  description: string;
  domain: string;
  target_entities: string[];
  novelty_score: number;
  impact_score: number;
  confidence: number;
  uncertainty: number;
  evidence: string[];
  recommended_next_observation: string;
  created_at: string;
}

export interface Anomaly {
  id: string;
  type: string; // "trend_deviation" | "event_spike" | "velocity_change" | "contradiction_spike" | "prediction_failure_spike" | "attention_spike"
  description: string;
  severity: number;
  affected_domain: string;
  current_value: number;
  expected_value: number;
  deviation: number;
  confidence: number;
}

export interface Pattern {
  id: string;
  type: string; // "signal_combination" | "opportunity_structure" | "risk_structure" | "growth_loop" | "trust_failure" | "capability_gap_pattern"
  description: string;
  frequency: number;
  confidence: number;
  supporting_cases: number;
}

export interface WeakSignal {
  id: string;
  description: string;
  novelty: number;
  upside_potential: number;
  confidence: number;
  domain: string;
  cross_domain: boolean;
  early_indicators: string[];
}

export interface OpportunityDiscovery {
  id: string;
  type: string; // "demand_without_supply" | "trust_gap" | "tech_shift" | "repeated_pain" | "capability_mismatch"
  description: string;
  confidence: number;
  potential_value: number;
  prerequisites: string[];
}

export interface RiskDiscovery {
  id: string;
  type: string; // "rising_contradictions" | "declining_trust" | "regulation_velocity" | "prediction_failures" | "funding_decline" | "layoffs" | "source_decay"
  description: string;
  severity: number;
  confidence: number;
  affected_entities: string[];
}

export interface GapDiscovery {
  id: string;
  type: string; // "knowledge" | "capability" | "data" | "trust" | "market" | "execution" | "evidence"
  description: string;
  severity: number;
  confidence: number;
  bridging_suggestion: string;
}

export interface DiscoveryHypothesis {
  id: string;
  claim: string;
  supporting_evidence: string[];
  confidence: number;
  testable_prediction: string;
}

export interface DiscoveryTrace {
  id: string;
  discovery_id: string;
  sources: string[];
  steps: { step: number; detector: string; output: string }[];
  created_at: string;
}
