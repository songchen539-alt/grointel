// GroIntel INT-5 — Optimization Types
export type ObjectiveType = "maximize_growth" | "maximize_trust" | "maximize_learning" | "maximize_reality_fidelity"
  | "maximize_civilization_value" | "minimize_risk" | "minimize_uncertainty" | "minimize_cost"
  | "maximize_prediction_accuracy" | "maximize_knowledge_density";

export interface OptimizationObjective {
  id: string;
  type: ObjectiveType;
  weight: number;
  description: string;
  target_value: number;
}

export interface OptimizationOption {
  id: string;
  name: string;
  source: string;
  expected_value: number;
  cost: number;
  risk: number;
  time_days: number;
  required_capabilities: string[];
  confidence: number;
  dependencies: string[];
  constraints: string[];
}

export interface OptimizationConstraint {
  type: string;
  description: string;
  limit: number;
  current: number;
  violated: boolean;
}

export interface OptimizationTradeoff {
  type: string;
  chosen_side: string;
  sacrificed_side: string;
  severity: number;
}

export interface ResourceAllocation {
  attention_budget: number;
  kernel_budget: number;
  data_budget: number;
  human_review_budget: number;
  execution_budget: number;
  time_budget_days: number;
  risk_budget: number;
}

export interface ParetoFrontier {
  options: OptimizationOption[];
  dominated_options: string[];
  non_dominated_options: string[];
}

export interface OptimizationResult {
  id: string;
  target_entity: string;
  target_domain: string;
  objectives: OptimizationObjective[];
  all_options: OptimizationOption[];
  selected_options: OptimizationOption[];
  rejected_options: { option: OptimizationOption; reason: string }[];
  constraints: OptimizationConstraint[];
  tradeoffs: OptimizationTradeoff[];
  resource_allocation: ResourceAllocation;
  pareto_frontier: ParetoFrontier;
  optimization_score: number;
  confidence: number;
  created_at: string;
}

export interface OptimizationTrace {
  id: string;
  result_id: string;
  steps: { step: number; action: string; output: string }[];
  created_at: string;
}
