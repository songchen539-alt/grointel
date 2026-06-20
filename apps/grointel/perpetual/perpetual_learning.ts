// GroIntel PGIR-1 — Perpetual Learning (immediate)
import { LivingWorldModel } from "./living_world_model";
import { EntityUpdater } from "./entity_updater";

export class PerpetualLearning {
  learnFromObservation(model: LivingWorldModel, entityId: string, observationConfidence: number, eu: EntityUpdater): { insight: string; confidenceDelta: number } {
    const entity = model.getEntity(entityId);
    if (!entity) return { insight: "Entity not found", confidenceDelta: 0 };

    const delta = Math.round((observationConfidence - entity.confidence) / 2);
    return { insight: `Learned from observation of ${entity.canonical_name}`, confidenceDelta: delta };
  }

  learnFromValidation(model: LivingWorldModel, entityId: string, validatedConfidence: number): number {
    const entity = model.getEntity(entityId);
    if (!entity) return 0;
    entity.confidence = (entity.confidence + validatedConfidence) / 2;
    entity.last_verified = new Date().toISOString();
    return entity.confidence;
  }
}
