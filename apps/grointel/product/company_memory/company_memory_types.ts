// GroIntel PRODUCT-2 — Company Memory Types
export interface CompanyMemory {
  id: string; company_website: string; company_name: string; created_at: string; updated_at: string;
  current_profile: CompanyProfile; current_snapshot: CompanyRealitySnapshot;
  decisions: DecisionMemory[]; timeline: MemoryUpdateEvent[]; decision_count: number; update_count: number;
}

export interface CompanyProfile {
  name: string; website: string; industry: string; region: string; stage: string; confidence: number;
}

export interface CompanyRealitySnapshot {
  snapshot_id: string; growth_goal: string; target_market: string; budget_range: string; timeline: string;
  constraints: string[]; signals: string[]; known_unknowns: string[]; captured_at: string;
}

export interface DecisionMemory {
  decision_id: string; report_id: string; snapshot_id: string; summary: string;
  recommended_patterns: string[]; supply_categories: string[]; risks: string[];
  confidence_at_creation: number; current_confidence: number; status: "active" | "weakened" | "strengthened" | "obsolete";
  created_at: string; last_updated: string; confidence_history: { timestamp: string; confidence: number; reason: string }[];
}

export interface RealityChange {
  field: string; before: string; after: string; impact: "none" | "low" | "medium" | "high";
}

export interface RealityDiff {
  diff_id: string; snapshot_a: string; snapshot_b: string; changes: RealityChange[];
  signal_gained: string[]; signal_lost: string[]; goal_changed: boolean; market_changed: boolean;
  budget_changed: boolean; timeline_changed: boolean; overall_impact: "none" | "low" | "medium" | "high";
  computed_at: string;
}

export interface DecisionConfidenceUpdate {
  decision_id: string; previous_confidence: number; new_confidence: number;
  delta: number; direction: "increased" | "decreased" | "unchanged" | "obsolete";
  reason: string; updated_at: string;
}

export interface MemoryUpdateEvent {
  event_id: string; type: "created" | "snapshot_added" | "decision_added" | "confidence_updated" | "profile_updated" | "reality_diffed";
  details: string; snapshot_id: string | null; timestamp: string;
}

export interface CompanyMemoryTimeline {
  memory_id: string; events: MemoryUpdateEvent[]; snapshot_count: number; decision_count: number;
  first_event: string; last_event: string;
}

export interface CompanyMemoryQuery {
  id?: string; website?: string; limit?: number; offset?: number;
}

export interface LivingWorkspaceState {
  memory: CompanyMemory; latest_snapshot: CompanyRealitySnapshot; latest_decision: DecisionMemory | null;
  diff: RealityDiff | null; confidence_update: DecisionConfidenceUpdate | null; timeline: CompanyMemoryTimeline;
}
