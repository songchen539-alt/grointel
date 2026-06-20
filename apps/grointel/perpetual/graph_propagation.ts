// GroIntel PGIR-1 — Graph Propagation (incremental only)
import { LivingWorldModel } from "./living_world_model";
import { EntityUpdater } from "./entity_updater";
import { RelationshipUpdater } from "./relationship_updater";
import { PredictionUpdater } from "./prediction_updater";
import { RecommendationUpdater } from "./recommendation_updater";

export class GraphPropagation {
  propagateEntityUpdate(model: LivingWorldModel, entityId: string, entityUpdater: EntityUpdater, relUpdater: RelationshipUpdater, predUpdater: PredictionUpdater, recUpdater: RecommendationUpdater): number {
    let updates = 0;
    const entity = model.getEntity(entityId);
    if (!entity) return 0;

    // Propagate to relationships
    const rels = model.getRelationshipsFor(entityId);
    for (const rel of rels) {
      relUpdater.updateOrCreate(model, rel.source_id, rel.target_id, rel.type, rel.confidence, rel.evidence);
      updates++;
    }

    // Propagate to predictions
    const updatedPreds = predUpdater.recalculate(model, entityId, entity.confidence, 50);
    updates += updatedPreds.length;

    // Propagate to recommendations
    const updatedRecs = recUpdater.recalculate(model, entityId, [`Entity ${entityId} updated`], entity.confidence);
    updates += updatedRecs.length;

    return updates;
  }

  propagateAll(model: LivingWorldModel, eu: EntityUpdater, ru: RelationshipUpdater, pu: PredictionUpdater, recu: RecommendationUpdater): number {
    let total = 0;
    for (const e of model.getAllEntities()) {
      total += this.propagateEntityUpdate(model, e.id, eu, ru, pu, recu);
    }
    return total;
  }
}
