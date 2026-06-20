// GroIntel ROS-5 — Wisdom Types
export type JudgementVerdict = "pass" | "caution" | "warn" | "fail" | "defer";
export type TimeHorizon = "short_term" | "mid_term" | "long_term" | "civilization";

export interface Principle {
  id: string;
  statement: string;
  description: string;
  weight: number;
  immutable: boolean;
  category: string;
}

export interface CoreValue {
  id: string;
  name: string;
  weight: number;
  priority: number;
  stability: number;
  conflicts: string[];
  origin: string;
}

export interface Judgement {
  id: string;
  target_id: string;
  target_description: string;
  principle_scores: { principle_id: string; score: number; reason: string }[];
  value_scores: { value_id: string; score: number; reason: string }[];
  composite_score: number;
  verdict: JudgementVerdict;
  recommendation: string;
  created_at: string;
}

export interface WisdomEvaluation {
  id: string;
  decision_id: string;
  decision_description: string;
  judgement: Judgement;
  long_term_impact: LongTermImpact;
  civilization_impact: CivilizationImpact;
  ethical_assessment: EthicalConstraint[];
  overall_recommendation: string;
  confidence: number;
  created_at: string;
}

export interface LongTermImpact {
  knowledge_quality_1y: number;
  trust_1y: number;
  compound_learning_3y: number;
  strategic_optionality_3y: number;
  resilience_10y: number;
  composite: number;
}

export interface CivilizationImpact {
  knowledge_growth: number;
  truth_preservation: number;
  trust: number;
  collective_intelligence: number;
  human_benefit: number;
  long_term_resilience: number;
  composite: number;
}

export interface EthicalConstraint {
  id: string;
  type: string;
  description: string;
  severity: "none" | "low" | "medium" | "high" | "critical";
  triggered: boolean;
  details: string;
}

export interface WisdomRecommendation {
  evaluation_id: string;
  verdict: JudgementVerdict;
  summary: string;
  supporting_principles: string[];
  violating_principles: string[];
  ethical_concerns: string[];
  long_term_outlook: string;
  confidence: number;
}

export interface WisdomTrace {
  id: string;
  decision_id: string;
  principles_checked: string[];
  values_checked: string[];
  verdict: JudgementVerdict;
  composite_score: number;
  duration_ms: number;
  created_at: string;
}
