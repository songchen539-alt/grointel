// GroIntel INT-3 — Strategy Types
export type StrategyType =
  | "focus_strategy" | "expansion_strategy" | "differentiation_strategy" | "partnership_strategy"
  | "trust_building_strategy" | "capability_building_strategy" | "risk_reduction_strategy"
  | "discovery_strategy" | "market_entry_strategy" | "ecosystem_strategy";

export type TimingAssessment = "too_early" | "early" | "right_time" | "late" | "too_late";

export type TradeoffType =
  | "speed_vs_quality" | "growth_vs_trust" | "short_term_vs_long_term" | "risk_vs_upside"
  | "focus_vs_diversification" | "automation_vs_human_judgment" | "scale_vs_reality_fidelity";

export interface StrategicContext {
  entity: string;
  domain: string;
  current_position: string;
  active_goals: string[];
  risk_signals: string[];
  opportunity_signals: string[];
  simulations: string[];
  plans: string[];
  learning_history: string[];
  time_horizon_days: number;
}

export interface StrategicOption {
  id: string;
  type: StrategyType;
  hypothesis: string;
  target_outcome: string;
  required_capabilities: string[];
  required_resources: string;
  expected_upside: number;
  key_risks: string[];
  time_horizon_days: number;
  confidence: number;
  fit_score: number;
}

export interface StrategicTradeoff {
  type: TradeoffType;
  description: string;
  chosen_side: string;
  sacrificed_side: string;
  severity: number;
}

export interface StrategicMoat {
  type: string;
  description: string;
  strength: number;
  durability_years: number;
}

export interface StrategicTiming {
  assessment: TimingAssessment;
  reasoning: string;
  confidence: number;
  window_months: number;
}

export interface StrategyEvaluation {
  fit_score: number;
  upside_score: number;
  risk_score: number;
  confidence: number;
  fit_components: Record<string, number>;
}

export interface Strategy {
  id: string;
  target_entity: string;
  target_domain: string;
  strategic_goal: string;
  context: StrategicContext;
  options: StrategicOption[];
  selected_option: StrategicOption | null;
  rejected_options: StrategicOption[];
  tradeoffs: StrategicTradeoff[];
  moats: StrategicMoat[];
  timing: StrategicTiming;
  evaluation: StrategyEvaluation;
  confidence: number;
  created_at: string;
}

export interface StrategyTrace {
  id: string;
  strategy_id: string;
  steps: { step: number; action: string; output: string }[];
  started_at: string;
  completed_at: string;
}
