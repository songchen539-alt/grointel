// GroIntel PRODUCT-1 — Growth Decision Types
export interface GrowthDecisionRequest {
  company_website: string; growth_goal: string; target_market: string;
  budget_range: string; timeline: string; constraints: string[];
}

export interface CompanyInput {
  company_domain: string; industry: string; region: string; stage: string;
  current_signals: string[]; known_unknowns: string[]; confidence: number;
}

export interface GrowthGoal {
  original: string; category: string; description: string; kpis: string[];
  typical_timeline_days: number; confidence: number;
}

export interface GrowthConstraint { name: string; value: string; impact: "low"|"medium"|"high"; }

export interface GrowthDiagnosis {
  current_state: string; bottleneck: string; missing_capability: string;
  market_opportunity: string; trust_gap: string; evidence_gap: string;
  risk_level: "low"|"medium"|"high"; confidence: number;
}

export interface GrowthRecommendation {
  pattern_name: string; pattern_cluster: string; fit_score: number;
  evidence_count: number; expected_impact: string; confidence: number;
}

export interface GrowthRisk { risk: string; severity: "low"|"medium"|"high"; mitigation: string; }

export interface NextAction { action: string; priority: number; timeframe: string; owner: string; }

export interface GrowthDecisionReport {
  id: string; request: GrowthDecisionRequest; company: CompanyInput;
  goal: GrowthGoal; diagnosis: GrowthDiagnosis;
  recommended_patterns: GrowthRecommendation[]; causal_explanation: string;
  supply_categories: { category: string; reason: string; confidence: number }[];
  risks: GrowthRisk[]; unknowns: string[]; next_actions: NextAction[];
  summary: string; confidence: number; created_at: string;
}

export interface DecisionTrace { id: string; action: string; report_id: string; details: string; timestamp: string; }
