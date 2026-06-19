// GroIntel Cognitive Kernel — Graph Types
export type GraphNodeType =
  | "Entity" | "Observation" | "Signal" | "MemoryRecord" | "Prediction"
  | "Contradiction" | "Decision" | "Capability" | "Need" | "Opportunity"
  | "Risk" | "Knowledge" | "Source" | "Event";

export type GraphEdgeType =
  | "observed_from" | "mentions" | "describes" | "supports" | "contradicts"
  | "predicts" | "causes" | "depends_on" | "creates" | "needs" | "uses"
  | "trusts" | "competes_with" | "collaborates_with" | "evolves_to"
  | "derived_from" | "validated_by" | "weakens" | "strengthens" | "similar_to";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  external_id: string | null;       // links to memory_record_id or observation_id
  memory_record_id: string | null;  // bidirectional link to memory
  confidence: number;
  reality_fidelity: number;
  metadata: Record<string, unknown>;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface GraphEdge {
  id: string;
  type: GraphEdgeType;
  from_node_id: string;
  to_node_id: string;
  confidence: number;
  evidence: string[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface EntitySubgraph {
  entityNode: GraphNode;
  observations: GraphNode[];
  signals: GraphNode[];
  memories: GraphNode[];
  predictions: GraphNode[];
  contradictions: GraphNode[];
  relationships: GraphEdge[];
  neighbors: GraphNode[];
}

export interface EvidenceChain {
  startNode: GraphNode;
  chain: GraphEdge[];
  nodes: GraphNode[];
  confidence: number;
}

export interface GraphMetrics {
  node_count: number;
  edge_count: number;
  entity_degree: number;
  signal_density: number;
  contradiction_density: number;
  prediction_density: number;
  knowledge_density: number;
  trust_density: number;
  reality_fidelity_average: number;
  isolated_nodes: number;
  most_connected_entities: { nodeId: string; label: string; degree: number }[];
}
