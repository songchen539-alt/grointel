// GroIntel DATA-4 — Pattern Types
export type PatternStatus = "candidate" | "validated" | "stable" | "deprecated" | "superceded";

export interface GrowthPattern {
  id: string; name: string; description: string; cluster: string; status: PatternStatus;
  conditions: PatternCondition; expected_outcome: PatternOutcome;
  confidence: number; evidence_count: number; sample_size: number; version: number;
  supporting_activity_ids: string[]; supporting_company_ids: string[];
  supporting_capabilities: string[]; limitations: string[]; recommended_contexts: string[];
  created_at: string; updated_at: string;
  history: { timestamp: string; change: string; confidence: number }[];
}

export interface PatternCluster {
  id: string; name: string; description: string; pattern_ids: string[];
  industry_fit: string[]; region_fit: string[]; created_at: string;
}

export interface PatternEvidence {
  id: string; pattern_id: string; evidence_type: string; content: string;
  source_activity_id: string; confidence: number; timestamp: string;
}

export interface PatternCondition {
  industry: string; region: string; company_size: string; maturity: string;
  capabilities_required: string[]; budget_range: string; duration_range: string;
}

export interface PatternOutcome {
  expected_traffic_growth: number; expected_lead_growth: number;
  expected_revenue_impact: number; expected_roi: number;
  time_to_result_days: number; confidence: number;
}

export interface PatternConfidence {
  sample_size: number; validation_rate: number; prediction_accuracy: number;
  time_decay: number; cross_region_reuse: number; cross_industry_reuse: number;
  composite: number;
}

export interface PatternSimilarity {
  pattern_id: string; similarity_score: number; confidence_fit: number;
  industry_fit: number; region_fit: number; capability_fit: number;
}

export interface PatternValidation {
  id: string; pattern_id: string; validated_by_activity_count: number;
  evidence_score: number; prediction_accuracy: number; contradiction_count: number;
  passed: boolean; validated_at: string;
}

export interface PatternTrace {
  id: string; action: string; pattern_id: string; details: string; timestamp: string;
}
