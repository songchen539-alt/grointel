// GroIntel ROS-1 — Workflow Trace
import { WorkflowTrace, WorkflowInstance, WorkflowStatus, WorkflowStep, WorkflowApproval } from "./workflow_types";

let tCounter = 0;
function genId(): string { return "wft_" + (++tCounter).toString(16).padStart(6, "0"); }

export class WorkflowTraceRecorder {
  private traces: Map<string, WorkflowTrace> = new Map();

  create(instance: WorkflowInstance, defName: string): WorkflowTrace {
    const now = new Date().toISOString();
    const trace: WorkflowTrace = {
      id: genId(), instance_id: instance.id, definition_id: instance.definition_id,
      definition_name: defName,
      status_sequence: [{ status: instance.status, at: now }],
      steps_executed: [], transitions: [], approvals: [],
      inputs: instance.input, outputs: {}, errors: [],
      decisions: [], evidence: [], timestamps: { created: now, completed: null },
    };
    this.traces.set(trace.id, trace);
    return trace;
  }

  recordTransition(t: WorkflowTrace, from: WorkflowStatus, to: WorkflowStatus, at: string): void {
    t.transitions = [...t.transitions, { from, to, at }];
    t.status_sequence = [...t.status_sequence, { status: to, at }];
  }

  recordStep(t: WorkflowTrace, step: WorkflowStep, result: string, durationMs: number): void {
    t.steps_executed = [...t.steps_executed, {
      step_id: step.id, type: step.type, config: step.config, result, duration_ms: durationMs,
    }];
  }

  recordApproval(t: WorkflowTrace, a: WorkflowApproval): void {
    t.approvals = [...t.approvals, a];
  }

  recordError(t: WorkflowTrace, stepId: string, message: string, at: string): void {
    t.errors = [...t.errors, { step_id: stepId, message, at }];
  }

  recordDecision(t: WorkflowTrace, decision: Record<string, unknown>): void {
    t.decisions = [...t.decisions, decision];
  }

  get(id: string): WorkflowTrace | null { return this.traces.get(id) || null; }
  getByInstance(instanceId: string): WorkflowTrace | null {
    return Array.from(this.traces.values()).find(t => t.instance_id === instanceId) || null;
  }
  getAll(): WorkflowTrace[] { return Array.from(this.traces.values()); }
}
