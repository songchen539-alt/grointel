// GroIntel APP-1 — Application Types
export type ApplicationState = "draft" | "registered" | "active" | "paused" | "deprecated" | "archived";

export interface ApplicationManifest {
  id: string; name: string; description: string; version: number; domain: string;
  target_users: string[]; required_capabilities: string[]; required_agents: string[];
  required_workflows: string[]; permissions: string[]; data_domains: string[];
  risk_level: "low" | "medium" | "high"; created_at: string; updated_at: string;
}

export interface ApplicationInstance {
  id: string; manifest: ApplicationManifest; state: ApplicationState;
  session_count: number; last_session: string | null; created_at: string; updated_at: string;
}

export interface ApplicationContext {
  app_id: string; app_name: string; domain: string; session_id: string;
  bound_capabilities: string[]; bound_workflows: string[]; bound_agents: string[];
  permissions_granted: string[]; started_at: string;
}

export interface ApplicationCapability {
  capability_id: string; mapped_method: string; permission_level: string; available: boolean;
}

export interface ApplicationWorkflowBinding {
  workflow_type: string; definition_id: string; bound: boolean;
}

export interface ApplicationAgentBinding {
  agent_name: string; agent_id: string; bound: boolean;
}

export interface ApplicationStateSnapshot {
  app_id: string; state: ApplicationState; session_count: number;
  capabilities_available: number; capabilities_total: number;
  workflows_bound: number; workflows_total: number;
  agents_bound: number; agents_total: number;
}

export interface ApplicationTrace {
  id: string; action: string; app_id: string; details: string; timestamp: string;
}
