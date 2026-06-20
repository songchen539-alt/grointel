// OPS-2 — Observation Repository
import { PersistentStore } from "./persistence_types";

export class ObservationRepository {
  constructor(private store: PersistentStore) {}
  async saveSession(data: any) { return this.store.insert("observation_sessions", data); }
  async getSession(id: string) { return this.store.getById("observation_sessions", id); }
  async listSessions(memoryId: string) { return this.store.query("observation_sessions", { company_memory_id: memoryId }); }
}
