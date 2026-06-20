// GroIntel OPERATION-1 — Operation Types
export type WorkerType = "reality" | "knowledge" | "decision" | "life" | "supervisor";
export type WorkerStatus = "idle" | "running" | "paused" | "failed" | "recovering" | "stopped";
export type ComponentState = "healthy" | "degraded" | "critical" | "offline";

export interface WorkerService { id: string; type: WorkerType; status: WorkerStatus; health: ComponentState; uptime_ms: number; started_at: string; last_heartbeat: string; current_task: string | null; tasks_completed: number; errors: number; restarts: number; }
export interface OperationJob { id: string; worker_type: WorkerType; payload: Record<string, unknown>; priority: number; status: "pending" | "running" | "completed" | "failed"; attempt: number; max_attempts: number; created_at: string; started_at: string | null; completed_at: string | null; checkpoint: string | null; error: string | null; next_retry: string | null; }
export interface WorkerCheckpoint { worker_id: string; type: WorkerType; last_processed_id: string | null; state: Record<string, unknown>; updated_at: string; }
export interface OperationHealth { status: ComponentState; uptime_hours: number; workers_active: number; workers_failed: number; queue_depth: number; jobs_per_minute: number; avg_latency_ms: number; last_incident: string | null; }
export interface OperationEvent { id: string; type: string; worker_id: string; details: string; timestamp: string; }
export interface OperationDashboard { workers: WorkerService[]; health: OperationHealth; queue: { pending: number; running: number; completed: number; failed: number }; events: OperationEvent[]; }
