// GroIntel Cognitive Kernel — Inference Engine
// Infers new knowledge from graph patterns
import { GraphEngine } from "../graph/graph_engine";
import { Inference } from "./reasoning_types";

let infCounter = 0;
function genId(): string { return "inf_" + (++infCounter).toString(16).padStart(6, "0"); }

export class InferenceEngine {
  constructor(private graph: GraphEngine) {}

  inferFromEntity(entityId: string): Inference[] {
    const inferences: Inference[] = [];
    const subgraph = this.graph.getEntitySubgraph(entityId);
    if (!subgraph) return inferences;

    const signalTypes = subgraph.signals.map(s => s.metadata?.signal_type as string).filter(Boolean);
    const hasFunding = signalTypes.includes("funding_signal");
    const hasHiring = signalTypes.includes("hiring_signal");
    const hasDemand = signalTypes.includes("demand_signal");
    const hasProduct = signalTypes.includes("product_signal");
    const hasGrowth = signalTypes.includes("growth_signal");
    const hasRisk = signalTypes.includes("risk_signal");
    const hasMarket = signalTypes.includes("market_signal");
    const hasTechnology = signalTypes.includes("technology_signal");
    const hasTrust = signalTypes.includes("trust_signal");

    // Funding + Hiring -> Capability Expansion
    if (hasFunding && hasHiring) {
      inferences.push({
        premise_node_ids: subgraph.signals.filter(s => ["funding_signal", "hiring_signal"].includes(s.metadata?.signal_type as string)).map(s => s.id),
        conclusion: "Entity is expanding capabilities through new funding and hiring",
        confidence: 80,
        type: "capability_expansion",
        supporting_edges: [],
        created_at: new Date().toISOString(),
      });
    }

    // Demand + Product -> Market Adoption
    if (hasDemand && hasProduct) {
      inferences.push({
        premise_node_ids: subgraph.signals.filter(s => ["demand_signal", "product_signal"].includes(s.metadata?.signal_type as string)).map(s => s.id),
        conclusion: "Market demand may be met by new product launch",
        confidence: 72,
        type: "market_adoption",
        supporting_edges: [],
        created_at: new Date().toISOString(),
      });
    }

    // Growth + Trust -> Sustainable Growth
    if (hasGrowth && hasTrust) {
      inferences.push({
        premise_node_ids: subgraph.signals.filter(s => ["growth_signal", "trust_signal"].includes(s.metadata?.signal_type as string)).map(s => s.id),
        conclusion: "Entity shows sustainable growth with increasing trust",
        confidence: 75,
        type: "sustainable_growth",
        supporting_edges: [],
        created_at: new Date().toISOString(),
      });
    }

    // Technology + Market -> Market Shift
    if (hasTechnology && hasMarket) {
      inferences.push({
        premise_node_ids: subgraph.signals.filter(s => ["technology_signal", "market_signal"].includes(s.metadata?.signal_type as string)).map(s => s.id),
        conclusion: "Technology advancement may drive emerging market shift",
        confidence: 68,
        type: "emerging_market_shift",
        supporting_edges: [],
        created_at: new Date().toISOString(),
      });
    }

    // Growth + Hiring -> Scaling
    if (hasGrowth && hasHiring) {
      inferences.push({
        premise_node_ids: subgraph.signals.filter(s => ["growth_signal", "hiring_signal"].includes(s.metadata?.signal_type as string)).map(s => s.id),
        conclusion: "Entity is scaling operations through growth and team expansion",
        confidence: 78,
        type: "scaling",
        supporting_edges: [],
        created_at: new Date().toISOString(),
      });
    }

    // Risk + Funding -> Capital Efficiency Risk
    if (hasRisk && hasFunding) {
      inferences.push({
        premise_node_ids: subgraph.signals.filter(s => ["risk_signal", "funding_signal"].includes(s.metadata?.signal_type as string)).map(s => s.id),
        conclusion: "Risk signals may affect capital efficiency despite new funding",
        confidence: 65,
        type: "capital_efficiency_risk",
        supporting_edges: [],
        created_at: new Date().toISOString(),
      });
    }

    return inferences;
  }

  inferFromSignal(signalId: string): Inference[] {
    const inferences: Inference[] = [];
    const signalNode = this.graph.getNode(signalId);
    if (!signalNode) return inferences;

    const signalType = signalNode.metadata?.signal_type as string;
    const neighbors = this.graph.getNeighbors(signalId);

    // Check if signal has entity neighbors
    const entities = neighbors.filter(n => n.type === "Entity");
    if (entities.length > 0 && signalType) {
      inferences.push({
        premise_node_ids: [signalId, ...entities.map(e => e.id)],
        conclusion: `Signal "${signalType}" affects entity "${entities[0].label}"`,
        confidence: signalNode.confidence,
        type: "signal_affects_entity",
        supporting_edges: [],
        created_at: new Date().toISOString(),
      });
    }

    return inferences;
  }
}
