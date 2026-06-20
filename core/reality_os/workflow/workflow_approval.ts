// GroIntel ROS-1 — Workflow Approval Engine
import { WorkflowApproval } from "./workflow_types";

let aCounter = 0;
function genId(): string { return "wap_" + (++aCounter).toString(16).padStart(6, "0"); }

export class WorkflowApprovalEngine {
  request(instanceId: string, stepId: string, reasons: string[], riskLevel: string, confidence: number): WorkflowApproval {
    return {
      id: genId(), instance_id: instanceId, step_id: stepId,
      status: "pending", requested_at: new Date().toISOString(), decided_at: null,
      reasons, risk_level: riskLevel, confidence,
    };
  }

  approve(approval: WorkflowApproval): WorkflowApproval {
    return { ...approval, status: "approved", decided_at: new Date().toISOString() };
  }

  reject(approval: WorkflowApproval): WorkflowApproval {
    return { ...approval, status: "rejected", decided_at: new Date().toISOString() };
  }

  needsMoreEvidence(approval: WorkflowApproval): WorkflowApproval {
    return { ...approval, status: "needs_more_evidence", decided_at: new Date().toISOString() };
  }

  defer(approval: WorkflowApproval): WorkflowApproval {
    return { ...approval, status: "defer", decided_at: new Date().toISOString() };
  }

  requiresApproval(approval: WorkflowApproval): boolean {
    // Require approval when risk is high, confidence is low, or specific reasons
    return approval.risk_level === "high" || approval.confidence < 70 || approval.reasons.length > 0;
  }
}
