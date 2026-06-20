// GroIntel ROS-4 — Knowledge Entity Manager
import { KnowledgeEntity } from "./knowledge_types";

let eCounter = 0;
function genId(): string { return "ke_" + (++eCounter).toString(16).padStart(6, "0"); }

export class KnowledgeEntityManager {
  create(type: string, canonicalName: string, domain: string, description: string, aliases: string[] = [], attributes: Record<string, unknown> = {}): KnowledgeEntity {
    const now = new Date().toISOString();
    return { id: genId(), type, canonical_name: canonicalName, aliases, domain, description, attributes, confidence: 50, created_at: now, updated_at: now };
  }

  update(entity: KnowledgeEntity, updates: Partial<KnowledgeEntity>): KnowledgeEntity {
    return { ...entity, ...updates, updated_at: new Date().toISOString() };
  }
}
