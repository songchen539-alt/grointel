// GroIntel ROS-1 — Workflow Runtime (orchestrates, never executes external)
import { WorkflowDefinition, WorkflowInstance, WorkflowResult, WorkflowStatus, WorkflowEvent } from "./workflow_types";
import { WorkflowRegistry } from "./workflow_registry";
import { WorkflowInstanceManager } from "./workflow_instance";
import { WorkflowStepExecutor } from "./workflow_step_executor";
import { WorkflowStateMachine } from "./workflow_state_machine";
import { WorkflowApprovalEngine } from "./workflow_approval";
import { WorkflowScheduler } from "./workflow_scheduler";
import { WorkflowTraceRecorder } from "./workflow_trace";

export class WorkflowRuntime {
  public readonly registry = new WorkflowRegistry();
  public readonly instances = new WorkflowInstanceManager();
  public readonly stepExec = new WorkflowStepExecutor();
  public readonly stateMachine = new WorkflowStateMachine();
  public readonly approvals = new WorkflowApprovalEngine();
  public readonly scheduler = new WorkflowScheduler();
  public readonly traces = new WorkflowTraceRecorder();

  private eventListeners: ((event: WorkflowEvent) => void)[] = [];

  registerBuiltins(defs: WorkflowDefinition[]): void {
    for (const d of defs) {
      if (!this.registry.exists(d.id)) this.registry.register(d);
    }
  }

  start(defId: string, input: Record<string, unknown> = {}): WorkflowInstance {
    const def = this.registry.get(defId);
    if (!def) throw new Error(`Workflow definition '${defId}' not found`);
    if (def.steps.length === 0) throw new Error(`Workflow '${defId}' has no steps`);

    const inst = this.instances.create(defId, input);
    this.stateMachine.transition(inst.status, "running");
    this.instances.updateStatus(inst, "running", "Workflow started");
    const trace = this.traces.create(inst, def.name);
    this.traces.recordTransition(trace, "created", "running", new Date().toISOString());
    this.emit({ type: "workflow.started", instance_id: inst.id, timestamp: inst.created_at, data: { definition_id: defId } });
    this.advance(inst);
    return inst;
  }

  advance(inst: WorkflowInstance): WorkflowInstance {
    const def = this.registry.get(inst.definition_id);
    if (!def) return inst;
    if (inst.status === "completed" || inst.status === "cancelled") return inst;

    while (inst.current_step_index < def.steps.length) {
      const step = def.steps[inst.current_step_index];
      const trace = this.traces.getByInstance(inst.id);
      const result = this.stepExec.execute(step, inst);

      if (result.status === "error") {
        this.instances.addError(inst, step.id, result.error || "Unknown error");
        if (trace) this.traces.recordError(trace, step.id, result.error || "Unknown error", new Date().toISOString());
        if (inst.errors.length >= def.retry_policy.max_retries) {
          this.stateMachine.transition(inst.status, "failed");
          this.instances.updateStatus(inst, "failed", `Step '${step.name}' failed after ${def.retry_policy.max_retries} retries`);
          if (trace) this.traces.recordTransition(trace, inst.status, "failed", new Date().toISOString());
        }
        return inst;
      }

      if (result.status === "blocked") {
        this.instances.addError(inst, step.id, "External execution blocked: requires future sprint");
        if (trace) this.traces.recordError(trace, step.id, "External execution blocked: requires future sprint", new Date().toISOString());
        this.stateMachine.transition(inst.status, "paused");
        this.instances.updateStatus(inst, "paused", `Blocked at step '${step.name}'`);
        if (trace) this.traces.recordTransition(trace, inst.status, "paused", new Date().toISOString());
        return inst;
      }

      if (step.type === "request_approval") {
        const approval = this.approvals.request(inst.id, step.id, ["Strategic decision requires human review"], "high", 72);
        this.instances.addApproval(inst, approval);
        if (trace) this.traces.recordApproval(trace, approval);
        this.stateMachine.transition(inst.status, "waiting_for_approval");
        this.instances.updateStatus(inst, "waiting_for_approval", `Approval required at step '${step.name}'`);
        if (trace) this.traces.recordTransition(trace, inst.status, "waiting_for_approval", new Date().toISOString());
        this.emit({ type: "workflow.approval_required", instance_id: inst.id, timestamp: new Date().toISOString(), data: { step_id: step.id, approval_id: approval.id } });
        return inst;
      }

      if (trace) this.traces.recordStep(trace, step, JSON.stringify(result.output), result.duration_ms);
      inst.output = { ...inst.output, ...result.output };

      if (step.type === "complete") {
        this.stateMachine.transition(inst.status, "completed");
        this.instances.updateStatus(inst, "completed", "All steps completed");
        this.instances.advance(inst); // advance past complete step
        this.emit({ type: "workflow.completed", instance_id: inst.id, timestamp: new Date().toISOString(), data: {} });
        if (trace) {
          this.traces.recordTransition(trace, inst.status, "completed", new Date().toISOString());
          trace.outputs = inst.output;
          trace.timestamps.completed = new Date().toISOString();
        }
        return inst;
      }

      if (step.type === "wait") {
        this.stateMachine.transition(inst.status, "waiting");
        this.instances.updateStatus(inst, "waiting", `Waiting at step '${step.name}'`);
        this.instances.advance(inst); // advance past wait step so resume moves to next
        if (trace) this.traces.recordTransition(trace, inst.status, "waiting", new Date().toISOString());
        return inst;
      }

      this.instances.advance(inst);
    }

    return inst;
  }

