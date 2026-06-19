// GroIntel Cognitive Kernel — Opportunity Reasoner
// Detects opportunities from graph patterns
import { GraphEngine } from "../graph/graph_engine";
import { OpportunityInsight } from "./reasoning_types";

let oppCounter = 0;
function genId(): string { return "opp_" + (++oppCounter).toString(16).padStart(6, "0"); }

export class OpportunityReasoner {
  constructor(private graph: GraphEngine) {}

  detectForEntity(entityId: string): OpportunityInsight[] {
    const opportunities: OpportunityInsight[] = [];
    const subgraph = this.graph.getEntitySubgraph(entityId);
    if (!subgraph) return opportunities;

    const signalTypes = subgraph.signals.map(s => s.metadata?.signal_type as string).filter(Boolean);
    const entityNode = this.graph.getNode(entityId);
    const entityLabel = entityNode?.label || entityId;

    // Demand signal + Supply Gap -> Market opportunity
    if (signalTypes.includes("demand_signal") && !signalTypes.includes("supply_signal")) {
      opportunities.push({
        type: "market_opportunity",
        description: `Market demand detected for ${entityLabel} without corresponding supply signal`,
        confidence: 70,
        involved_entities: [entityId],
        evidence_nodes: subgraph.signals.filter(s => s.metadata?.signal_type === "demand_signal").map(s => s.id),
        prerequisites: ["Verify supply capacity", "Assess competitive landscape"],
        risks: ["Supply may exist but not observed", "Demand may be temporary"],
        created_at: new Date().toISOString(),
      });
    }

    // Technology signal + Market signal -> Emerging market opportunity
    if (signalTypes.includes("technology_signal") && signalTypes.includes("market_signal")) {
      opportunities.push({
        type: "emerging_market",
        description: `Technology advancement creating emerging market opportunity for ${entityLabel}`,
        confidence: 65,
        involved_entities: [entityId],
        evidence_nodes: subgraph.signals.filter(s => ["technology_signal", "market_signal"].includes(s.metadata?.signal_type as string)).map(s => s.id),
        prerequisites: ["Monitor technology adoption", "Track competitive response"],
        risks: ["Technology may not achieve adoption", "Market may not materialize"],
        created_at: new Date().toISOString(),
      });
    }

    // Growth signal + Low contradiction -> Sustainable growth opportunity
    if (signalTypes.includes("growth_signal")) {
      const contradictions = this.graph.getNodesByType("Contradiction");
      const relatedContradictions = contradictions.filter(c => {
        const edges = this.graph.getEdges(c.id);
        return edges.some(e => e.to_node_id === entityId || e.from_node_id === entityId);
      });
      if (relatedContradictions.length === 0) {
        opportunities.push({
          type: "sustainable_growth",
          description: `${entityLabel} shows growth signals without contradictions — favorable growth environment`,
          confidence: 75,
          involved_entities: [entityId],
          evidence_nodes: subgraph.signals.filter(s => s.metadata?.signal_type === "growth_signal").map(s => s.id),
          prerequisites: ["Monitor growth sustainability", "Assess unit economics"],
          risks: ["Growth may slow", "Competition may increase"],
          created_at: new Date().toISOString(),
        });
      }
    }

    return opportunities;
  }

  detectFromSignal(signalId: string): OpportunityInsight[] {
    const signalNode = this.graph.getNode(signalId);
    if (!signalNode) return [];
    const neighbors = this.graph.getNeighbors(signalId);
    const entities = neighbors.filter(n => n.type === "Entity");
    return entities.length > 0 ? this.detectForEntity(entities[0].id) : [];
  }
}
