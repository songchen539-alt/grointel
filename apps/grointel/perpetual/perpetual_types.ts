// GroIntel PGIR-1 — Perpetual Types
export type EntityType = "company" | "founder" | "creator" | "agency" | "software" | "ai_system" | "market" | "product" | "community" | "capability";
export type RelationshipType = "works_with" | "competes_with" | "invested_in" | "recommended_by" | "supports" | "depends_on" | "growing_with" | "trusted_by";

export interface LivingEntity {
  id: string; type: EntityType; canonical_name: string; aliases: string[];
  attributes: Record<string, unknown>; confidence: number; version: number;
  source_count: number; evidence_count: number; activity_score: number;
  created_at: string; updated_at: string; last_verified: string;
  history: { timestamp: string; change: string; confidence: number }[];
}

export interface LivingRelationship {
  id: string; source_id: string; target_id: string; type: RelationshipType;
  confidence: number; version: number; evidence: string[];
  created_at: string; updated_at: string; last_verified: string;
  history: { timestamp: string; change: string; confidence: number }[];
}

export interface LivingPrediction {
  id: string; entity_id: string; statement: string; probability: number;
  confidence: number; assumptions: string[]; status: "active" | "invalidated" | "replaced";
  created_at: string; updated_at: string; last_verified: string;
  history: { timestamp: string; confidence: number; probability: number }[];
}

export interface LivingRecommendation {
  id: string; target_entity: string; recommendation: string; rank: number;
  evidence: string[]; confidence: number; version: number;
  created_at: string; updated_at: string; last_verified: string;
  history: { timestamp: string; rank: number; confidence: number }[];
}

export interface PerpetualEvent {
  id: string; type: string; entity_id: string | null; data: Record<string, unknown>;
  observed_at: string; confidence: number;
}

export interface WorldState {
  entities: number; relationships: number; predictions: number;
  recommendations: number; events_processed: number; event_counter: number;
  last_event_at: string | null; started_at: string; cycle_count: number;
}

export interface PerpetualTrace {
  id: string; action: string; entity_id: string | null; details: string; timestamp: string;
}
