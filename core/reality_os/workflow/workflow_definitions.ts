// GroIntel ROS-1 — Workflow Definitions (5 built-in)
import { WorkflowDefinition, WorkflowStep, WorkflowTransition } from "./workflow_types";

function step(id: string, type_: any, name: string, config: Record<string, unknown> = {}): WorkflowStep {
  return { id, type: type_, name, config };
}

const now = "2026-06-20T15:59:00.000Z";

// 1. Reality Event Analysis
export const REALITY_EVENT_ANALYSIS: WorkflowDefinition = {
  id: "reality_event_analysis", name: "Reality Event Analysis", description: "Observe, attend, cognize, then learn from reality events",
  version: 1, trigger: "event",
  steps: [step("s1", "observe", "Observe events"), step("s2", "attend", "Attend to events"), step("s3", "cognize", "Cognize patterns"), step("s4", "learn", "Learn insights"), step("s5", "complete", "Complete")],
  transitions: [], required_inputs: ["domain"], expected_outputs: ["insights", "confidence_updated"],
  approval_policy: { require_human_approval: false, auto_approve_if_safe: true },
  timeout_policy: { timeout_ms: 60000, on_timeout: "fail" },
  retry_policy: { max_retries: 2, retry_delay_ms: 1000 }, created_at: now, updated_at: now,
};

// 2. Opportunity Discovery
export const OPPORTUNITY_DISCOVERY: WorkflowDefinition = {
  id: "opportunity_discovery", name: "Opportunity Discovery", description: "Discover and evaluate opportunities",
  version: 1, trigger: "manual",
  steps: [step("s1", "observe", "Observe"), step("s2", "attend", "Attend"), step("s3", "discover", "Discover"), step("s4", "simulate", "Simulate"), step("s5", "plan", "Plan"), step("s6", "complete", "Complete")],
  transitions: [], required_inputs: ["domain"], expected_outputs: ["opportunities", "plans"],
  approval_policy: { require_human_approval: false, auto_approve_if_safe: true },
  timeout_policy: { timeout_ms: 120000, on_timeout: "fail" },
  retry_policy: { max_retries: 1, retry_delay_ms: 2000 }, created_at: now, updated_at: now,
};

// 3. Strategic Decision (requires approval for high-impact decisions)
export const STRATEGIC_DECISION: WorkflowDefinition = {
  id: "strategic_decision", name: "Strategic Decision", description: "Full strategic decision workflow with human approval",
  version: 1, trigger: "manual",
  steps: [step("s1", "observe", "Observe"), step("s2", "cognize", "Cognize"), step("s3", "simulate", "Simulate"), step("s4", "plan", "Plan"), step("s5", "strategize", "Strategize"), step("s6", "optimize", "Optimize"), step("s7", "decide", "Decide"), step("s8", "request_approval", "Request approval"), step("s9", "complete", "Complete")],
  transitions: [], required_inputs: ["domain", "goal"], expected_outputs: ["decision", "approval"],
  approval_policy: { require_human_approval: true, auto_approve_if_safe: false },
  timeout_policy: { timeout_ms: 300000, on_timeout: "pause" },
  retry_policy: { max_retries: 3, retry_delay_ms: 5000 }, created_at: now, updated_at: now,
};

// 4. Risk Monitoring
export const RISK_MONITORING: WorkflowDefinition = {
  id: "risk_monitoring", name: "Risk Monitoring", description: "Monitor and respond to risks continuously",
  version: 1, trigger: "schedule",
  steps: [step("s1", "observe", "Observe"), step("s2", "attend", "Attend"), step("s3", "cognize", "Cognize"), step("s4", "discover", "Discover risks"), step("s5", "decide", "Decide"), step("s6", "complete", "Complete")],
  transitions: [], required_inputs: ["domain"], expected_outputs: ["risks", "mitigations"],
  approval_policy: { require_human_approval: false, auto_approve_if_safe: true },
  timeout_policy: { timeout_ms: 60000, on_timeout: "fail" },
  retry_policy: { max_retries: 2, retry_delay_ms: 1000 }, created_at: now, updated_at: now,
};

// 5. Prediction Validation
export const PREDICTION_VALIDATION: WorkflowDefinition = {
  id: "prediction_validation", name: "Prediction Validation", description: "Validate predictions and update learning",
  version: 1, trigger: "event",
  steps: [step("s1", "observe", "Observe outcome"), step("s2", "cognize", "Cognize"), step("s3", "learn", "Update learning"), step("s4", "complete", "Complete")],
  transitions: [], required_inputs: ["prediction_id"], expected_outputs: ["validation_result", "confidence_updated"],
  approval_policy: { require_human_approval: false, auto_approve_if_safe: true },
  timeout_policy: { timeout_ms: 30000, on_timeout: "fail" },
  retry_policy: { max_retries: 1, retry_delay_ms: 500 }, created_at: now, updated_at: now,
};

export const BUILTIN_WORKFLOWS: WorkflowDefinition[] = [
  REALITY_EVENT_ANALYSIS, OPPORTUNITY_DISCOVERY, STRATEGIC_DECISION, RISK_MONITORING, PREDICTION_VALIDATION,
];
