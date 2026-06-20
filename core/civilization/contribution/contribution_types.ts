// GroIntel CRS-2 — Contribution Types
export type ArtifactType = "observation" | "prediction" | "judgement" | "strategy" | "discovery" | "learning" | "evidence";

export interface Contributor {
  id: string; name: string; role: "creator" | "contributor" | "validator" | "reviewer" | "approver"; contributed_at: string;
}

export interface KnowledgeArtifact {
  id: string; type: ArtifactType; title: string; content: string; version: number;
  contributors: Contributor[]; validators: string[]; reviewers: string[]; approvers: string[];
  created_at: string; updated_at: string;
}

export interface Contribution {
  id: string; artifact_id: string; contributor_id: string; contributor_name: string;
  type: ArtifactType; change_description: string; timestamp: string; immutable: boolean;
}

export interface Attribution {
  id: string; artifact_id: string; attribute_to: string; attributed_by: string;
  attribution_type: string; evidence: string[]; timestamp: string; immutable: boolean;
}

export interface Citation {
  id: string; citing_artifact_id: string; cited_artifact_id: string;
  context: string; depth: number; timestamp: string;
}

export interface InfluenceScore {
  reuse_frequency: number; validation_rate: number; prediction_accuracy: number;
  downstream_impact: number; cross_domain_adoption: number; long_term_usefulness: number;
  composite: number;
}

export interface ContributionScore {
  originality: number; accuracy: number; reuse: number; validation: number;
  impact: number; trust: number; learning_value: number; composite: number;
}

export interface KnowledgeLineage {
  artifact_id: string; origin_id: string | null; parent_id: string | null;
  derived_artifact_ids: string[]; merged_artifact_ids: string[];
  superseded_versions: string[]; current_canonical_id: string;
  version_history: { version: number; timestamp: string; change: string; contributor: string }[];
}

export interface ContributionTrace {
  id: string; action: string; artifact_id: string | null; contributor_id: string | null; details: string; timestamp: string;
}
