// EVOLUTION-1 — Wisdom Engine
import { WisdomEntry } from "./evolution_types";

export class WisdomEngine {
  private entries: WisdomEntry[] = [];
  private counter = 0;

  add(statement: string, domain: string, confidence: number, evidenceCount: number, crossDomain: boolean): WisdomEntry {
    const now = new Date().toISOString();
    const entry: WisdomEntry = { id: "wis_" + (++this.counter).toString(16).padStart(6, "0"), statement, domain, confidence, evidence_count: evidenceCount, first_observed: now, last_validated: now, cross_domain: crossDomain };
    this.entries.push(entry);
    return entry;
  }

  getByDomain(domain: string): WisdomEntry[] { return this.entries.filter(e => e.domain === domain); }
  getHighConfidence(minConf = 80): WisdomEntry[] { return this.entries.filter(e => e.confidence >= minConf); }
  getAll(): WisdomEntry[] { return this.entries; }
  count(): number { return this.entries.length; }
}
