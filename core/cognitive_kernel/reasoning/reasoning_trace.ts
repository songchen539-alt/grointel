// GroIntel Cognitive Kernel — Reasoning Trace
// Tracks reasoning paths for full traceability
import { ReasoningTrace } from "./reasoning_types";

let traceCounter = 0;
function genId(): string { return "rtr_" + (++traceCounter).toString(16).padStart(6, "0"); }

export class ReasoningTraceRecorder {
  private traces: Map<string, ReasoningTrace> = new Map();

  start(nodeId: string, claimType: ReasoningTrace["claim_type"], claim: string): ReasoningTrace {
    const trace: ReasoningTrace = {
      id: genId(),
      trigger_node_id: nodeId,
      claim_type: claimType,
      claim,
      evidence_node_ids: [],
      evidence_edge_ids: [],
      traversed_node_ids: [nodeId],
      intermediate_claims: [],
      confidence: 50,
      assumptions: ["Graph data is accurate"],
      unknowns: ["Unobserved relationships may exist"],
      contradictions: [],
      reasoning_path: `Reasoning started at ${nodeId}`,
      created_at: new Date().toISOString(),
    };
    this.traces.set(trace.id, trace);
    return trace;
  }

  addEvidence(traceId: string, nodeIds: string[], edgeIds: string[]): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    trace.evidence_node_ids.push(...nodeIds);
    trace.evidence_edge_ids.push(...edgeIds);
  }

  addIntermediate(traceId: string, claim: string): void {
    const trace = this.traces.get(traceId);
    if (trace) trace.intermediate_claims.push(claim);
  }

  setConfidence(traceId: string, confidence: number): void {
    const trace = this.traces.get(traceId);
    if (trace) trace.confidence = confidence;
  }

  finalize(traceId: string): ReasoningTrace | null {
    const trace = this.traces.get(traceId);
    if (trace) {
      trace.reasoning_path = `[${trace.intermediate_claims.join(" -> ")}] -> ${trace.claim}`;
    }
    return trace || null;
  }
}
