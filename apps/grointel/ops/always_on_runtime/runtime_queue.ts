// OPS-1 — Runtime Queue (in-memory, priority, dedup)
import { RuntimeJob, JobStatus, ConnectorCapability } from "./always_on_types";

export class RuntimeQueue {
  private jobs: RuntimeJob[] = [];
  private counter = 0;

  enqueue(companyMemoryId: string, capabilities: ConnectorCapability[], priority = 5, maxRetries = 3): RuntimeJob {
    const dedupKey = `${companyMemoryId}_${capabilities.sort().join("_")}`;
    if (this.jobs.some(j => j.dedup_key === dedupKey && j.status === "queued")) {
      throw new Error(`Duplicate job: ${dedupKey}`);
    }
    const job: RuntimeJob = {
      id: "rj_" + (++this.counter).toString(16).padStart(6, "0"),
      company_memory_id: companyMemoryId, capabilities, priority, status: "queued",
      scheduled_at: new Date().toISOString(), started_at: null, completed_at: null,
      retry_count: 0, max_retries: maxRetries, error: null, dedup_key: dedupKey,
    };
    this.jobs.push(job);
    this.jobs.sort((a, b) => b.priority - a.priority || a.scheduled_at.localeCompare(b.scheduled_at));
    return job;
  }

  dequeue(): RuntimeJob | null {
    const idx = this.jobs.findIndex(j => j.status === "queued");
    if (idx < 0) return null;
    const job = this.jobs[idx];
    job.status = "running";
    job.started_at = new Date().toISOString();
    return job;
  }

  complete(jobId: string): void {
    const job = this.jobs.find(j => j.id === jobId);
    if (job) { job.status = "completed"; job.completed_at = new Date().toISOString(); }
  }

  fail(jobId: string, error: string): void {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return;
    if (job.retry_count < job.max_retries) {
      job.status = "retrying"; job.retry_count++; job.error = error;
    } else {
      job.status = "failed"; job.completed_at = new Date().toISOString(); job.error = error;
    }
  }

  retry(jobId: string): void {
    const job = this.jobs.find(j => j.id === jobId);
    if (job && job.status === "failed") {
      job.status = "queued"; job.error = null; job.started_at = null; job.completed_at = null;
    }
  }

  get(id: string): RuntimeJob | null { return this.jobs.find(j => j.id === id) || null; }
  list(): RuntimeJob[] { return this.jobs; }
  size(): number { return this.jobs.filter(j => j.status === "queued" || j.status === "running").length; }
  clear(): void { this.jobs = []; }
  getByCompany(memoryId: string): RuntimeJob[] { return this.jobs.filter(j => j.company_memory_id === memoryId); }
}
