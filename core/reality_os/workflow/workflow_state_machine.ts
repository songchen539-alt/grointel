// GroIntel ROS-1 — Workflow State Machine
import { WorkflowStatus } from "./workflow_types";

const ALLOWED: Map<WorkflowStatus, WorkflowStatus[]> = new Map([
  ["created", ["running"]],
  ["running", ["waiting", "waiting_for_approval", "completed", "failed", "paused"]],
  ["waiting", ["running", "paused"]],
  ["waiting_for_approval", ["approved", "rejected"]],
  ["approved", ["running"]],
  ["rejected", ["paused"]],
  ["paused", ["running", "cancelled"]],
  ["failed", ["running", "cancelled"]],
  ["completed", []],
  ["cancelled", []],
]);

export class WorkflowStateMachine {
  canTransition(from: WorkflowStatus, to: WorkflowStatus): boolean {
    const allowed = ALLOWED.get(from);
    if (!allowed) return false;
    return allowed.includes(to);
  }

  transition(from: WorkflowStatus, to: WorkflowStatus): WorkflowStatus {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid state transition: ${from} -> ${to}`);
    }
    return to;
  }
}
