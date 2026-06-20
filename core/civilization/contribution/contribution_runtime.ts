// GroIntel CRS-2 — Contribution Runtime
import { KnowledgeArtifact, ArtifactType, Contributor, Contribution, Attribution, Citation, InfluenceScore, ContributionScore, KnowledgeLineage, ContributionTrace } from "./contribution_types";
import { ContributionRegistry } from "./contribution_registry";
import { AttributionEngine } from "./attribution_engine";
import { CitationGraph } from "./citation_graph";
import { InfluenceEngine } from "./influence_engine";
import { ContributionScoreEngine } from "./contribution_score";
import { LineageTracker } from "./lineage_tracker";
import { ContributionTraceRecorder } from "./contribution_trace";

export class ContributionRuntime {
  public readonly registry = new ContributionRegistry();
  public readonly attribution = new AttributionEngine();
  public readonly citations = new CitationGraph();
  public readonly influence = new InfluenceEngine();
  public readonly scoring = new ContributionScoreEngine();
  public readonly lineage = new LineageTracker();
  public readonly traces = new ContributionTraceRecorder();

  registerArtifact(id: string, type: ArtifactType, title: string, content: string, creator: Contributor): KnowledgeArtifact {
    const art = this.registry.register(id, type, title, content, creator);
    this.attribution.attribute(id, creator.id, creator.name, "creator", []);
    this.lineage.create(id, null, null, id);
    this.traces.record("artifact_registered", id, creator.id, `Created ${type}: ${title}`);
    return art;
  }

  addContributor(artifactId: string, contributor: Contributor): void {
    const art = this.registry.get(artifactId);
    if (!art) return;
    art.contributors.push(contributor);
    art.updated_at = new Date().toISOString();
    this.attribution.attribute(artifactId, contributor.id, contributor.name, contributor.role, []);
    this.traces.record("contributor_added", artifactId, contributor.id, `Added as ${contributor.role}`);
  }

  addValidator(artifactId: string, validatorId: string): void {
    const art = this.registry.get(artifactId);
    if (art) { art.validators.push(validatorId); art.updated_at = new Date().toISOString();
    this.attribution.attribute(artifactId, validatorId, "system", "validator", []); }
  }

  addReviewer(artifactId: string, reviewerId: string): void {
    const art = this.registry.get(artifactId);
    if (art) { art.reviewers.push(reviewerId); art.updated_at = new Date().toISOString(); }
  }

  addApprover(artifactId: string, approverId: string): void {
    const art = this.registry.get(artifactId);
    if (art) { art.approvers.push(approverId); art.updated_at = new Date().toISOString();
    this.traces.record("artifact_approved", artifactId, approverId, "Approved"); }
  }

  recordCitation(citingId: string, citedId: string, context: string): Citation {
    const c = this.citations.cite(citingId, citedId, context);
    this.traces.record("citation_recorded", citingId, null, `Cited ${citedId}: ${context.substring(0, 30)}`);
    return c;
  }

  registerDerived(parentId: string, derivedId: string): void {
    this.lineage.addDerived(parentId, derivedId);
    this.traces.record("derived_registered", derivedId, null, `Derived from ${parentId}`);
  }

  registerMerged(intoId: string, mergedId: string): void {
    this.lineage.addMerged(intoId, mergedId);
    this.traces.record("merged_registered", intoId, null, `Merged ${mergedId}`);
  }

  supersedeVersion(artifactId: string, newCanonical: string, change: string, contributor: string): void {
    this.lineage.supersede(artifactId, newCanonical, change, contributor);
    this.traces.record("version_superseded", artifactId, contributor, change);
  }

  computeInfluence(artifactId: string): InfluenceScore {
    return this.influence.compute(artifactId, this.citations, this.attribution);
  }

  computeScore(artifactId: string): ContributionScore | null {
    const art = this.registry.get(artifactId);
    if (!art) return null;
    return this.scoring.compute(art, this.citations, this.attribution);
  }

  getLineage(artifactId: string): KnowledgeLineage | null { return this.lineage.get(artifactId); }
  getArtifact(id: string): KnowledgeArtifact | null { return this.registry.get(id); }
  getAllArtifacts(): KnowledgeArtifact[] { return this.registry.getAll(); }
  getAttributions(artifactId: string): Attribution[] { return this.attribution.getByArtifact(artifactId); }
  getCitationChain(artifactId: string): Citation[] { return this.citations.getCitationChain(artifactId); }
}
