// GroIntel ROS-1 — Workflow Instance
import { WorkflowInstance, WorkflowStatus, WorkflowApproval } from "./workflow_types";

let iCounter = 0;
function genId(): string { return "wfi_" + (++iCounter).toString(16).padStart(6, "0"); }

export class WorkflowInstanceManager {
  private instances: Map<string, WorkflowInstance> = new Map();

  create(defId: string, input: Record<string, unknown> = {}): WorkflowInstance {
    const now = new Date().toISOString();
    const inst: WorkflowInstance = {
      id: genId(), definition_id: defId, status: "created",
      current_step_index: 0, input, output: {}, context: {},
      history: [{ from: "created", to: "created", at: now, reason: "instance created" }],
      approvals: [], errors: [],
      created_at: now, updated_at: now, completed_at: null,
    };
    this.instances.set(inst.id, inst);
    return inst;
  }

  get(id: string): WorkflowInstance | null { return this.instances.get(id) || null; }

  updateStatus(inst: WorkflowInstance, newStatus: WorkflowStatus, reason = ""): WorkflowInstance {
    const now = new Date().toISOString();
    const from = inst.status;
    inst.status = newStatus;
    inst.updated_at = now;
    inst.history = [...inst.history, { from, to: newStatus, at: now, reason }];
    if (newStatus === "completed" || newStatus === "cancelled" || newStatus === "failed") {
      inst.completed_at = now;
    }
    return inst;
  }

  addApproval(inst: WorkflowInstance, approval: WorkflowApproval): void {
    inst.approvals = [...inst.approvals, approval];
  }

  addError(inst: WorkflowInstance, stepId: string, message: string): void {
    inst.errors = [...inst.errors, { step_id: stepId, message, at: new Date().toISOString() }];
  }

  advance(inst: WorkflowInstance): WorkflowInstance {
    inst.current_step_index++;
    inst.updated_at = new Date().toISOString();
    return inst;
  }

  getAll(): WorkflowInstance[] { return Array.from(this.instances.values()); }
}
