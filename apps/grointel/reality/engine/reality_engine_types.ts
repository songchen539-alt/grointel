// GroIntel AWAKENING-2 — Reality Engine Types
export type TargetType = "company" | "creator" | "supply" | "community" | "product";
export type ChangeType = "homepage" | "pricing" | "product" | "hiring" | "documentation" | "blog" | "legal" | "structured_data" | "navigation" | "metadata";

export interface RealityTarget {
  id: string; name: string; website: string; type: TargetType;
  industry: string; country: string; priority: number; attention_score: number;
  last_observed_at: string | null; next_observation_at: string | null;
  crawl_frequency_seconds: number; connector_status: "active" | "degraded" | "error";
  failure_count: number; knowledge_confidence: number; world_importance: number;
  snapshot_count: number; created_at: string; updated_at: string;
}

export interface RealitySnapshot {
  id: string; target_id: string; raw_html: string; http_status: number;
  headers: Record<string, string>; content_hash: string; extracted_metadata: Record<string, unknown>;
  extracted_features: string[]; fetched_at: string; fetch_time_ms: number;
}

export interface RealityDiff {
  id: string; target_id: string; snapshot_before_id: string; snapshot_after_id: string;
  changes: RealityChange[]; change_count: number; significance: "none"|"low"|"medium"|"high"|"critical";
  computed_at: string;
}

export interface RealityChange {
  type: ChangeType; field: string; before: string; after: string; confidence: number;
  evidence: string; severity: "info"|"minor"|"major"|"critical";
}

export interface RealitySignal {
  id: string; target_id: string; diff_id: string; type: string; label: string;
  confidence: number; severity: "info"|"minor"|"major"|"critical"; evidence: string; timestamp: string;
}

export interface RealityMemoryEntry {
  target_id: string; snapshots: RealitySnapshot[]; diffs: RealityDiff[];
  signals: RealitySignal[]; last_updated: string;
}

export interface WorldCoverage {
  companies_observed: number; countries_observed: number; industries_covered: number;
  pages_crawled: number; snapshots_stored: number; diffs_detected: number;
  signals_extracted: number; evidence_generated: number; knowledge_revisions: number;
  decision_updates: number; reality_coverage_pct: number; average_knowledge_age_hours: number;
}
