// GroIntel CRS-1 — Civilization Conflict Engine
import { ConflictRecord, ConflictType } from "./civilization_types";

export class ConflictEngine {
  private conflicts: Map<string, ConflictRecord> = new Map();

  detect(type: ConflictType, nodeAId: string, nodeBId: string, description: string, evidence: string[], severity: any): ConflictRecord {
    const conflict: ConflictRecord = {
      id: "cf_" + (++ConflictEngine.counter).toString(16).padStart(6, "0"),
      type, node_a_id: nodeAId, node_b_id: nodeBId, description, evidence, severity,
      resolved: false, resolution: null, created_at: new Date().toISOString(),
    };
    this.conflicts.set(conflict.id, conflict);
    return conflict;
  }

  resolve(conflictId: string, resolution: string): ConflictRecord | null {
    const c = this.conflicts.get(conflictId);
    if (!c) return null;
    c.resolved = true;
    c.resolution = resolution;
    return c;
  }

  get(id: string): ConflictRecord | null { return this.conflicts.get(id) || null; }
  getUnresolved(): ConflictRecord[] { return this.getAll().filter(c => !c.resolved); }
  getAll(): ConflictRecord[] { return Array.from(this.conflicts.values()); }
  count(): number { return this.conflicts.size; }

  private static counter = 0;
}
