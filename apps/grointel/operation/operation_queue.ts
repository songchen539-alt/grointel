// OPERATION-1 — Operation Queue (persistent-capable)
import { OperationJob, WorkerType } from "./operation_types";

export class OperationQueue {
  private jobs: OperationJob[] = [];
  private counter = 0;

  enqueue(workerType: WorkerType, payload: Record<string, unknown>, priority = 5, maxAttempts = 3): OperationJob {
    const job: OperationJob = {
      id: "opj_" + (++this.counter).toString(16).padStart(6, "0"),
      worker_type: workerType, payload, priority, status: "pending",
      attempt: 0, max_attempts: maxAttempts,
      created_at: new Date().toISOString(), started_at: null, completed_at: null,
      checkpoint: null, error: null, next_retry: null,
    };
    this.jobs.push(job);
    this.jobs.sort((a, b) => b.priority - a.priority || a.created_at.localeCompare(b.created_at));
    return job;
  }

  dequeue(workerType?: WorkerType): OperationJob | null {
    const idx = this.jobs.findIndex(j => j.status === "pending" && (!workerType || j.worker_type === workerType));
    if (idx < 0) return null;
    const job = this.jobs[idx];
    job.status = "running"; job.attempt++; job.started_at = new Date().toISOString();
    return job;
  }

  complete(jobId: string): void { const j = this.jobs.find(j => j.id === jobId); if (j) { j.status = "completed"; j.completed_at = new Date().toISOString(); } }
  fail(jobId: string, error: string): void {
    const j = this.jobs.find(j => j.id === jobId); if (!j) return;
    if (j.attempt < j.max_attempts) { j.status = "pending"; j.error = error; j.next_retry = new Date(Date.now() + 30000).toISOString(); }
    else { j.status = "failed"; j.error = error; j.completed_at = new Date().toISOString(); }
  }

  get(id: string): OperationJob | null { return this.jobs.find(j => j.id === id) || null; }
  list(): OperationJob[] { return this.jobs; }
  size(): number { return this.jobs.filter(j => j.status === "pending" || j.status === "running").length; }
  getByStatus(status: string): OperationJob[] { return this.jobs.filter(j => j.status === status); }
}
