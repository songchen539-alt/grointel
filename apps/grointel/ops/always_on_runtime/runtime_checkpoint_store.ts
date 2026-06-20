// OPS-1 — Runtime Checkpoint Store
import { RuntimeCheckpoint } from "./always_on_types";

export class RuntimeCheckpointStore {
  private checkpoints: Map<string, RuntimeCheckpoint> = new Map();

  getOrCreate(companyMemoryId: string): RuntimeCheckpoint {
    if (!this.checkpoints.has(companyMemoryId)) {
      this.checkpoints.set(companyMemoryId, { company_memory_id: companyMemoryId, last_observed_at: null, last_connector_run_at: null, last_signal_hash: "", last_decision_update_at: null, last_workspace_update_at: null });
    }
    return this.checkpoints.get(companyMemoryId)!;
  }

  update(companyMemoryId: string, data: Partial<RuntimeCheckpoint>): void {
    const cp = this.getOrCreate(companyMemoryId);
    Object.assign(cp, data);
  }

  getAll(): RuntimeCheckpoint[] { return Array.from(this.checkpoints.values()); }
  count(): number { return this.checkpoints.size; }
}
