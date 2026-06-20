// GroIntel ROS-4 — Knowledge Relationship Runtime (12 types)
import { KnowledgeRelationship, RelationshipType } from "./knowledge_types";

let rCounter = 0;
function genId(): string { return "kr_" + (++rCounter).toString(16).padStart(6, "0"); }
export const RELATIONSHIP_TYPES: RelationshipType[] = ["causes", "supports", "contradicts", "depends_on", "belongs_to", "competes_with", "collaborates_with", "located_in", "derived_from", "predicts", "requires", "enables"];

export class KnowledgeRelationshipManager {
  private relationships: Map<string, KnowledgeRelationship> = new Map();

  create(sourceId: string, targetId: string, type: RelationshipType, confidence = 70, evidence: string[] = []): KnowledgeRelationship {
    const rel: KnowledgeRelationship = {
      id: genId(), source_id: sourceId, target_id: targetId, type, confidence, evidence, metadata: {}, created_at: new Date().toISOString(),
    };
    this.relationships.set(rel.id, rel);
    return rel;
  }

  get(id: string): KnowledgeRelationship | null { return this.relationships.get(id) || null; }
  getAll(): KnowledgeRelationship[] { return Array.from(this.relationships.values()); }

  findByEntity(entityId: string): KnowledgeRelationship[] {
    return this.getAll().filter(r => r.source_id === entityId || r.target_id === entityId);
  }

  findByType(type: RelationshipType): KnowledgeRelationship[] {
    return this.getAll().filter(r => r.type === type);
  }

  getTypes(): RelationshipType[] { return RELATIONSHIP_TYPES; }
  count(): number { return this.relationships.size; }
}
