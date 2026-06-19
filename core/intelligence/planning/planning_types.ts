// GroIntel INT-2 — Planning Types
export type ActionType = "observe_more" | "validate_evidence" | "reduce_uncertainty" | "increase_capability"
  | "mitigate_risk" | "capture_opportunity" | "improve_trust" | "improve_prediction"
  | "increase_knowledge_density" | "recommend_growth_action";

export type PathType = "conservative_path" | "balanced_path" | "aggressive_path" | "exploratory_path";

export interface PlanGoal {
  id: string;
  source_goal_id: string;
  description: string;
  desired_state: Record<string, unknown>;
  success_metrics: string[];
  constraints: string[];
  priority: number;
  time_horizon_days: number;
}

export interface ActionCandidate {
  id: string;
  type: ActionType;
  description: string;
  effort: number;
  expected_impact: number;
  confidence: number;
  prerequisites: string[];
  risks: string[];
}

export interface PlanStep {
  id: string;
  order: number;
  action: ActionCandidate;
  dependencies: string[];
  estimated_time_days: number;
  status: "pending" | "in_progress" | "completed" | "blocked";
}

export interface PlanDependency {
  id: string;
  from_step_id: string;
  to_step_id: string;
  type: "step" | "evidence" | "capability" | "data" | "trust" | "domain";
  description: string;
  satisfied: boolean;
}

export interface PlanConstraint {
  type: "budget" | "time" | "risk_tolerance" | "civilization_health" | "reality_fidelity" | "data_confidence" | "legal" | "resource" | "ethical";
  description: string;
  limit: number;
  current: number;
  violated: boolean;
}

export interface PlanPath {
  id: string;
  type: PathType;
  steps: PlanStep[];
  estimated_total_days: number;
  expected_outcome: string;
  failure_points: string[];
  confidence: number;
}

export interface PlanRisk {
  description: string;
  likelihood: number;
  impact: number;
  mitigation: string;
}

export interface PlanEvaluation {
  feasibility_score: number;
  impact_score: number;
  confidence: number;
  feasibility_components: Record<string, number>;
  impact_components: Record<string, number>;
}

export interface Plan {
  id: string;
  goal: PlanGoal;
  paths: PlanPath[];
  dependencies: PlanDependency[];
  constraints: PlanConstraint[];
  risks: PlanRisk[];
  evaluation: PlanEvaluation | null;
  created_at: string;
}

export interface PlanTrace {
  id: string;
  plan_id: string;
  steps: { step: number; action: string; output: string }[];
  started_at: string;
  completed_at: string;
}
