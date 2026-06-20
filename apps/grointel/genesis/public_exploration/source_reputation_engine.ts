// GENESIS-2 — Source Reputation Engine
import { SourceReputation, PublicSource } from "./exploration_types";

export class SourceReputationEngine {
  private reputations: Map<string, SourceReputation> = new Map();

  getOrCreate(sourceId: string, source?: PublicSource): SourceReputation {
    if (this.reputations.has(sourceId)) return this.reputations.get(sourceId)!;
    const rep: SourceReputation = {
      source_id: sourceId,
      accuracy: source?.reliability || 60,
      freshness: source?.freshness || 50,
      consistency: 50, availability: 80,
      historical_usefulness: 50, confidence: 55,
    };
    this.reputations.set(sourceId, rep);
    return rep;
  }

  recordSuccess(sourceId: string): void {
    const r = this.reputations.get(sourceId);
    if (r) { r.accuracy = Math.min(100, r.accuracy + 5); r.consistency = Math.min(100, r.consistency + 3); r.confidence = Math.min(100, r.confidence + 2); }
  }

  recordFailure(sourceId: string): void {
    const r = this.reputations.get(sourceId);
    if (r) { r.accuracy = Math.max(0, r.accuracy - 10); r.availability = Math.max(0, r.availability - 5); r.confidence = Math.max(0, r.confidence - 5); }
  }

  getAll(): SourceReputation[] { return Array.from(this.reputations.values()); }
}
