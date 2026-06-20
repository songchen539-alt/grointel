// GroIntel CRS-2 — Contribution Registry
import { KnowledgeArtifact, ArtifactType, Contributor } from "./contribution_types";

export class ContributionRegistry {
  private artifacts: Map<string, KnowledgeArtifact> = new Map();

  register(id: string, type: ArtifactType, title: string, content: string, creator: Contributor): KnowledgeArtifact {
    if (this.artifacts.has(id)) throw new Error(`Artifact '${id}' already registered`);
    const now = new Date().toISOString();
    const artifact: KnowledgeArtifact = {
      id, type, title, content, version: 1,
      contributors: [creator], validators: [], reviewers: [], approvers: [],
      created_at: now, updated_at: now,
    };
    this.artifacts.set(id, artifact);
    return artifact;
  }

  get(id: string): KnowledgeArtifact | null { return this.artifacts.get(id) || null; }
  getAll(): KnowledgeArtifact[] { return Array.from(this.artifacts.values()); }
  exists(id: string): boolean { return this.artifacts.has(id); }
  count(): number { return this.artifacts.size; }
  getByType(type: ArtifactType): KnowledgeArtifact[] { return this.getAll().filter(a => a.type === type); }
}
