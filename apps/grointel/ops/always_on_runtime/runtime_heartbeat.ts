// OPS-1 — Runtime Heartbeat
import { RuntimeHeartbeat } from "./always_on_types";

export class RuntimeHeartbeatTracker {
  private hb: RuntimeHeartbeat = { last_started_at: null, last_stopped_at: null, last_tick_at: null, last_successful_job_at: null, last_failed_job_at: null, jobs_processed: 0, jobs_failed: 0, uptime_ms: 0, current_state: "stopped" };
  private startTime: number | null = null;

  start(): void { const now = new Date().toISOString(); this.hb.last_started_at = now; this.hb.current_state = "running"; this.startTime = Date.now(); }
  stop(): void { this.hb.last_stopped_at = new Date().toISOString(); this.hb.current_state = "stopped"; if (this.startTime) this.hb.uptime_ms += Date.now() - this.startTime; this.startTime = null; }
  tick(): void { this.hb.last_tick_at = new Date().toISOString(); }
  recordSuccess(): void { this.hb.last_successful_job_at = new Date().toISOString(); this.hb.jobs_processed++; }
  recordFailure(): void { this.hb.last_failed_job_at = new Date().toISOString(); this.hb.jobs_failed++; }
  get(): RuntimeHeartbeat { const h = { ...this.hb }; if (this.startTime) h.uptime_ms = this.hb.uptime_ms + (Date.now() - this.startTime); return h; }
}
