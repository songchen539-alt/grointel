// OPS-2 — Connector Repository
import { PersistentStore } from "./persistence_types";

export class ConnectorRepository {
  constructor(private store: PersistentStore) {}
  async saveHealth(data: any) { return this.store.upsert("connector_health_states", data, "connector_name"); }
  async getHealth(name: string) { return this.store.query("connector_health_states", { connector_name: name }); }
  async listHealth() { return this.store.list("connector_health_states"); }
  async saveStatistics(data: any) { return this.store.upsert("connector_statistics", data, "connector_name"); }
  async getStatistics(name: string) { return this.store.query("connector_statistics", { connector_name: name }); }
}
