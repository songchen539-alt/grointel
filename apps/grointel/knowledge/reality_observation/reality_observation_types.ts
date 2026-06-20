// GroIntel KNOWLEDGE-2 — Reality Observation Types
export type ObservationSignalType = "hiring_increased" | "hiring_decreased" | "pricing_changed" | "new_product" | "funding_raised" | "traffic_changed" | "region_expanded" | "partnership_formed" | "creator_activity" | "job_listings" | "social_growth" | "review_change" | "technology_adoption" | "content_velocity";

export interface ObservationSource {
  id: string; name: string; type: string; enabled: boolean;
  trust_score: number; last_used: string | null; config: Record<string, unknown>;
}

export interface Observation {
  id: string; company_memory_id: string; source: string; timestamp: string;
  signals: ObservationSignal[]; evidence: ObservationEvidence[];
  confidence: number; status: "collected" | "normalized" | "processed";
}

export interface ObservationBatch {
  batch_id: string; company_memory_id: string; observations: Observation[];
  collected_at: string; source_count: number; signal_count: number;
}

export interface ObservationSignal {
  type: ObservationSignalType; label: string; value: string | number;
  strength: number; confidence: number; evidence: string[]; source: string;
}

export interface ObservationEvidence {
  id: string; source: string; raw_data: Record<string, unknown>;
  normalized_data: Record<string, unknown>; confidence: number; collected_at: string;
}

export interface ObservationDiff {
  new_signals: ObservationSignal[]; changed_signals: { before: ObservationSignal; after: ObservationSignal; importance: "low"|"medium"|"high" }[];
  removed_signals: string[]; signal_count_before: number; signal_count_after: number;
  has_significant_change: boolean; computed_at: string;
}

export interface ObservationResult {
  batch: ObservationBatch; diff: ObservationDiff | null;
  memory_updated: boolean; decision_updated: boolean; workspace_state: Record<string, unknown>;
}

export interface ObservationJob {
  id: string; company_memory_id: string; status: "pending" | "running" | "completed" | "failed";
  sources_used: string[]; signals_found: number; started_at: string; completed_at: string | null;
}

export interface ObservationSession {
  session_id: string; company_website: string; company_memory_id: string;
  observation_count: number; last_observed_at: string; created_at: string;
}
