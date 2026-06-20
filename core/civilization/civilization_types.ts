// GroIntel CRS-1 — Civilization Types
export type ConsensusMode = "agreement" | "majority" | "weighted_trust" | "evidence_based";
export type ConflictType = "contradictory_knowledge" | "conflicting_predictions" | "policy_conflicts" | "duplicate_discoveries" | "trust_conflicts";

export interface CivilizationIdentity {
  id: string;
  name: string;
  version: number;
  capabilities: string[];
  knowledge_domains: string[];
  trust_score: number;
  health_status: string;
  created_at: string;
}

export interface CivilizationNode {
  identity: CivilizationIdentity;
  current_state: string;
  last_active: string;
  reputation: ReputationScore;
  shared_truths: string[];
}

export interface KnowledgeExchange {
  id: string;
  from_node: string;
  to_node: string | null;
  exchange_type: "observation" | "prediction" | "judgement" | "strategy" | "learning" | "evidence";
  content: string;
  evidence: string[];
  confidence: number;
  timestamp: string;
}

export interface ConsensusProposal {
  id: string;
  topic: string;
  mode: ConsensusMode;
  votes: { node_id: string; support: boolean; weight: number; reason: string }[];
  result: boolean | null;
  confidence: number;
  reasoning: string;
  created_at: string;
  concluded_at: string | null;
}

export interface ConflictRecord {
  id: string;
  type: ConflictType;
  node_a_id: string;
  node_b_id: string;
  description: string;
  evidence: string[];
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  resolution: string | null;
  created_at: string;
}

export interface ReputationScore {
  prediction_accuracy: number;
  truth_preservation: number;
  knowledge_quality: number;
  contribution: number;
  trustworthiness: number;
  learning_rate: number;
  composite: number;
}

export interface CivilizationMemory {
  shared_truths: { statement: string; confidence: number; source: string; timestamp: string }[];
  shared_lessons: { lesson: string; context: string; source: string; timestamp: string }[];
  shared_failures: { failure: string; cause: string; source: string; timestamp: string }[];
  shared_strategies: { strategy: string; effectiveness: number; source: string; timestamp: string }[];
  shared_evidence: { claim: string; evidence: string; source: string; confidence: number; timestamp: string }[];
}

export interface CollectiveDecision {
  id: string;
  topic: string;
  consensus_proposal_id: string;
  decision: string;
  supporting_nodes: string[];
  opposing_nodes: string[];
  confidence: number;
  created_at: string;
}

export interface CivilizationTrace {
  id: string;
  action: string;
  node_id: string | null;
  details: string;
  timestamp: string;
}
