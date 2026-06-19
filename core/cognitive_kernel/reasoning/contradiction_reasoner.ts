// GroIntel Cognitive Kernel — Contradiction Reasoner
// Classifies contradictions and recommends actions
import { GraphEngine } from "../graph/graph_engine";
import { ContradictionInsight, ContradictionSeverity, ContradictionAction } from "./reasoning_types";

export class ContradictionReasoner {
  constructor(private graph: GraphEngine) {}

  classifyContradictions(entityId: string): ContradictionInsight[] {
    const insights: ContradictionInsight[] = [];
    const contradictions = this.graph.getNodesByType("Contradiction");

    for (const con of contradictions) {
      const edges = this.graph.getEdges(con.id);
      const relatedToEntity = edges.some(e => e.to_node_id === entityId || e.from_node_id === entityId);
      if (!relatedToEntity) continue;

      const severity = this.classifySeverity(con.confidence);
      const recommendation = this.recommendAction(severity, con.confidence);

      insights.push({
        contradiction_id: con.id,
        severity,
        recommendation,
        conflicting_claims: [con.label],
        confidence_before: con.confidence,
        confidence_after: Math.round(con.confidence * (severity === "critical" ? 0.5 : severity === "high" ? 0.7 : severity === "medium" ? 0.85 : 0.95)),
        evidence_quality_a: Math.min(100, con.confidence + 10),
        evidence_quality_b: Math.min(100, con.confidence - 10),
        created_at: new Date().toISOString(),
      });
    }

    return insights;
  }

  private classifySeverity(confidence: number): ContradictionSeverity {
    if (confidence >= 80) return "critical";
    if (confidence >= 60) return "high";
    if (confidence >= 40) return "medium";
    return "low";
  }

  private recommendAction(severity: ContradictionSeverity, confidence: number): ContradictionAction {
    if (severity === "critical") return "split_entity";
    if (severity === "high") return "downgrade_confidence";
    if (severity === "medium") return "request_more_evidence";
    return "monitor";
  }
}
