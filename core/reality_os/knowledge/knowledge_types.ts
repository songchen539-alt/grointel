// GroIntel ROS-4 — Knowledge Types
export type KnowledgeStatus = "candidate" | "validated" | "stable" | "deprecated" | "contradicted" | "archived";
export type RelationshipType = "causes" | "supports" | "contradicts" | "depends_on" | "belongs_to"
  | "competes_with" | "collaborates_with" | "located_in" | "derived_from" | "predicts" | "requires" | "enables";

export interface KnowledgeEntity {
  id: string;
  type: string;
  canonical_name: string;
  aliases: string[];
  domain: string;
  description: string;
  attributes: Record<string, unknown>;
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeFact {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  confidence: number;
  supporting_evidence: string[];
  supporting_observations: string[];
  supporting_predictions: string[];
  validation_status: KnowledgeStatus;
  version: number;
  source_history: { source: string; timestamp: string; reason: string }[];
}

export interface KnowledgeRelationship {
  id: string;
  source_id: string;
  target_id: string;
  type: RelationshipType;
  confidence: number;
  evidence: string[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface KnowledgeHypothesis {
  id: string;
  statement: string;
  confidence: number;
  supporting_facts: string[];
  contradicting_facts: string[];
  status: KnowledgeStatus;
  created_at: string;
}

export interface KnowledgeInference {
  id: string;
  hypothesis_statement: string;
  derived_from: string[];
  conclusion: string;
  confidence: number;
  reasoning_path: string[];
  created_at: string;
}

export interface KnowledgeVersion {
  id: string;
  fact_id: string;
  version: number;
  snapshot: Partial<KnowledgeFact>;
  diff: string;
  reason: string;
  source: string;
  timestamp: string;
}

export interface KnowledgeValidation {
  id: string;
  fact_id: string;
  reality_score: number;
  prediction_score: number;
  learning_score: number;
  human_approved: boolean;
  composite_score: number;
  validated_at: string;
}

export interface KnowledgeRecord {
  entity: KnowledgeEntity;
  facts: KnowledgeFact[];
  relationships: KnowledgeRelationship[];
  inferences: KnowledgeInference[];
  hypotheses: KnowledgeHypothesis[];
}

export interface KnowledgeTrace {
  id: string;
  action: string;
  entity_id: string | null;
  fact_id: string | null;
  timestamp: string;
  details: string;
}
