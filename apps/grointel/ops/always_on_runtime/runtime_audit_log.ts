// OPS-1 — Runtime Audit Log
import { RuntimeAuditLogEntry } from "./always_on_types";

export class RuntimeAuditLog {
  private entries: RuntimeAuditLogEntry[] = [];
  private counter = 0;

  record(event: string, jobId: string | null, companyMemoryId: string | null, details: string): RuntimeAuditLogEntry {
    const entry: RuntimeAuditLogEntry = { id: "al_" + (++this.counter).toString(16).padStart(6, "0"), event, job_id: jobId, company_memory_id: companyMemoryId, details, timestamp: new Date().toISOString() };
    this.entries.push(entry);
    return entry;
  }

  getAll(): RuntimeAuditLogEntry[] { return this.entries; }
  getRecent(limit = 10): RuntimeAuditLogEntry[] { return this.entries.slice(-limit).reverse(); }
  findByEvent(event: string): RuntimeAuditLogEntry[] { return this.entries.filter(e => e.event === event); }
  count(): number { return this.entries.length; }
}
