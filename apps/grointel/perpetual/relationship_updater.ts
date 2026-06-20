// GroIntel PGIR-1 — Relationship Updater
import { LivingRelationship, RelationshipType } from "./perpetual_types";
import { LivingWorldModel } from "./living_world_model";

export class RelationshipUpdater {
  private counter = 0;

  updateOrCreate(model: LivingWorldModel, sourceId: string, targetId: string, type: RelationshipType, confidence = 60, evidence: string[] = []): LivingRelationship {
    const existing = this.findExisting(model, sourceId, targetId, type);
    if (existing) return this.update(existing, confidence, evidence);
    return this.create(model, sourceId, targetId, type, confidence, evidence);
  }

  private create(model: LivingWorldModel, s: string, t: string, type: RelationshipType, conf: number, evidence: string[]): LivingRelationship {
    const now = new Date().toISOString();
    const r: LivingRelationship = {
      id: "lr_" + (++this.counter).toString(16).padStart(6, "0"),
      source_id: s, target_id: t, type, confidence: conf, version: 1, evidence,
      created_at: now, updated_at: now, last_verified: now,
      history: [{ timestamp: now, change: "Created", confidence: conf }],
    };
    model.addRelationship(r);
    return r;
  }

  private update(rel: LivingRelationship, confidence: number, evidence: string[]): LivingRelationship {
    const now = new Date().toISOString();
    rel.confidence = (rel.confidence * rel.version + confidence) / (rel.version + 1);
    rel.version++;
    rel.evidence = [...rel.evidence, ...evidence];
    rel.updated_at = now; rel.last_verified = now;
    rel.history.push({ timestamp: now, change: "Updated", confidence: rel.confidence });
    return rel;
  }

  private findExisting(model: LivingWorldModel, s: string, t: string, type: RelationshipType): LivingRelationship | null {
    return model.getAllRelationships().find(r => r.source_id === s && r.target_id === t && r.type === type) || null;
  }
}
