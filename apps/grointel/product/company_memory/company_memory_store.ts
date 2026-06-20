// GroIntel PRODUCT-2 — Company Memory Store (in-memory)
import { CompanyMemory, CompanyProfile, CompanyRealitySnapshot, DecisionMemory, MemoryUpdateEvent } from "./company_memory_types";

export class CompanyMemoryStore {
  private memories: Map<string, CompanyMemory> = new Map();
  private counter = 0;

  create(website: string, name: string, profile: CompanyProfile, snapshot: CompanyRealitySnapshot): CompanyMemory {
    const now = new Date().toISOString();
    const id = "cm_" + (++this.counter).toString(16).padStart(6, "0");
    const mem: CompanyMemory = {
      id, company_website: website, company_name: name, created_at: now, updated_at: now,
      current_profile: profile, current_snapshot: snapshot,
      decisions: [], timeline: [], decision_count: 0, update_count: 0,
    };
    this.appendEvent(mem, { event_id: "evt_" + (++this.counter).toString(16).padStart(6, "0"), type: "created", details: `Company memory created for ${name}`, snapshot_id: snapshot.snapshot_id, timestamp: now });
    this.memories.set(id, mem);
    return mem;
  }

  get(id: string): CompanyMemory | null { return this.memories.get(id) || null; }
  getAll(): CompanyMemory[] { return Array.from(this.memories.values()); }
  exists(id: string): boolean { return this.memories.has(id); }

  updateProfile(mem: CompanyMemory, profile: CompanyProfile): void {
    mem.current_profile = profile; mem.updated_at = new Date().toISOString();
    this.appendEvent(mem, { event_id: "evt_" + (++this.counter).toString(16).padStart(6, "0"), type: "profile_updated", details: `Profile updated: ${profile.industry}, ${profile.region}`, snapshot_id: null, timestamp: mem.updated_at });
  }

  appendSnapshot(mem: CompanyMemory, snapshot: CompanyRealitySnapshot): void {
    mem.current_snapshot = snapshot; mem.updated_at = new Date().toISOString();
    this.appendEvent(mem, { event_id: "evt_" + (++this.counter).toString(16).padStart(6, "0"), type: "snapshot_added", details: `Reality snapshot ${snapshot.snapshot_id} added`, snapshot_id: snapshot.snapshot_id, timestamp: mem.updated_at });
  }

  appendDecision(mem: CompanyMemory, decision: DecisionMemory): void {
    mem.decisions.push(decision); mem.decision_count++; mem.updated_at = new Date().toISOString();
    this.appendEvent(mem, { event_id: "evt_" + (++this.counter).toString(16).padStart(6, "0"), type: "decision_added", details: `Decision ${decision.decision_id} added`, snapshot_id: decision.snapshot_id, timestamp: mem.updated_at });
  }

  appendEvent(mem: CompanyMemory, event: MemoryUpdateEvent): void {
    mem.timeline.push(event); mem.update_count = mem.timeline.length;
  }

  getByWebsite(website: string): CompanyMemory | null {
    return this.getAll().find(m => m.company_website === website) || null;
  }

  count(): number { return this.memories.size; }
}
