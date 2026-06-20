// GroIntel PGIR-1 — Prediction Updater (living predictions)
import { LivingPrediction } from "./perpetual_types";
import { LivingWorldModel } from "./living_world_model";

export class PredictionUpdater {
  private counter = 0;

  create(model: LivingWorldModel, entityId: string, statement: string, probability: number, confidence: number, assumptions: string[] = []): LivingPrediction {
    const now = new Date().toISOString();
    const p: LivingPrediction = {
      id: "lp_" + (++this.counter).toString(16).padStart(6, "0"),
      entity_id: entityId, statement, probability: Math.round(probability), confidence, assumptions,
      status: "active", created_at: now, updated_at: now, last_verified: now,
      history: [{ timestamp: now, confidence, probability: Math.round(probability) }],
    };
    model.addPrediction(p);
    return p;
  }

  recalculate(model: LivingWorldModel, entityId: string, newConfidence: number, newProbability: number): LivingPrediction[] {
    const updated: LivingPrediction[] = [];
    for (const p of model.getActivePredictions().filter(p => p.entity_id === entityId)) {
      const now = new Date().toISOString();
      p.confidence = (p.confidence * p.history.length + newConfidence) / (p.history.length + 1);
      p.probability = Math.round((p.probability * p.history.length + newProbability) / (p.history.length + 1));
      p.updated_at = now; p.last_verified = now;
      p.history.push({ timestamp: now, confidence: p.confidence, probability: p.probability });
      updated.push(p);
    }
    return updated;
  }

  invalidate(model: LivingWorldModel, entityId: string, reason: string): LivingPrediction[] {
    const invalidated: LivingPrediction[] = [];
    for (const p of model.getActivePredictions().filter(p => p.entity_id === entityId)) {
      p.status = "invalidated"; p.updated_at = new Date().toISOString();
      p.history.push({ timestamp: new Date().toISOString(), confidence: p.confidence, probability: p.probability });
      invalidated.push(p);
    }
    return invalidated;
  }
}
