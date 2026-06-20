// GroIntel ROS-6 — Evolution Trace
import { EvolutionTrace } from "./evolution_types";

let tCounter = 0;
function genId(): string { return "etr_" + (++tCounter).toString(16).padStart(6, "0"); }

export class EvolutionTraceRecorder {
  private traces: EvolutionTrace[] = [];

  record(action: string, proposalId: string | null, details: string): EvolutionTrace {
    const t: EvolutionTrace = { id: genId(), action, proposal_id: proposalId, details, timestamp: new Date().toISOString() };
    this.traces.push(t);
    return t;
  }

  getAll(): EvolutionTrace[] { return this.traces; }
  findByAction(action: string): EvolutionTrace[] { return this.traces.filter(t => t.action === action); }
  findByProposal(proposalId: string): EvolutionTrace[] { return this.traces.filter(t => t.proposal_id === proposalId); }
}
