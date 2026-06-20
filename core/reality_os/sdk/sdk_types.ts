// GroIntel ROS-2 — SDK Types
export type CallerType = "core" | "workflow" | "plugin" | "application" | "agent" | "admin" | "test";
export type PermissionLevel = "read" | "write" | "execute" | "approve" | "admin";
export type MethodClass = "READ" | "WRITE" | "EXECUTE" | "APPROVE";

export interface SDKContext {
  caller_id: string;
  caller_type: CallerType;
  purpose: string;
  permissions: PermissionLevel;
  request_id: string;
  trace_id: string;
  created_at: string;
}

export interface SDKRequest {
  method: string;
  params: Record<string, unknown>;
  context: SDKContext;
}

export interface SDKError {
  code: string;
  message: string;
  severity: "info" | "warning" | "error" | "critical";
  retryable: boolean;
  details: Record<string, unknown>;
}

export interface SDKResult<T = unknown> {
  id: string;
  created_at: string;
  success: boolean;
  data: T | null;
  error: SDKError | null;
  warnings: string[];
  confidence: number;
  reality_fidelity: number;
  evidence: string[];
  trace: SDKTraceEntry;
}

export interface SDKTraceEntry {
  id: string;
  caller_id: string;
  caller_type: CallerType;
  capability: string;
  input_summary: string;
  permission_check: { required: PermissionLevel; granted: PermissionLevel; passed: boolean };
  started_at: string;
  completed_at: string;
  duration_ms: number;
  result_status: "success" | "error" | "blocked";
  warnings: string[];
  evidence: string[];
}

export interface CapabilityDefinition {
  id: string;
  name: string;
  description: string;
  layer: string;
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  required_permissions: PermissionLevel;
  risk_level: "low" | "medium" | "high";
  available: boolean;
  version: number;
}

export interface CapabilityCall {
  capability_id: string;
  input: Record<string, unknown>;
  context: SDKContext;
}
