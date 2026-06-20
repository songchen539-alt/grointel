// OPS-1 — Always-On Runtime (main orchestrator)
import { RuntimeState, RuntimeMode, RuntimeJob, RuntimePolicy, RuntimeExecutionResult, RuntimeWorker, ConnectorCapability } from "./always_on_types";
import { RuntimeQueue } from "./runtime_queue";
import { RuntimePolicyManager } from "./runtime_policy";
import { RuntimeRateLimiter } from "./runtime_rate_limiter";
import { RuntimeHeartbeatTracker } from "./runtime_heartbeat";
import { RuntimeCheckpointStore } from "./runtime_checkpoint_store";
import { RuntimeAuditLog } from "./runtime_audit_log";
import { RuntimeSimulator } from "./runtime_simulator";
import { CompanyMemoryFlow } from "../../product/company_memory/company_memory_flow";
import { Knowledge2Flow } from "../../knowledge/reality_observation/knowledge2_flow";

export class AlwaysOnRuntime {
  public readonly queue = new RuntimeQueue();
  public readonly policy = new RuntimePolicyManager();
  public readonly rateLimiter = new RuntimeRateLimiter();
  public readonly heartbeat = new RuntimeHeartbeatTracker();
  public readonly checkpoints = new RuntimeCheckpointStore();
  public readonly audit = new RuntimeAuditLog();
  public readonly simulator = new RuntimeSimulator();
  public readonly flow = new CompanyMemoryFlow();
  public readonly k2 = new Knowledge2Flow();

  private _state: RuntimeState = { mode: "manual", running: false, started_at: null, stopped_at: null, tick_count: 0 };
  private worker: RuntimeWorker = { id: "worker_1", status: "stopped", current_job_id: null, jobs_processed: 0, jobs_failed: 0, started_at: new Date().toISOString() };

  get state(): RuntimeState { return { ...this._state }; }
  get workerStatus(): RuntimeWorker { return { ...this.worker }; }

  createRuntime(mode: RuntimeMode = "manual"): void {
    this._state.mode = mode;
    this.audit.record("runtime_created", null, null, `Runtime created in ${mode} mode`);
  }

  start(): void {
    if (this._state.running) return;
    this._state.running = true;
    this._state.started_at = new Date().toISOString();
    this.heartbeat.start();
    this.worker.status = "idle";
    this.audit.record("runtime_started", null, null, "Runtime started");
  }

  stop(): void {
    if (!this._state.running) return;
    this._state.running = false;
    this._state.stopped_at = new Date().toISOString();
    this.heartbeat.stop();
    this.worker.status = "stopped";
    this.audit.record("runtime_stopped", null, null, "Runtime stopped");
  }

  enqueueObservationJob(companyMemoryId: string, capabilities: ConnectorCapability[], priority = 5): RuntimeJob {
    const job = this.queue.enqueue(companyMemoryId, capabilities, priority);
    this.audit.record("job_enqueued", job.id, companyMemoryId, `${capabilities.length} capabilities`);
    return job;
  }

  enqueueCompanyRefresh(companyMemoryId: string): RuntimeJob {
    return this.enqueueObservationJob(companyMemoryId, ["observe_website", "observe_linkedin", "observe_news", "observe_funding"], 3);
  }

  tick(): number {
    if (!this._state.running) return 0;
    this._state.tick_count++;
    this.heartbeat.tick();
    return this.processQueue();
  }

  runOnce(): number { return this.processQueue(); }

  private processQueue(): number {
    let processed = 0;
    while (true) {
      const job = this.queue.dequeue();
      if (!job) break;

      const limiterCheck = this.rateLimiter.canProceed(job.company_memory_id, job.capabilities[0] || "");
      if (!limiterCheck.allowed) {
        this.queue.fail(job.id, limiterCheck.reason || "Rate limited");
        this.heartbeat.recordFailure();
        this.audit.record("rate_limited", job.id, job.company_memory_id, limiterCheck.reason || "Rate limited");
        continue;
      }

      this.worker.current_job_id = job.id;
      this.worker.status = "running";
      this.audit.record("job_started", job.id, job.company_memory_id, "");

      try {
        const result = this.processObservationJob(job);
        if (result.success) {
          this.queue.complete(job.id);
          this.worker.jobs_processed++;
          this.heartbeat.recordSuccess();
          this.checkpoints.update(job.company_memory_id, { last_observed_at: new Date().toISOString() });
          this.audit.record("job_completed", job.id, job.company_memory_id, `${result.signals_found} signals`);
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (e: any) {
        this.queue.fail(job.id, e.message);
        this.worker.jobs_failed++;
        this.heartbeat.recordFailure();
        this.audit.record("job_failed", job.id, job.company_memory_id, e.message);
      }

      this.rateLimiter.recordRun(job.company_memory_id, job.capabilities[0] || "");
      this.worker.current_job_id = null;
      this.worker.status = "idle";
      processed++;
    }
    return processed;
  }

  private processObservationJob(job: RuntimeJob): RuntimeExecutionResult {
    const mem = this.flow.store.get(job.company_memory_id);
    if (!mem) return { success: false, memory_updated: false, decision_updated: false, signals_found: 0, error: "Memory not found" };

    try {
      const result = this.k2.observeAndUpdate(this.flow, job.company_memory_id, mem.company_website);
      return { success: true, memory_updated: result.memory_updated, decision_updated: result.decision_updated, signals_found: result.batch.signal_count, error: null };
    } catch (e: any) {
      return { success: false, memory_updated: false, decision_updated: false, signals_found: 0, error: e.message };
    }
  }

  status(): { state: RuntimeState; heartbeat: ReturnType<typeof RuntimeHeartbeatTracker.prototype.get>; queueSize: number; worker: RuntimeWorker; auditCount: number; checkpointCount: number } {
    return { state: this.state, heartbeat: this.heartbeat.get(), queueSize: this.queue.size(), worker: this.workerStatus, auditCount: this.audit.count(), checkpointCount: this.checkpoints.count() };
  }
}
