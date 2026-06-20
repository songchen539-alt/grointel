// GroIntel OPS-1 — Always-On Runtime Types
export type RuntimeMode = "manual" | "simulated" | "scheduled" | "event_driven" | "always_on";
export type JobStatus = "queued" | "running" | "completed" | "failed" | "retrying" | "cancelled";
export type ConnectorCapability = "observe_website" | "observe_linkedin" | "observe_jobs" | "observe_github" | "observe_news" | "observe_social" | "observe_funding" | "observe_traffic" | "observe_reviews" | "observe_pricing" | "observe_product" | "observe_community" | "observe_creator";

export interface RuntimeState { mode: RuntimeMode; running: boolean; started_at: string | null; stopped_at: string | null; tick_count: number; }

export interface RuntimePolicy { maxJobsPerMinute: number; maxJobsPerCompanyPerDay: number; maxConnectorRunsPerHour: number; allowedConnectors: ConnectorCapability[]; disabledConnectors: ConnectorCapability[]; respectRateLimits: boolean; requireExplicitConnectorPermission: boolean; stopOnRepeatedFailure: boolean; maxConsecutiveFailures: number; backoffBaseMs: number; backoffMaxMs: number; allowNetworkFetch: boolean; }

export const SAFE_POLICY: RuntimePolicy = { maxJobsPerMinute: 10, maxJobsPerCompanyPerDay: 50, maxConnectorRunsPerHour: 30, allowedConnectors: ["observe_website","observe_linkedin","observe_jobs","observe_github","observe_news","observe_social","observe_funding","observe_traffic","observe_reviews","observe_pricing","observe_product","observe_community","observe_creator"], disabledConnectors: [], respectRateLimits: true, requireExplicitConnectorPermission: false, stopOnRepeatedFailure: true, maxConsecutiveFailures: 5, backoffBaseMs: 1000, backoffMaxMs: 60000, allowNetworkFetch: false, };

export interface RuntimeJob { id: string; company_memory_id: string; capabilities: ConnectorCapability[]; priority: number; status: JobStatus; scheduled_at: string; started_at: string | null; completed_at: string | null; retry_count: number; max_retries: number; error: string | null; dedup_key: string; }

export interface RuntimeQueue { jobs: RuntimeJob[]; size: number; }

export interface RuntimeWorker { id: string; status: "idle" | "running" | "stopped"; current_job_id: string | null; jobs_processed: number; jobs_failed: number; started_at: string; }

export interface RuntimeExecution { id: string; job_id: string; worker_id: string; started_at: string; completed_at: string | null; result: "success" | "failure" | "timeout"; error: string | null; }

export interface RuntimeExecutionResult { success: boolean; memory_updated: boolean; decision_updated: boolean; signals_found: number; error: string | null; }

export interface RuntimeHeartbeat { last_started_at: string | null; last_stopped_at: string | null; last_tick_at: string | null; last_successful_job_at: string | null; last_failed_job_at: string | null; jobs_processed: number; jobs_failed: number; uptime_ms: number; current_state: string; }

export interface RuntimeBackoffPolicy { base_ms: number; max_ms: number; current_ms: number; attempt: number; }

export interface RuntimeRateLimitPolicy { per_minute: number; per_company_per_day: number; per_connector_per_hour: number; }

export interface RuntimeCheckpoint { company_memory_id: string; last_observed_at: string | null; last_connector_run_at: string | null; last_signal_hash: string; last_decision_update_at: string | null; last_workspace_update_at: string | null; }

export interface RuntimeAuditLogEntry { id: string; event: string; job_id: string | null; company_memory_id: string | null; details: string; timestamp: string; }

export interface RuntimeNetworkState { available: boolean; last_checked: string | null; mode: RuntimeMode; }
