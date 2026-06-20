// OPS-2 — Runtime Repository
import { PersistentStore } from "./persistence_types";

export class RuntimeRepository {
  constructor(private store: PersistentStore) {}

  async saveJob(data: any) { return this.store.insert("runtime_jobs", data); }
  async updateJob(id: string, data: any) { return this.store.update("runtime_jobs", id, data); }
  async listPendingJobs() { return this.store.query("runtime_jobs", { status: "queued" }); }
  async listJobsByStatus(status: string) { return this.store.query("runtime_jobs", { status }); }
  async saveCheckpoint(data: any) { return this.store.upsert("runtime_checkpoints", data, "company_memory_id"); }
  async getCheckpoint(memoryId: string) { return this.store.query("runtime_checkpoints", { company_memory_id: memoryId }); }
  async saveAuditLog(data: any) { return this.store.insert("runtime_audit_logs", data); }
  async listAuditLogs(limit = 50) { return this.store.list("runtime_audit_logs", { limit, order_by: "created_at", order_direction: "desc" }); }
}
