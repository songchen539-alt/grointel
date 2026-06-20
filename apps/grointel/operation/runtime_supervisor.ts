// OPERATION-1 — Runtime Supervisor
import { WorkerServiceBase } from "./workers/worker_base";
import { RealityWorker, KnowledgeWorker, DecisionWorker, LifeWorker } from "./workers/worker_types";
import { OperationQueue } from "./operation_queue";
import { OperationJob, WorkerService, OperationHealth, OperationEvent, OperationDashboard, ComponentState } from "./operation_types";

export class RuntimeSupervisor {
  public readonly workers: Map<string, WorkerServiceBase> = new Map();
  public readonly queue = new OperationQueue();
  private events: OperationEvent[] = [];
  private counter = 0;
  private startedAt = new Date().toISOString();

  constructor() { this.initWorkers(); }

  private initWorkers(): void {
    const ws = [new RealityWorker(), new KnowledgeWorker(), new DecisionWorker(), new LifeWorker()];
    for (const w of ws) { w.start(); this.workers.set(w.id, w); }
  }

  getWorkers(): WorkerService[] { return Array.from(this.workers.values()).map(w => w.getInfo()); }

  dispatchJob(job: OperationJob): void {
    const worker = Array.from(this.workers.values()).find(w => w.type === job.worker_type && w.status === "idle");
    if (!worker) { this.queue.enqueue(job.worker_type, job.payload, job.priority); return; }
    worker.execute(JSON.stringify(job.payload).substring(0, 50));
    setTimeout(() => {
      worker.complete();
      this.queue.complete(job.id);
      this.recordEvent("job_completed", worker.id, `Job ${job.id} completed`);
    }, 100);
  }

  processNext(workerType?: string): OperationJob | null {
    const job = this.queue.dequeue(workerType as any);
    if (job) this.dispatchJob(job);
    return job;
  }

  tick(): number {
    let processed = 0;
    // Process queue
    for (const w of this.workers.values()) {
      if (w.status === "idle") {
        const job = this.queue.dequeue(w.type);
        if (job) { this.dispatchJob(job); processed++; }
      }
    }

    // Heartbeat all
    for (const w of this.workers.values()) w.heartbeat();

    // Check for failed workers
    for (const w of this.workers.values()) {
      if (w.status === "failed" && w.errors > 5) {
        w.restarts++;
        w.start();
        this.recordEvent("worker_recovered", w.id, `Worker ${w.type} restarted`);
      }
    }

    return processed;
  }

  recordEvent(type: string, workerId: string, details: string): OperationEvent {
    const ev: OperationEvent = { id: "ope_" + (++this.counter).toString(16).padStart(6, "0"), type, worker_id: workerId, details, timestamp: new Date().toISOString() };
    this.events.push(ev); return ev;
  }

  health(): OperationHealth {
    const workers = this.getWorkers();
    const failed = workers.filter(w => w.status === "failed").length;
    const status: ComponentState = failed > 1 ? "degraded" : failed > 3 ? "critical" : "healthy";
    return {
      status, uptime_hours: (Date.now() - new Date(this.startedAt).getTime()) / 3600000,
      workers_active: workers.filter(w => w.status === "idle" || w.status === "running").length,
      workers_failed: failed, queue_depth: this.queue.size(),
      jobs_per_minute: workers.reduce((s, w) => s + w.tasks_completed, 0) / Math.max(1, (Date.now() - new Date(this.startedAt).getTime()) / 60000),
      avg_latency_ms: 50, last_incident: null,
    };
  }

  dashboard(): OperationDashboard {
    return {
      workers: this.getWorkers(), health: this.health(),
      queue: { pending: this.queue.getByStatus("pending").length, running: this.queue.getByStatus("running").length, completed: this.queue.getByStatus("completed").length, failed: this.queue.getByStatus("failed").length },
      events: this.events.slice(-20),
    };
  }

  recover(): void {
    for (const w of this.workers.values()) {
      if (w.status === "failed" || w.status === "stopped") {
        w.restarts++; w.start();
        this.recordEvent("worker_recovered", w.id, `Worker ${w.type} manually recovered`);
      }
    }
  }
}
