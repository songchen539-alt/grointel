// GroIntel KNOWLEDGE-1 — Hypothesis Engine (living hypotheses)
import { WorldModelHypothesis, HypothesisStatus } from "./world_model_types";

export class HypothesisEngine {
  private counter = 0;
  private hypotheses: Map<string, WorldModelHypothesis> = new Map();

  create(statement: string, evidence: string[] = []): WorldModelHypothesis {
    const now = new Date().toISOString();
    const h: WorldModelHypothesis = {
      id: "wh_" + (++this.counter).toString(16).padStart(6, "0"), statement, status: "candidate",
      supporting_evidence: evidence, contradicting_evidence: [], confidence: 30, version: 1,
      created_at: now, updated_at: now, history: [{ timestamp: now, change: "Created", status: "candidate", confidence: 30 }],
    };
    this.hypotheses.set(h.id, h);
    return h;
  }

  strengthen(id: string, evidence: string[], confidenceBoost = 15): WorldModelHypothesis | null {
    const h = this.hypotheses.get(id); if (!h) return null;
    const now = new Date().toISOString();
    h.status = "strengthened"; h.supporting_evidence = [...h.supporting_evidence, ...evidence];
    h.confidence = Math.min(100, h.confidence + confidenceBoost); h.version++; h.updated_at = now;
    h.history.push({ timestamp: now, change: "Strengthened", status: "strengthened", confidence: h.confidence });
    return h;
  }

  weaken(id: string, evidence: string[], confidencePenalty = 20): WorldModelHypothesis | null {
    const h = this.hypotheses.get(id); if (!h) return null;
    const now = new Date().toISOString();
    h.status = "weakened"; h.contradicting_evidence = [...h.contradicting_evidence, ...evidence];
    h.confidence = Math.max(0, h.confidence - confidencePenalty); h.version++; h.updated_at = now;
    h.history.push({ timestamp: now, change: "Weakened", status: "weakened", confidence: h.confidence });
    return h;
  }

  validate(id: string): WorldModelHypothesis | null {
    const h = this.hypotheses.get(id); if (!h) return null;
    const now = new Date().toISOString();
    h.status = "validated"; h.confidence = Math.min(100, h.confidence + 25); h.version++; h.updated_at = now;
    h.history.push({ timestamp: now, change: "Validated", status: "validated", confidence: h.confidence });
    return h;
  }

  invalidate(id: string): WorldModelHypothesis | null {
    const h = this.hypotheses.get(id); if (!h) return null;
    const now = new Date().toISOString();
    h.status = "invalidated"; h.confidence = Math.max(0, h.confidence - 40); h.version++; h.updated_at = now;
    h.history.push({ timestamp: now, change: "Invalidated", status: "invalidated", confidence: h.confidence });
    return h;
  }

  merge(intoId: string, fromId: string): WorldModelHypothesis | null {
    const target = this.hypotheses.get(intoId); const source = this.hypotheses.get(fromId);
    if (!target || !source) return null;
    const now = new Date().toISOString();
    target.supporting_evidence = [...new Set([...target.supporting_evidence, ...source.supporting_evidence])];
    target.contradicting_evidence = [...new Set([...target.contradicting_evidence, ...source.contradicting_evidence])];
    target.confidence = Math.round((target.confidence + source.confidence) / 2);
    target.version++; target.updated_at = now;
    target.history.push({ timestamp: now, change: `Merged from ${fromId}`, status: target.status, confidence: target.confidence });
    source.status = "merged";
    source.history.push({ timestamp: now, change: `Merged into ${intoId}`, status: "merged", confidence: source.confidence });
    return target;
  }

  get(id: string): WorldModelHypothesis | null { return this.hypotheses.get(id) || null; }
  getAll(): WorldModelHypothesis[] { return Array.from(this.hypotheses.values()); }
  getActive(): WorldModelHypothesis[] { return this.getAll().filter(h => !["invalidated","merged","retired"].includes(h.status)); }
}
