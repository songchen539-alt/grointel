// OPS-2 — Persistent Store Factory
import { InMemoryPersistenceClient } from "./supabase_persistence_client";
import { CompanyMemoryRepository } from "./company_memory_repository";
import { RuntimeRepository } from "./runtime_repository";
import { ObservationRepository } from "./observation_repository";
import { ConnectorRepository } from "./connector_repository";

export class PersistentStoreFactory {
  private static inMemory = new InMemoryPersistenceClient();

  static createMemoryRepo(): CompanyMemoryRepository { return new CompanyMemoryRepository(this.inMemory as any); }
  static createRuntimeRepo(): RuntimeRepository { return new RuntimeRepository(this.inMemory as any); }
  static createObservationRepo(): ObservationRepository { return new ObservationRepository(this.inMemory as any); }
  static createConnectorRepo(): ConnectorRepository { return new ConnectorRepository(this.inMemory as any); }
  static getClient(): InMemoryPersistenceClient { return this.inMemory; }
  static reset(): void { this.inMemory = new InMemoryPersistenceClient(); }
}