  approve(inst: WorkflowInstance): WorkflowInstance {
    const lastApproval = inst.approvals[inst.approvals.length - 1];
    if (lastApproval) {
      const updated = this.approvals.approve(lastApproval);
      this.instances.addApproval(inst, updated);
      this.stateMachine.transition(inst.status, "approved");
      this.instances.updateStatus(inst, "approved", "Approval granted");
      this.stateMachine.transition(inst.status, "running");
      this.instances.updateStatus(inst, "running", "Resumed after approval");
      this.instances.advance(inst); // skip past request_approval step
      this.emit({ type: "workflow.approved", instance_id: inst.id, timestamp: new Date().toISOString(), data: { approval_id: updated.id } });
      return this.advance(inst);
    }
    return inst;
  }

  reject(inst: WorkflowInstance): WorkflowInstance {
    const lastApproval = inst.approvals[inst.approvals.length - 1];
    if (lastApproval) {
      const updated = this.approvals.reject(lastApproval);
      this.instances.addApproval(inst, updated);
      this.stateMachine.transition(inst.status, "rejected");
      this.instances.updateStatus(inst, "rejected", "Approval rejected");
      this.stateMachine.transition(inst.status, "paused");
      this.instances.updateStatus(inst, "paused", "Paused after rejection");
      this.emit({ type: "workflow.rejected", instance_id: inst.id, timestamp: new Date().toISOString(), data: { approval_id: updated.id } });
    }
    return inst;
  }

  pause(inst: WorkflowInstance): WorkflowInstance {
    const current = inst.status;
    if (current === "running" || current === "waiting") {
      this.stateMachine.transition(current, "paused");
      this.instances.updateStatus(inst, "paused", "Paused by user");
      const trace = this.traces.getByInstance(inst.id);
      if (trace) this.traces.recordTransition(trace, current, "paused", new Date().toISOString());
      this.emit({ type: "workflow.paused", instance_id: inst.id, timestamp: new Date().toISOString(), data: {} });
    }
    return inst;
  }

  resume(inst: WorkflowInstance): WorkflowInstance {
    if (inst.status === "paused") {
      this.stateMachine.transition(inst.status, "running");
      this.instances.updateStatus(inst, "running", "Resumed by user");
      this.emit({ type: "workflow.resumed", instance_id: inst.id, timestamp: new Date().toISOString(), data: {} });
      return this.advance(inst);
    }
    return inst;
  }

  cancel(inst: WorkflowInstance): WorkflowInstance {
    if (this.stateMachine.canTransition(inst.status, "cancelled")) {
      this.stateMachine.transition(inst.status, "cancelled");
      this.instances.updateStatus(inst, "cancelled", "Cancelled by user");
      this.emit({ type: "workflow.cancelled", instance_id: inst.id, timestamp: new Date().toISOString(), data: {} });
    }
    return inst;
  }

  retry(inst: WorkflowInstance): WorkflowInstance {
    if (inst.status === "failed") {
      this.stateMachine.transition(inst.status, "running");
      this.instances.updateStatus(inst, "running", "Retrying failed step");
      return this.advance(inst);
    }
    return inst;
  }

  getResult(inst: WorkflowInstance): WorkflowResult {
    const def = this.registry.get(inst.definition_id);
    return {
      instance_id: inst.id, status: inst.status, output: inst.output,
      approvals_required: inst.approvals.length,
      approvals_granted: inst.approvals.filter(a => a.status === "approved").length,
      errors_count: inst.errors.length,
      duration_ms: inst.completed_at ? new Date(inst.completed_at).getTime() - new Date(inst.created_at).getTime() : 0,
      steps_count: def?.steps.length || 0,
    };
  }

  onEvent(listener: (event: WorkflowEvent) => void): void { this.eventListeners.push(listener); }
  private emit(event: WorkflowEvent): void { for (const l of this.eventListeners) l(event); }
}
