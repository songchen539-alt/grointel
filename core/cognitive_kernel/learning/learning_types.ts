// GroIntel Cognitive Kernel — Learning Types
export type ValidationResult = "validated" | "partially_validated" | "invalidated" | "miss" | "insufficient_evidence";
export type ComparisonResult = "exact_match" | "partial_match" | "directional_match" | "miss" | "opposite_outcome" | "unknown";
export type CorrectionType = "increase_confidence" | "decrease_confidence" | "update_entity_state" | "add_known_unknown" | "create_contradiction" | "adjust_rule_weight" | "mark_source_unreliable" | "request_more_evidence";

export interface PredictionValidation {
  id: string;
  prediction_id: string;
  entity_id: string;
  expected_state: unknown;
  observed_state: unknown;
  validation_result: ValidationResult;
  confidence_before: number;
  confidence_after: number;
  evidence_used: string[];
  created_at: string;
}

export interface ObservedOutcome {
  id: string;
  prediction_id: string;
  entity_id: string;
  observed_state: unknown;
  source: string;
  confidence: number;
  observation_id: string;
  created_at: string;
}

export interface OutcomeComparison {
  id: string;
  prediction_id: string;
  expected_state: unknown;
  observed_state: unknown;
  comparison: ComparisonResult;
  difference_description: string;
  confidence: number;
  created_at: string;
}

export interface LearningInsight {
  id: string;
  prediction_id: string;
  comparison_id: string;
  what_was_expected: string;
  what_happened: string;
  why_difference_may_exist: string;
  what_kernel_should_update: string[];
  future_prediction_adjustment: string;
  severity: number;
  created_at: string;
}

export interface KernelCorrection {
  id: string;
  learning_insight_id: string;
  correction_type: CorrectionType;
  target_id: string;
  target_type: string;
  previous_value: unknown;
  new_value: unknown;
  reason: string;
  created_at: string;
}

export interface ConfidenceUpdate {
  id: string;
  correction_id: string;
  target_id: string;
  target_type: string;
  confidence_before: number;
  confidence_after: number;
  version: number;
  created_at: string;
}

export interface LearningTrace {
  id: string;
  prediction_id: string;
  validation: PredictionValidation;
  comparison: OutcomeComparison;
  insight: LearningInsight;
  corrections: KernelCorrection[];
  confidence_updates: ConfidenceUpdate[];
  created_at: string;
}
