// LIFE-1 — Evidence Accumulator
import { Evidence, Hypothesis } from "./life_types";

export class EvidenceAccumulator {
  private counter = 0;
  private evidences: Evidence[] = [];

  add(hypothesisId: string, source: string, signalType: string, content: string, confidence: number): Evidence {
    const ev: Evidence = { id: "evd_" + (++this.counter).toString(16).padStart(6, "0"), hypothesis_id: hypothesisId, source, signal_type: signalType, content, confidence, timestamp: new Date().toISOString() };
    this.evidences.push(ev);
    return ev;
  }

  getByHypothesis(hypothesisId: string): Evidence[] { return this.evidences.filter(e => e.hypothesis_id === hypothesisId); }
  getAll(): Evidence[] { return this.evidences; }
  count(): number { return this.evidences.length; }
  getAggregatedConfidence(hypothesisId: string): number {
    const items = this.getByHypothesis(hypothesisId);
    if (items.length === 0) return 0;
    return Math.round(items.reduce((s, e) => s + e.confidence, 0) / items.length);
  }
}
