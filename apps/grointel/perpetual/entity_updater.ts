// GroIntel PGIR-1 — Entity Updater (continuously evolves entities)
import { LivingEntity, EntityType } from "./perpetual_types";
import { LivingWorldModel } from "./living_world_model";

export class EntityUpdater {
  private counter = 0;

  updateOrCreate(model: LivingWorldModel, canonicalName: string, type: EntityType, attrs: Record<string, unknown>, confidence = 60): LivingEntity {
    // Check for existing by canonical name
    const existing = model.getAllEntities().find(e => e.canonical_name === canonicalName);
    if (existing) {
      return this.update(existing, attrs, confidence);
    }
    return this.create(model, canonicalName, type, attrs, confidence);
  }

  private create(model: LivingWorldModel, name: string, type: EntityType, attrs: Record<string, unknown>, confidence: number): LivingEntity {
    const now = new Date().toISOString();
    const e: LivingEntity = {
      id: "le_" + (++this.counter).toString(16).padStart(6, "0"),
      type, canonical_name: name, aliases: [],
      attributes: attrs, confidence, version: 1, source_count: 1, evidence_count: 1,
      activity_score: 50, created_at: now, updated_at: now, last_verified: now,
      history: [{ timestamp: now, change: "Created", confidence }],
    };
    model.addEntity(e);
    return e;
  }

  private update(entity: LivingEntity, attrs: Record<string, unknown>, confidence: number): LivingEntity {
    const now = new Date().toISOString();
    entity.attributes = { ...entity.attributes, ...attrs };
    entity.confidence = (entity.confidence * entity.version + confidence) / (entity.version + 1);
    entity.version++;
    entity.source_count++;
    entity.evidence_count++;
    entity.activity_score = Math.min(100, entity.activity_score + 5);
    entity.updated_at = now;
    entity.last_verified = now;
    entity.history.push({ timestamp: now, change: "Updated", confidence: entity.confidence });
    return entity;
  }
}
