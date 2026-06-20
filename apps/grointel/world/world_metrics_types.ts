// GroIntel WORLD-1 — World Metrics Types
export interface RealityCoverageMetric { domain: string; total_targets: number; covered: number; coverage_pct: number; confidence: number; }
export interface KnowledgeQualityMetric { domain: string; evidence_density: number; source_reputation: number; contradiction_rate: number; freshness: number; confidence_calibration: number; validated_hypotheses: number; rejected_hypotheses: number; stale_knowledge_pct: number; }
export interface DecisionAccuracyMetric { domain: string; predicted_vs_observed: number; confidence_calibration: number; recommendation_acceptance: number; recommendation_success: number; decision_improvements: number; }
export interface BusinessOutcomeMetric { domain: string; leads_improved: number; cac_improved: number; revenue_improved: number; retention_improved: number; traffic_improved: number; creator_collabs_improved: number; partner_matches_improved: number; }
export interface WorldUnderstandingScore { reality_coverage: number; knowledge_quality: number; decision_accuracy: number; business_outcomes: number; overall: number; }
export interface WorldGap { id: string; type: string; description: string; severity: "low"|"medium"|"high"|"critical"; current_value: number; target_value: number; priority_score: number; }
export interface WorldBuildingEvent { id: string; type: string; domain: string; details: string; delta: number; timestamp: string; }
export interface WorldProgress { period_start: string; period_end: string; reality_covered_new: number; knowledge_improved: number; decisions_improved: number; outcomes_improved: number; gaps_discovered: number; next_priorities: string[]; }
