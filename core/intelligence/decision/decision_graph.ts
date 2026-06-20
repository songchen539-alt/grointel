// GroIntel INT-6 — Decision Graph Integration
// Stores decision as graph nodes linked to optimization, strategy, plan, simulation, discovery, risk, etc.
import { Decision, DecisionOption, DecisionContext, DecisionEvaluation } from "./decision_types";
import type { GraphNode, GraphEdge } from "../../cognitive_kernel/graph/graph_types";

export interface DecisionGraphNodes {
  decisionNode: GraphNode;
  optionNodes: GraphNode[];
  evaluationNodes: GraphNode[];
  contextNode: GraphNode;
  rejectionNodes: GraphNode[];
  approvalNode: GraphNode | null;
}

export interface DecisionGraphEdges {
  decisionToOptions: GraphEdge[];
  decisionToRejected: GraphEdge[];
  decisionToEvaluation: GraphEdge[];
  decisionToContext: GraphEdge[];
  optionToOptimization: GraphEdge[];
  decisionToApproval: GraphEdge[];
  decisionToEvidence: GraphEdge[];
}

export interface DecisionGraphIntegration {
  nodes: DecisionGraphNodes;
  edges: DecisionGraphEdges;
}

let ngCounter = 0;
function gn(label: string, type_: string, extId: string | null, meta: Record<string, unknown>): GraphNode {
  return {
    id: "g_" + (++ngCounter).toString(16).padStart(6, "0"),
    type: type_ as any, label, external_id: extId, memory_record_id: null,
    confidence: 80, reality_fidelity: 70,
    metadata: meta, version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export class DecisionGraphBuilder {
  buildGraph(decision: Decision): DecisionGraphIntegration {
    const dNode = gn(`Decision: ${decision.decision_goal}`, "Decision", decision.id, {
      entity: decision.target_entity, domain: decision.target_domain,
      type: decision.type, score: decision.recommendation.evaluation.decision_score,
    });

    const optNodes = decision.options.map(o =>
      gn(`Option: ${o.name}`, "Decision", o.id, {
        source: o.source, expected_value: o.expected_value, risk: o.risk,
      })
    );

    const evalNodes: GraphNode[] = [gn(`Evaluation: ${decision.decision_goal}`, "Decision", decision.recommendation.evaluation.decision_score.toString(), {
      score: decision.recommendation.evaluation.decision_score,
      optimization_score: decision.recommendation.evaluation.optimization_score,
      evidence_quality: decision.recommendation.evaluation.evidence_quality,
      goal_alignment: decision.recommendation.evaluation.goal_alignment,
      risk_adjusted_value: decision.recommendation.evaluation.risk_adjusted_value,
    })];

    const ctxNode = gn(`Context: ${decision.target_entity}`, "Decision", null, {
      prediction_accuracy: decision.context.prediction_accuracy,
      reality_fidelity: decision.context.reality_fidelity,
      contradiction_count: decision.context.contradiction_count,
      uncertainty_level: decision.context.uncertainty_level,
    });

    const rejectionNodes = decision.rejected_options.map(r =>
      gn(`Rejected: ${r.option.name}`, "Decision", r.option.id, { reason: r.reason })
    );

    const apprNode = decision.recommendation.approval.required
      ? gn(`Approval required`, "Decision", null, {
          reasons: decision.recommendation.approval.reasons,
          risk_level: decision.recommendation.approval.risk_level,
        })
      : null;

    function ge(fromId: string, toId: string, type_: string, meta: Record<string, unknown>): GraphEdge {
      return {
        id: "ge_" + Math.random().toString(36).slice(2, 10),
        type: type_ as any, from_node_id: fromId, to_node_id: toId,
        confidence: 80, evidence: ["decision_engine"], metadata: meta,
        created_at: new Date().toISOString(),
      };
    }

    const de = (toId: string, type_: string, meta: Record<string, unknown> = {}) => ge(dNode.id, toId, type_, meta);
    const edges: DecisionGraphEdges = {
      decisionToOptions: optNodes.map(n => de(n.id, "derived_from", { option_name: n.label })),
      decisionToRejected: rejectionNodes.map(n => de(n.id, "derived_from", { reason: n.metadata.reason })),
      decisionToEvaluation: evalNodes.map(n => de(n.id, "derived_from", {})),
      decisionToContext: [de(ctxNode.id, "derived_from", {})],
      optionToOptimization: decision.options.map(o => ge(o.id, "dummy_opt", "derived_from", { source: o.source })),
      decisionToApproval: apprNode ? [de(apprNode.id, "derived_from", {})] : [],
      decisionToEvidence: [de(dNode.id, "validated_by", { evidence_count: decision.options.length })],
    };

    return {
      nodes: { decisionNode: dNode, optionNodes: optNodes, evaluationNodes: evalNodes, contextNode: ctxNode, rejectionNodes, approvalNode: apprNode },
      edges,
    };
  }
}
