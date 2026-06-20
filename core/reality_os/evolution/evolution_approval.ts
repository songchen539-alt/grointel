// GroIntel ROS-6 — Evolution Approval (human only)
import { EvolutionApproval, ApprovalStatus } from "./evolution_types";

let aCounter = 0;
function genId(): string { return "ea_" + (++aCounter).toString(16).padStart(6, "0"); }

export class EvolutionApprovalEngine {
  request(proposalId: string): EvolutionApproval {
    return { id: genId(), proposal_id: proposalId, status: "pending", human_reviewer: "human", decided_at: null, notes: "" };
  }

  approve(approval: EvolutionApproval, notes = ""): EvolutionApproval {
    return { ...approval, status: "approved", decided_at: new Date().toISOString(), notes };
  }

  reject(approval: EvolutionApproval, reason: string): EvolutionApproval {
    return { ...approval, status: "rejected", decided_at: new Date().toISOString(), notes: reason };
  }

  requestMoreEvidence(approval: EvolutionApproval, reason: string): EvolutionApproval {
    return { ...approval, status: "needs_more_evidence", decided_at: new Date().toISOString(), notes: reason };
  }

  defer(approval: EvolutionApproval, reason: string): EvolutionApproval {
    return { ...approval, status: "deferred", decided_at: new Date().toISOString(), notes: reason };
  }

  isApproved(approval: EvolutionApproval): boolean { return approval.status === "approved"; }
}
