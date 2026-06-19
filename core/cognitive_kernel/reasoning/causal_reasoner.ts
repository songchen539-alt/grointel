// GroIntel Cognitive Kernel — Causal Reasoner
// Finds causal chains in the graph
import { GraphEngine } from "../graph/graph_engine";
import { CausalChain } from "./reasoning_types";

export class CausalReasoner {
  constructor(private graph: GraphEngine) {}

  findCausalChains(entityId: string): CausalChain[] {
    const chains: CausalChain[] = [];
    const subgraph = this.graph.getEntitySubgraph(entityId);
    if (!subgraph) return chains;

    const entityNode = this.graph.getNode(entityId);
    if (!entityNode) return chains;

    // Build causal chain: Signal -> Observation -> Entity -> Prediction
    for (const obs of subgraph.observations) {
      for (const sig of subgraph.signals) {
        // Check if signal connected to observation
        const obsEdges = this.graph.getEdges(obs.id);
        const sigEdges = this.graph.getEdges(sig.id);
        const connected = obsEdges.some(e => e.to_node_id === sig.id || e.from_node_id === sig.id);

        if (connected) {
          const chainNodes = [
            { nodeId: sig.id, label: sig.label, role: "cause" },
            { nodeId: obs.id, label: obs.label, role: "event" },
            { nodeId: entityId, label: entityNode.label, role: "affected_entity" },
          ];

          // Add prediction if exists
          for (const pred of subgraph.predictions) {
            chainNodes.push({ nodeId: pred.id, label: pred.label, role: "predicted_outcome" });
          }

          chains.push({
            chain: chainNodes,
            confidence: Math.round(sig.confidence * 0.85),
            weak_links: sig.confidence < 50 ? [sig.id] : [],
            missing_evidence: [],
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    return chains;
  }
}
