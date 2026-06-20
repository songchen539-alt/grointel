// GroIntel ROS-4 — Knowledge Registry
import { KnowledgeEntity } from "./knowledge_types";

export class KnowledgeRegistry {
  private entities: Map<string, KnowledgeEntity> = new Map();
  private entityByAlias: Map<string, string> = new Map();

  register(entity: KnowledgeEntity): void {
    if (this.entities.has(entity.id)) throw new Error(`Entity '${entity.id}' already registered`);
    this.entities.set(entity.id, entity);
    for (const alias of entity.aliases) this.entityByAlias.set(alias, entity.id);
    this.entityByAlias.set(entity.canonical_name, entity.id);
  }

  get(id: string): KnowledgeEntity | null { return this.entities.get(id) || null; }
  findByName(name: string): KnowledgeEntity | null {
    const id = this.entityByAlias.get(name);
    return id ? this.entities.get(id) || null : null;
  }
  getAll(): KnowledgeEntity[] { return Array.from(this.entities.values()); }
  exists(id: string): boolean { return this.entities.has(id); }
  count(): number { return this.entities.size; }
}
