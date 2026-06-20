// GroIntel ROS-3 — Agent Types
export type LifecycleState = "created" | "booting" | "idle" | "observing" | "reasoning"
  | "planning" | "waiting" | "sleeping" | "paused" | "terminated";

export interface AgentIdentity {
  id: string;
  name: string;
  version: number;
  role: string;
  mission: string;
  core_values: string[];
  capabilities: string[];
  long_term_goals: string[];
  short_term_goals: string[];
  personality_profile: string;
  risk_policy: string;
  created_at: string;
}

export interface AgentMission {
  statement: string;
  primary_objective: string;
  secondary_objectives: string[];
  constraints: string[];
  success_criteria: string[];
}

export interface AgentValues {
  honesty: number;
  curiosity: number;
  prudence: number;
  cooperation: number;
  growth: number;
}

export interface AgentMemory {
  episodic: { timestamp: string; event: string; significance: number }[];
  semantic: Record<string, unknown>;
  working: Record<string, unknown>;
  goals: { id: string; description: string; status: string; priority: number }[];
  workflow_history: { instance_id: string; definition_id: string; status: string; completed_at: string | null }[];
  decision_history: { timestamp: string; decision: string; confidence: number }[];
  learning_history: { timestamp: string; insight: string; source: string }[];
}

export interface AgentGoal {
  id: string;
  description: string;
  priority: number;
  status: "active" | "in_progress" | "completed" | "failed" | "deferred";
  created_at: string;
  completed_at: string | null;
}

export interface AgentDefinition {
  name: string;
  role: string;
  mission: string;
  core_values: string[];
  capabilities: string[];
  long_term_goals: string[];
  short_term_goals: string[];
  personality_profile: string;
  risk_policy: string;
}

export interface AgentInstance {
  identity: AgentIdentity;
  mission: AgentMission;
  values: AgentValues;
  state: LifecycleState;
  memory: AgentMemory;
  goals: AgentGoal[];
  active_workflow_ids: string[];
  created_at: string;
  updated_at: string;
  cycle_count: number;
}

export interface AgentTrace {
  id: string;
  agent_id: string;
  cycle: number;
  state: LifecycleState;
  actions: { action: string; result: string; duration_ms: number }[];
  sdk_calls: { method: string; success: boolean; duration_ms: number }[];
  errors: { message: string; at: string }[];
  started_at: string;
  completed_at: string;
}

export interface HealthReport {
  agent_id: string;
  status: "healthy" | "warning" | "critical" | "stalled";
  memory_growth: number;
  workflow_load: number;
  goals_completed: number;
  goals_total: number;
  reasoning_failures: number;
  runtime_exceptions: number;
  cycles_total: number;
  last_active: string;
}
