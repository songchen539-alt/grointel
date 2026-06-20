// GroIntel OPS-2 — In-Memory Persistence Client (for tests / dev)
import { PersistentStore, PersistenceResult, PersistenceQuery, StoreStatus } from "./persistence_types";

export class InMemoryPersistenceClient {
  private stores: Map<string, Map<string, Record<string, unknown>>> = new Map();
  private counters: Map<string, number> = new Map();
  private status: StoreStatus = { mode: "in_memory", health: "healthy", last_write_test: null, tables: {} };

  private getStore(table: string): Map<string, Record<string, unknown>> {
    if (!this.stores.has(table)) this.stores.set(table, new Map());
    return this.stores.get(table)!;
  }

  async insert(table: string, data: Record<string, unknown>): Promise<PersistenceResult<Record<string, unknown>>> {
    const store = this.getStore(table);
    const id = data.id as string || (table + "_" + ((this.counters.get(table) || 0) + 1));
    this.counters.set(table, (this.counters.get(table) || 0) + 1);
    const record = { ...data, id };
    store.set(id, record);
    return { success: true, data: record, error: null, row_count: 1 };
  }

  async update(table: string, id: string, data: Record<string, unknown>): Promise<PersistenceResult<Record<string, unknown>>> {
    const store = this.getStore(table);
    const existing = store.get(id);
    if (!existing) return { success: false, data: null, error: "Not found" };
    const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
    store.set(id, updated);
    return { success: true, data: updated, error: null, row_count: 1 };
  }

  async upsert(table: string, data: Record<string, unknown>, conflictKey: string): Promise<PersistenceResult<Record<string, unknown>>> {
    const store = this.getStore(table);
    const existing = Array.from(store.values()).find(r => r[conflictKey] === data[conflictKey]);
    if (existing) {
      return this.update(table, existing.id as string, data);
    }
    return this.insert(table, data);
  }

  async getById(table: string, id: string): Promise<PersistenceResult<Record<string, unknown>>> {
    const store = this.getStore(table);
    const data = store.get(id) || null;
    return { success: data !== null, data, error: data ? null : "Not found" };
  }

  async list(table: string, query?: PersistenceQuery): Promise<PersistenceResult<Record<string, unknown>[]>> {
    let items = Array.from(this.getStore(table).values());
    if (query?.filters) {
      for (const [key, val] of Object.entries(query.filters)) {
        items = items.filter(i => i[key] === val);
      }
    }
    if (query?.order_by) {
      items.sort((a, b) => {
        const av = a[query.order_by!] as string || "";
        const bv = b[query.order_by!] as string || "";
        return query.order_direction === "desc" ? bv.localeCompare(av) : av.localeCompare(bv);
      });
    }
    if (query?.offset) items = items.slice(query.offset);
    if (query?.limit) items = items.slice(0, query.limit);
    return { success: true, data: items, error: null, row_count: items.length };
  }

  async query(table: string, conditions: Record<string, unknown>): Promise<PersistenceResult<Record<string, unknown>[]>> {
    const items = Array.from(this.getStore(table).values()).filter(item => {
      for (const [key, val] of Object.entries(conditions)) {
        if (item[key] !== val) return false;
      }
      return true;
    });
    return { success: true, data: items, error: null, row_count: items.length };
  }

  async delete(table: string, id: string): Promise<PersistenceResult<boolean>> {
    return { success: this.getStore(table).delete(id), data: true, error: null };
  }

  getStatus(): StoreStatus {
    const tables: Record<string, { row_count: number; last_access: string | null }> = {};
    for (const [name, store] of this.stores) {
      tables[name] = { row_count: store.size, last_access: null };
    }
    return { ...this.status, tables };
  }
}
