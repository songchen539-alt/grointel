// GroIntel Cognitive Kernel — Memory
import { MemoryRecord, MemoryOperation, EventType } from "./kernel_types";

export class KernelMemory {
  private records: Map<string, MemoryRecord> = new Map();
  private entityIndex: Map<string, string[]> = new Map();
  private eventIndex: Map<EventType, string[]> = new Map();
  private versionCount: Map<string, number> = new Map();
  private totalWrites: number = 0;

  async store(record: MemoryRecord): Promise<void> {
    const key = record.id;
    const version = (this.versionCount.get(key) || 0) + 1;
    record.version = version;
    this.versionCount.set(key, version);
    this.records.set(key, record);

    // Index by entity
    if (record.entity_id) {
      if (!this.entityIndex.has(record.entity_id)) {
        this.entityIndex.set(record.entity_id, []);
      }
      this.entityIndex.get(record.entity_id)!.push(key);
    }

    // Index by event type
    if (!this.eventIndex.has(record.event_type)) {
      this.eventIndex.set(record.event_type, []);
    }
    this.eventIndex.get(record.event_type)!.push(key);

    this.totalWrites++;
  }

  get(id: string): MemoryRecord | null {
    return this.records.get(id) || null;
  }

  getByEntity(entityId: string): MemoryRecord[] {
    const keys = this.entityIndex.get(entityId) || [];
    return keys.map(k => this.records.get(k)).filter(Boolean) as MemoryRecord[];
  }

  getByEventType(eventType: EventType): MemoryRecord[] {
    const keys = this.eventIndex.get(eventType) || [];
    return keys.map(k => this.records.get(k)).filter(Boolean) as MemoryRecord[];
  }

  getTotalWrites(): number {
    return this.totalWrites;
  }

  getRecordCount(): number {
    return this.records.size;
  }

  search(query: Partial<MemoryRecord>): MemoryRecord[] {
    const results: MemoryRecord[] = [];
    for (const record of this.records.values()) {
      let match = true;
      if (query.entity_id && record.entity_id !== query.entity_id) match = false;
      if (query.event_type && record.event_type !== query.event_type) match = false;
      if (query.operation && record.operation !== query.operation) match = false;
      if (match) results.push(record);
    }
    return results;
  }

  clear(): void {
    this.records.clear();
    this.entityIndex.clear();
    this.eventIndex.clear();
    this.versionCount.clear();
    this.totalWrites = 0;
  }
}
