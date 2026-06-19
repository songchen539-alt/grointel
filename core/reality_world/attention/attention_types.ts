// GroIntel RWS-2 — Attention Types
export type AttentionDecisionValue = "ignore" | "monitor" | "process" | "escalate" | "deep_analyze";
export type KernelBudget = 0 | 1 | 3 | 6 | 10;

export interface AttentionTarget {
  id: string;
  event_id: string;
  domain: string;
  entity_ids: string[];
  reason: string;
  attention_score: number;
  goal_alignment: number;
  novelty: number;
  urgency: number;
  impact: number;
  uncertainty: number;
  risk: number;
  opportunity: number;
  freshness: number;
  created_at: string;
}

export interface AttentionDecision {
  event_id: string;
  decision: AttentionDecisionValue;
  score: number;
  reasons: string[];
  linked_goals: string[];
  allocated_budget: KernelBudget;
  timestamp: string;
}

export interface AttentionTrace {
  id: string;
  event_id: string;
  score_components: {
    goal_alignment: number;
    novelty: number;
    urgency: number;
    impact: number;
    uncertainty: number;
    risk: number;
    opportunity: number;
  };
  linked_goals: string[];
  decision: AttentionDecisionValue;
  reason: string;
  final_budget: KernelBudget;
  timestamp: string;
}

export const ATTENTION_THRESHOLDS = {
  ignore: { min: 0, max: 30 },
  monitor: { min: 31, max: 50 },
  process: { min: 51, max: 70 },
  escalate: { min: 71, max: 85 },
  deep_analyze: { min: 86, max: 100 },
};

export const BUDGET_MAP: Record<AttentionDecisionValue, KernelBudget> = {
  ignore: 0,
  monitor: 1,
  process: 3,
  escalate: 6,
  deep_analyze: 10,
};
