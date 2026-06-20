// GroIntel ROS-1 — Workflow Types
export type WorkflowStatus = "created" | "running" | "waiting" | "waiting_for_approval"
  | "approved" | "rejected" | "paused" | "completed" | "failed" | "cancelled";

export type StepType = "observe" | "attend" | "cognize" | "simulate" | "plan"
  | "strategize" | "discover" | "optimize" | "decide" | "request_approval"
  | "execute_external" | "wait" | "learn" | "complete";

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: number;
  trigger: string;
  steps: WorkflowStep[];
  transitions: WorkflowTransition[];
  required_inputs: string[];
  expected_outputs: string[];
  approval_policy: { require_human_approval: boolean; auto_approve_if_safe: boolean };
  timeout_policy: { timeout_ms: number; on_timeout: string };
  retry_policy: { max_retries: number; retry_delay_ms: number };
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  type: StepType;
  name: string;
  config: Record<string, unknown>;
}

export interface WorkflowTransition {
  from: WorkflowStatus;
  to: WorkflowStatus;
  condition: string;
}

export interface WorkflowApproval {
  id: string;
  instance_id: string;
  step_id: string;
  status: "pending" | "approved" | "rejected" | "needs_more_evidence" | "defer";
  requested_at: string;
  decided_at: string | null;
  reasons: string[];
  risk_level: string;
  confidence: number;
}

export interface WorkflowEvent {
  type: string;
  instance_id: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface WorkflowInstance {
  id: string;
  definition_id: string;
  status: WorkflowStatus;
  current_step_index: number;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  context: Record<string, unknown>;
  history: { from: WorkflowStatus; to: WorkflowStatus; at: string; reason: string }[];
  approvals: WorkflowApproval[];
  errors: { step_id: string; message: string; at: string }[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface WorkflowTrace {
  id: string;
  instance_id: string;
  definition_id: string;
  definition_name: string;
  status_sequence: { status: WorkflowStatus; at: string }[];
  steps_executed: { step_id: string; type: StepType; config: Record<string, unknown>; result: string; duration_ms: number }[];
  transitions: { from: WorkflowStatus; to: WorkflowStatus; at: string }[];
  approvals: WorkflowApproval[];
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  errors: { step_id: string; message: string; at: string }[];
  decisions: Record<string, unknown>[];
  evidence: string[];
  timestamps: { created: string; completed: string | null };
}

export interface WorkflowResult {
  instance_id: string;
  status: WorkflowStatus;
  output: Record<string, unknown>;
  approvals_required: number;
  approvals_granted: number;
  errors_count: number;
  duration_ms: number;
  steps_count: number;
}
