// GroIntel INT-6 — Decision Types
export type DecisionType = "observe_more" | "validate_more" | "recommend_action" | "choose_strategy"
  | "select_plan" | "allocate_resources" | "escalate_to_human" | "defer_decision" | "reject_action";

export type ThresholdLevel = "reject_action" | "defer_decision" | "validate_more" | "recommend_action"
  | "recommend_action_with_review" | "high_confidence_recommendation";

export interface DecisionContext {
  entity: string;
  domain: string;
  goal: string;
  optimization_id: string | null;
  strategy_id: string | null;
  plan_id: string | null;
  simulation_id: string | null;
  discovery_ids: string[];
  risk_ids: string[];
  opportunity_ids: string[];
  prediction_accuracy: number;
  reality_fidelity: number;
  learning_velocity: number;
  contradiction_count: number;
  uncertainty_level: number;
}

export interface DecisionOption {
  id: string;
  name: string;
  source: string;
  expected_value: number;
  risk: number;
  evidence_quality: number;
  goal_alignment: number;
  reversibility: number;
  civilization_value: number;
  confidence: number;
  time_horizon_days: number;
}

export interface DecisionEvaluation {
  optimization_score: number;
  evidence_quality: number;
  goal_alignment: number;
  risk_adjusted_value: number;
  reality_fidelity: number;
  reversibility: number;
  civilization_value: number;
  decision_score: number;
}

export interface ThresholdResult {
  threshold_level: ThresholdLevel;
  score: number;
  description: string;
}

export interface ApprovalRequirement {
  required: boolean;
  reasons: string[];
  risk_level: string;
  confidence: number;
}

export interface DecisionRecommendation {
  option: DecisionOption;
  evaluation: DecisionEvaluation;
  threshold: ThresholdResult;
  approval: ApprovalRequirement;
}

export interface Decision {
  id: string;
  type: DecisionType;
  target_entity: string;
  target_domain: string;
  decision_goal: string;
  context: DecisionContext;
  options: DecisionOption[];
  recommendation: DecisionRecommendation;
  rejected_options: { option: DecisionOption; reason: string }[];
  created_at: string;
}

export interface DecisionTrace {
  id: string;
  decision_id: string;
  steps: { step: number; action: string; output: string }[];
  created_at: string;
}
