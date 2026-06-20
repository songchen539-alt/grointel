// LIFE-1 — Hypothesis Manager
import { Hypothesis, HypothesisStatus } from "./life_types";

export class HypothesisManager {
  private counter = 0;
  private hypotheses: Map<string, Hypothesis> = new Map();

  propose(statement: string, reason: string, entities: string[]): Hypothesis {
    const now = new Date().toISOString();
    const h: Hypothesis = {
      id: "hyp_" + (++this.counter).toString(16).padStart(6, "0"),
      statement, status: "proposed", confidence: 30, evidence: [],
      related_entities: entities, creation_reason: reason,
      validation_history: [{ timestamp: now, status: "proposed", evidence_count: 0, confidence: 30 }],
      created_at: now, updated_at: now,
    };
    this.hypotheses.set(h.id, h);
    return h;
  }

  addEvidence(id: string, evidenceItem: string, confidenceBoost = 10): Hypothesis | null {
    const h = this.hypotheses.get(id); if (!h) return null;
    h.evidence = [...h.evidence, evidenceItem];
    h.status = h.evidence.length >= 3 ? "supported" : "collecting_evidence";
    h.confidence = Math.min(100, h.confidence + confidenceBoost);
    h.updated_at = new Date().toISOString();
    h.validation_history.push({ timestamp: h.updated_at, status: h.status, evidence_count: h.evidence.length, confidence: h.confidence });
    return h;
  }

  reject(id: string, reason: string): Hypothesis | null {
    const h = this.hypotheses.get(id); if (!h) return null;
    h.status = "rejected"; h.confidence = Math.max(0, h.confidence - 30);
    h.updated_at = new Date().toISOString();
    h.validation_history.push({ timestamp: h.updated_at, status: "rejected", evidence_count: h.evidence.length, confidence: h.confidence });
    return h;
  }

  archive(id: string): Hypothesis | null {
    const h = this.hypotheses.get(id); if (!h) return null;
    h.status = "archived"; h.updated_at = new Date().toISOString();
    return h;
  }

  get(id: string): Hypothesis | null { return this.hypotheses.get(id) || null; }
  getAll(): Hypothesis[] { return Array.from(this.hypotheses.values()); }
  getActive(): Hypothesis[] { return this.getAll().filter(h => h.status !== "archived" && h.status !== "rejected"); }
}
