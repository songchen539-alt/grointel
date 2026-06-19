// GroIntel Cognitive Kernel — Risk Reasoner
// Detects risks from graph patterns
import { GraphEngine } from "../graph/graph_engine";
import { RiskInsight, ContradictionSeverity } from "./reasoning_types";

let riskCounter = 0;
function genId(): string { return "risk_" + (++riskCounter).toString(16).padStart(6, "0"); }

export class RiskReasoner {
  constructor(private graph: GraphEngine) {}

  detectForEntity(entityId: string): RiskInsight[] {
    const risks: RiskInsight[] = [];
    const subgraph = this.graph.getEntitySubgraph(entityId);
    if (!subgraph) return risks;

    const signalTypes = subgraph.signals.map(s => s.metadata?.signal_type as string).filter(Boolean);
    const entityNode = this.graph.getNode(entityId);
    const entityLabel = entityNode?.label || entityId;

    // High contradiction density -> Knowledge risk
    if (subgraph.contradictions.length >= 2) {
      risks.push({
        type: "knowledge_contradiction",
        description: `${entityLabel} has ${subgraph.contradictions.length} unresolved contradictions — knowledge reliability at risk`,
        severity: subgraph.contradictions.length >= 3 ? "high" : "medium",
        confidence: Math.min(90, 50 + subgraph.contradictions.length * 15),
        affected_entities: [entityId],
        signal_nodes: subgraph.contradictions.map(c => c.id),
        mitigations: ["Resolve contradictions", "Collect additional evidence", "Re-evaluate entity model"],
        created_at: new Date().toISOString(),
      });
    }

    // Risk signal without mitigation -> Risk
    if (signalTypes.includes("risk_signal")) {
      const hasTrust = signalTypes.includes("trust_signal");
      risks.push({
        type: "unmitigated_risk",
        description: `${entityLabel} has risk signals ${hasTrust ? "but also trust signals" : "without observed mitigation"}`,
        severity: hasTrust ? "medium" : "high",
        confidence: hasTrust ? 60 : 75,
        affected_entities: [entityId],
        signal_nodes: subgraph.signals.filter(s => s.metadata?.signal_type === "risk_signal").map(s => s.id),
        mitigations: hasTrust ? ["Maintain trust-building activities"] : ["Implement risk mitigation strategies", "Increase monitoring"],
        created_at: new Date().toISOString(),
      });
    }

    // Trust signal decline (if trust signals are weak) -> Trust risk
    const trustSignals = subgraph.signals.filter(s => s.metadata?.signal_type === "trust_signal");
    if (trustSignals.length > 0 && trustSignals.every(s => (s.metadata?.strength as number || 0) < 50)) {
      risks.push({
        type: "trust_deterioration",
        description: `${entityLabel} trust signals are weak — trust capital may be deteriorating`,
        severity: "medium",
        confidence: 65,
        affected_entities: [entityId],
        signal_nodes: trustSignals.map(s => s.id),
        mitigations: ["Increase transparency", "Verify claims independently", "Build evidence base"],
        created_at: new Date().toISOString(),
      });
    }

    // No predictions for tracked entity -> Prediction gap
    if (subgraph.predictions.length === 0) {
      risks.push({
        type: "prediction_gap",
        description: `${entityLabel} has no active predictions — unable to anticipate trajectory`,
        severity: "medium",
        confidence: 55,
        affected_entities: [entityId],
        signal_nodes: [],
        mitigations: ["Generate predictions from existing signals", "Collect more observations"],
        created_at: new Date().toISOString(),
      });
    }

    return risks;
  }

  detectFromSignal(signalId: string): RiskInsight[] {
    const signalNode = this.graph.getNode(signalId);
    if (!signalNode) return [];
    const neighbors = this.graph.getNeighbors(signalId);
    const entities = neighbors.filter(n => n.type === "Entity");
    return entities.length > 0 ? this.detectForEntity(entities[0].id) : [];
  }
}
