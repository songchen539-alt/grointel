// GroIntel CRS-2 — Citation Graph
import { Citation } from "./contribution_types";

export class CitationGraph {
  private citations: Map<string, Citation> = new Map();

  cite(citingArtifactId: string, citedArtifactId: string, context: string): Citation {
    const c: Citation = {
      id: "cit_" + (++CitationGraph.counter).toString(16).padStart(6, "0"),
      citing_artifact_id: citingArtifactId, cited_artifact_id: citedArtifactId,
      context, depth: this.computeDepth(citedArtifactId) + 1, timestamp: new Date().toISOString(),
    };
    this.citations.set(c.id, c);
    return c;
  }

  getCitations(artifactId: string): Citation[] { return this.getAll().filter(c => c.cited_artifact_id === artifactId); }
  getReferences(artifactId: string): Citation[] { return this.getAll().filter(c => c.citing_artifact_id === artifactId); }
  getAll(): Citation[] { return Array.from(this.citations.values()); }
  count(): number { return this.citations.size; }

  getCitationChain(artifactId: string): Citation[] {
    const chain: Citation[] = [];
    let current = artifactId;
    for (let i = 0; i < 20; i++) {
      const refs = this.getCitations(current);
      if (refs.length === 0) break;
      chain.push(refs[0]);
      current = refs[0].citing_artifact_id;
    }
    return chain;
  }

  getCitationDepth(artifactId: string): number {
    const chain = this.getCitationChain(artifactId);
    return chain.length;
  }

  getCrossDomainCitations(domainId: string, allArtifacts: Map<string, string>): Citation[] {
    return this.getAll().filter(c => {
      const citingDomain = allArtifacts.get(c.citing_artifact_id);
      const citedDomain = allArtifacts.get(c.cited_artifact_id);
      return citingDomain && citedDomain && citingDomain !== citedDomain;
    });
  }

  private computeDepth(artifactId: string): number {
    const cited = this.getAll().filter(c => c.citing_artifact_id === artifactId);
    if (cited.length === 0) return 0;
    return 1 + Math.max(...cited.map(c => this.computeDepth(c.cited_artifact_id)));
  }

  private static counter = 0;
}
