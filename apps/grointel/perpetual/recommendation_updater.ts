// GroIntel PGIR-1 — Recommendation Updater
import { LivingRecommendation } from "./perpetual_types";
import { LivingWorldModel } from "./living_world_model";

export class RecommendationUpdater {
  private counter = 0;

  create(model: LivingWorldModel, targetEntity: string, recommendation: string, rank: number, evidence: string[], confidence: number): LivingRecommendation {
    const now = new Date().toISOString();
    const r: LivingRecommendation = {
      id: "lrec_" + (++this.counter).toString(16).padStart(6, "0"),
      target_entity: targetEntity, recommendation, rank, evidence, confidence, version: 1,
      created_at: now, updated_at: now, last_verified: now,
      history: [{ timestamp: now, rank, confidence }],
    };
    model.addRecommendation(r);
    return r;
  }

  recalculate(model: LivingWorldModel, targetEntity: string, newEvidence: string[], newConfidence: number): LivingRecommendation[] {
    const recs = model.getAllRecommendations().filter(r => r.target_entity === targetEntity);
    for (const r of recs) {
      const now = new Date().toISOString();
      r.confidence = (r.confidence * r.version + newConfidence) / (r.version + 1);
      r.evidence = [...r.evidence, ...newEvidence];
      r.version++;
      r.updated_at = now; r.last_verified = now;
      r.history.push({ timestamp: now, rank: r.rank, confidence: r.confidence });
    }
    // Re-rank
    recs.sort((a, b) => b.confidence - a.confidence);
    recs.forEach((r, i) => r.rank = i + 1);
    return recs;
  }
}
