// GroIntel CRS-2 — Attribution Engine (immutable)
import { Attribution, ArtifactType } from "./contribution_types";

export class AttributionEngine {
  private attributions: Map<string, Attribution> = new Map();

  attribute(artifactId: string, attributeTo: string, attributedBy: string, attributionType: string, evidence: string[]): Attribution {
    const a: Attribution = {
      id: "attr_" + (++AttributionEngine.counter).toString(16).padStart(6, "0"),
      artifact_id: artifactId, attribute_to: attributeTo, attributed_by: attributedBy,
      attribution_type: attributionType, evidence, timestamp: new Date().toISOString(), immutable: true,
    };
    this.attributions.set(a.id, a);
    return a;
  }

  getByArtifact(artifactId: string): Attribution[] { return this.getAll().filter(a => a.artifact_id === artifactId); }
  getByContributor(contributorId: string): Attribution[] { return this.getAll().filter(a => a.attribute_to === contributorId); }
  getAll(): Attribution[] { return Array.from(this.attributions.values()); }
  count(): number { return this.attributions.size; }

  private static counter = 0;
}
