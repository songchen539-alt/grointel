// GroIntel Cognitive Kernel — Reasoning Types
export type ReasoningClaimType =
  | "inference" | "causal_chain" | "contradiction" | "opportunity" | "risk";

export type ContradictionSeverity = "low" | "medium" | "high" | "critical";
export type ContradictionAction = "ignore" | "monitor" | "request_more_evidence" | "downgrade_confidence" | "split_entity" | "create_unknown";

export interface ReasoningTrace {
  id: string;
  trigger_node_id: string;
  claim_type: ReasoningClaimType;
  claim: string;
  evidence_node_ids: string[];
  evidence_edge_ids: string[];
  traversed_node_ids: string[];
  intermediate_claims: string[];
  confidence: number;
  assumptions: string[];
  unknowns: string[];
  contradictions: string[];
  reasoning_path: string;
  created_at: string;
}

export interface Inference {
  premise_node_ids: string[];
  conclusion: string;
  confidence: number;
  type: string;
  supporting_edges: string[];
  created_at: string;
}

export interface CausalChain {
  chain: { nodeId: string; label: string; role: string }[];
  confidence: number;
  weak_links: string[];
  missing_evidence: string[];
  created_at: string;
}

export interface ContradictionInsight {
  contradiction_id: string;
  severity: ContradictionSeverity;
  recommendation: ContradictionAction;
  conflicting_claims: string[];
  confidence_before: number;
  confidence_after: number;
  evidence_quality_a: number;
  evidence_quality_b: number;
  created_at: string;
}

export interface OpportunityInsight {
  type: string;
  description: string;
  confidence: number;
  involved_entities: string[];
  evidence_nodes: string[];
  prerequisites: string[];
  risks: string[];
  created_at: string;
}

export interface RiskInsight {
  type: string;
  description: string;
  severity: ContradictionSeverity;
  confidence: number;
  affected_entities: string[];
  signal_nodes: string[];
  mitigations: string[];
  created_at: string;
}

export interface ReasoningResult {
  trace: ReasoningTrace;
  inferences: Inference[];
  causalChains: CausalChain[];
  contradictions: ContradictionInsight[];
  opportunities: OpportunityInsight[];
  risks: RiskInsight[];
}
