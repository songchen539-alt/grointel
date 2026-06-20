// GroIntel OPS-2 — Persistence Types
export type StoreMode = "in_memory" | "supabase";
export type StoreHealth = "healthy" | "degraded" | "unreachable";

export interface PersistentStore<T = Record<string, unknown>> {
  insert(table: string, data: Record<string, unknown>): Promise<PersistenceResult<T>>;
  update(table: string, id: string, data: Record<string, unknown>): Promise<PersistenceResult<T>>;
  upsert(table: string, data: Record<string, unknown>, conflictKey: string): Promise<PersistenceResult<T>>;
  getById(table: string, id: string): Promise<PersistenceResult<T>>;
  list(table: string, query?: PersistenceQuery): Promise<PersistenceResult<T[]>>;
  query(table: string, conditions: Record<string, unknown>): Promise<PersistenceResult<T[]>>;
  delete(table: string, id: string): Promise<PersistenceResult<boolean>>;
}

export interface PersistenceResult<T = unknown> {
  success: boolean; data: T | null; error: string | null; row_count?: number;
}

export interface PersistenceQuery {
  filters?: Record<string, unknown>; order_by?: string; order_direction?: "asc" | "desc";
  limit?: number; offset?: number;
}

export interface PersistenceTransaction {
  id: string; started_at: string; operations: number; status: "open" | "committed" | "rolled_back";
}

export interface StoreStatus {
  mode: StoreMode; health: StoreHealth; last_write_test: string | null;
  tables: Record<string, { row_count: number; last_access: string | null }>;
}
