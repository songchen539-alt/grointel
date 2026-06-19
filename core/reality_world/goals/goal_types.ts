// GroIntel RWS-2 — Goal Types
export type GoalType =
  | "civilization_goal" | "business_goal" | "market_goal" | "intelligence_goal"
  | "learning_goal" | "discovery_goal" | "risk_monitoring_goal" | "opportunity_detection_goal";

export type GoalStatus = "active" | "paused" | "completed" | "archived";

export interface Goal {
  id: string;
  name: string;
  description: string;
  type: GoalType;
  layer: number;
  domain: string;
  priority: number;
  status: GoalStatus;
  target_entities: string[];
  target_domains: string[];
  success_metrics: string[];
  constraints: string[];
  progress: number;
  importance: number;
  urgency: number;
  civilization_value: number;
  uncertainty_reduction: number;
  learning_value: number;
  created_at: string;
  updated_at: string;
  confidence: number;
}

export interface GoalPriorityInput {
  importance: number;
  urgency: number;
  civilization_value: number;
  uncertainty_reduction: number;
  learning_value: number;
}

export interface GoalProgress {
  goal_id: string;
  current_progress: number;
  trend: number;
  confidence: number;
  blocked_by: string[];
  next_action: string;
}
