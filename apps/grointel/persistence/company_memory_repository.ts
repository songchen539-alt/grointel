// OPS-2 — Company Memory Repository
import { PersistentStore } from "./persistence_types";

export class CompanyMemoryRepository {
  constructor(private store: PersistentStore) {}

  async saveMemory(data: any) { return this.store.upsert("company_memories", data, "company_website"); }
  async getMemory(id: string) { return this.store.getById("company_memories", id); }
  async listMemories() { return this.store.list("company_memories"); }
  async saveSnapshot(data: any) { return this.store.insert("company_reality_snapshots", data); }
  async listSnapshots(memoryId: string) { return this.store.query("company_reality_snapshots", { company_memory_id: memoryId }); }
  async saveDecision(data: any) { return this.store.insert("growth_decision_memories", data); }
  async listDecisions(memoryId: string) { return this.store.query("growth_decision_memories", { company_memory_id: memoryId }); }
  async saveConfidence(data: any) { return this.store.insert("decision_confidence_history", data); }
  async saveEvent(data: any) { return this.store.insert("company_memory_events", data); }
  async listEvents(memoryId: string) { return this.store.query("company_memory_events", { company_memory_id: memoryId }); }
}
