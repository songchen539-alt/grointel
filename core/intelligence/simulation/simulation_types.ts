// GroIntel INT-1 — Simulation Types
export type ScenarioType = "growth_scenario" | "risk_scenario" | "market_scenario" | "capability_scenario" | "trust_scenario" | "civilization_scenario";
export type ProjectionCase = "best_case" | "base_case" | "worst_case" | "unexpected_case";
export type ImpactDomain = "growth_impact" | "trust_impact" | "risk_impact" | "knowledge_impact" | "capability_impact" | "market_impact" | "civilization_impact";

export interface SimulationInput {
  target_entity: string;
  target_domain: string;
  current_state: Record<string, unknown>;
  signals: string[];
  goals: string[];
  risks: string[];
  opportunities: string[];
  predictions: string[];
  learning_history: string[];
  time_horizon_days: number;
}

export interface SimulationVariable {
  name: string;
  current_value: number;
  possible_values: number[];
  confidence: number;
  volatility: number;
}

export interface SimulationAssumption {
  statement: string;
  confidence: number;
  impact_on_outcome: number;
  evidence: string[];
}

export interface Scenario {
  id: string;
  type: ScenarioType;
  description: string;
  input: SimulationInput;
  variables: SimulationVariable[];
  assumptions: SimulationAssumption[];
  time_horizon_days: number;
  created_at: string;
}

export interface ProjectedOutcome {
  id: string;
  scenario_id: string;
  case: ProjectionCase;
  description: string;
  probability: number;
  confidence: number;
  required_conditions: string[];
  risks: string[];
  opportunities: string[];
  expected_impact: number;
}

export interface ProbabilityBranch {
  id: string;
  parent_id: string | null;
  condition: string;
  probability: number;
  confidence: number;
  outcome: ProjectedOutcome | null;
  children: ProbabilityBranch[];
  depth: number;
  evidence: string[];
}

export interface ImpactEstimate {
  domain: ImpactDomain;
  score: number;
  confidence: number;
  reasoning: string;
}

export interface UncertaintyModel {
  overall_uncertainty: number;
  unknown_variables: number;
  missing_evidence: number;
  contradictions: number;
  low_confidence_sources: number;
  volatile_signals: number;
  time_horizon_decay: number;
}

export interface SimulationResult {
  id: string;
  scenario: Scenario;
  projected_outcomes: ProjectedOutcome[];
  probability_tree: ProbabilityBranch;
  impact_estimates: ImpactEstimate[];
  uncertainty: UncertaintyModel;
  confidence: number;
  evidence_nodes: string[];
  created_at: string;
}

export interface SimulationTrace {
  id: string;
  result_id: string;
  steps: { step: number; action: string; output: string }[];
  started_at: string;
  completed_at: string;
}
