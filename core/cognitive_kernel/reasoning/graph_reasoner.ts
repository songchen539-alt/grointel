// GroIntel Cognitive Kernel — Graph Reasoner
// Main entry point for reasoning about entities, signals, predictions, contradictions
import { GraphEngine } from "../graph/graph_engine";
import { ReasoningResult, ReasoningTrace, Inference, CausalChain } from "./reasoning_types";
import { InferenceEngine } from "./inference_engine";
import { CausalReasoner } from "./causal_reasoner";
import { ContradictionReasoner } from "./contradiction_reasoner";
import { OpportunityReasoner } from "./opportunity_reasoner";
import { RiskReasoner } from "./risk_reasoner";

let traceCounter = 0;
function genId(): string { return "rt_" + (++traceCounter).toString(16).padStart(6, "0"); }

export class GraphReasoner {
  private inferenceEngine: InferenceEngine;
  private causalReasoner: CausalReasoner;
  private contradictionReasoner: ContradictionReasoner;
  private opportunityReasoner: OpportunityReasoner;
  private riskReasoner: RiskReasoner;

  constructor(private graph: GraphEngine) {
    this.inferenceEngine = new InferenceEngine(graph);
    this.causalReasoner = new CausalReasoner(graph);
    this.contradictionReasoner = new ContradictionReasoner(graph);
    this.opportunityReasoner = new OpportunityReasoner(graph);
    this.riskReasoner = new RiskReasoner(graph);
  }

  reasonAboutEntity(entityId: string): ReasoningResult {
    const subgraph = this.graph.getEntitySubgraph(entityId);
    const entityNode = this.graph.getNode(entityId);
    const trace = this.createTrace(entityId, "inference", `Reasoning about entity: ${entityNode?.label || entityId}`);

    const inferences = this.inferenceEngine.inferFromEntity(entityId);
    const causalChains = this.causalReasoner.findCausalChains(entityId);
    const contradictions = this.contradictionReasoner.classifyContradictions(entityId);
    const opportunities = this.opportunityReasoner.detectForEntity(entityId);
    const risks = this.riskReasoner.detectForEntity(entityId);

    trace.evidence_node_ids = inferences.flatMap(i => i.premise_node_ids);
    trace.confidence = Math.round(
      ([...inferences, ...causalChains, ...opportunities, ...risks].reduce((s, r: any) => s + (r.confidence || 0), 0) /
        Math.max(1, inferences.length + causalChains.length + opportunities.length + risks.length))
    );

    return { trace, inferences, causalChains, contradictions, opportunities, risks };
  }

  reasonAboutSignal(signalId: string): ReasoningResult {
    const signalNode = this.graph.getNode(signalId);
    const trace = this.createTrace(signalId, "inference", `Reasoning about signal: ${signalNode?.label || signalId}`);
    const inferences = this.inferenceEngine.inferFromSignal(signalId);
    const opportunities = this.opportunityReasoner.detectFromSignal(signalId);
    const risks = this.riskReasoner.detectFromSignal(signalId);
    trace.evidence_node_ids = inferences.flatMap(i => i.premise_node_ids);
    return { trace, inferences, causalChains: [], contradictions: [], opportunities, risks };
  }

  reasonAboutPrediction(predictionId: string): ReasoningResult {
    const predNode = this.graph.getNode(predictionId);
    const trace = this.createTrace(predictionId, "inference", `Reasoning about prediction: ${predNode?.label || predictionId}`);
    return { trace, inferences: [], causalChains: [], contradictions: [], opportunities: [], risks: [] };
  }

  reasonAboutContradiction(contradictionId: string): ReasoningResult {
    const conNode = this.graph.getNode(contradictionId);
    const trace = this.createTrace(contradictionId, "contradiction", `Reasoning about contradiction: ${conNode?.label || contradictionId}`);
    const contradictions = this.contradictionReasoner.classifyContradictions(contradictionId);
    return { trace, inferences: [], causalChains: [], contradictions, opportunities: [], risks: [] };
  }

  reasonAboutSubgraph(nodeId: string, depth = 2): ReasoningResult {
    const neighbors = this.graph.getNeighbors(nodeId);
    const result = this.reasonAboutEntity(nodeId);
    for (const n of neighbors.slice(0, depth)) {
      const sub = this.reasonAboutEntity(n.id);
      result.inferences.push(...sub.inferences);
      result.opportunities.push(...sub.opportunities);
      result.risks.push(...sub.risks);
    }
    return result;
  }

  private createTrace(nodeId: string, claimType: ReasoningResult["trace"]["claim_type"], claim: string): ReasoningTrace {
    return {
      id: genId(),
      trigger_node_id: nodeId,
      claim_type: claimType,
      claim,
      evidence_node_ids: [],
      evidence_edge_ids: [],
      traversed_node_ids: [nodeId],
      intermediate_claims: [],
      confidence: 50,
      assumptions: ["Graph data is accurate", "Relationships are correctly typed"],
      unknowns: ["Unobserved relationships may exist", "Edge weights may change over time"],
      contradictions: [],
      reasoning_path: `Reasoning started at node ${nodeId}`,
      created_at: new Date().toISOString(),
    };
  }
}
