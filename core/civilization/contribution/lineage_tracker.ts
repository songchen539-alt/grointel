// GroIntel CRS-2 — Knowledge Lineage Tracker
import { KnowledgeLineage } from "./contribution_types";

export class LineageTracker {
  private lineages: Map<string, KnowledgeLineage> = new Map();

  create(artifactId: string, originId: string | null, parentId: string | null, canonicalId: string): KnowledgeLineage {
    const lineage: KnowledgeLineage = {
      artifact_id: artifactId, origin_id: originId, parent_id: parentId,
      derived_artifact_ids: [], merged_artifact_ids: [],
      superseded_versions: [], current_canonical_id: canonicalId,
      version_history: [{ version: 1, timestamp: new Date().toISOString(), change: "Created", contributor: "system" }],
    };
    this.lineages.set(artifactId, lineage);
    return lineage;
  }

  addDerived(artifactId: string, derivedId: string): void {
    const l = this.lineages.get(artifactId);
    if (l) l.derived_artifact_ids = [...l.derived_artifact_ids, derivedId];
  }

  addMerged(artifactId: string, mergedId: string): void {
    const l = this.lineages.get(artifactId);
    if (l) l.merged_artifact_ids = [...l.merged_artifact_ids, mergedId];
  }

  supersede(artifactId: string, newCanonical: string, change: string, contributor: string): void {
    const l = this.lineages.get(artifactId);
    if (l) {
      l.superseded_versions = [...l.superseded_versions, l.current_canonical_id];
      l.current_canonical_id = newCanonical;
      l.version_history = [...l.version_history, { version: l.version_history.length + 1, timestamp: new Date().toISOString(), change, contributor }];
    }
  }

  get(artifactId: string): KnowledgeLineage | null { return this.lineages.get(artifactId) || null; }
  getAll(): KnowledgeLineage[] { return Array.from(this.lineages.values()); }
}
