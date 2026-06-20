// GroIntel CRS-2 — Contribution Score
import { ContributionScore } from "./contribution_types";
import { KnowledgeArtifact } from "./contribution_types";
import { CitationGraph } from "./citation_graph";
import { AttributionEngine } from "./attribution_engine";

export class ContributionScoreEngine {
  compute(artifact: KnowledgeArtifact, citationGraph: CitationGraph, attribution: AttributionEngine): ContributionScore {
    const citations = citationGraph.getCitations(artifact.id);
    const refs = citationGraph.getReferences(artifact.id);
    const attribs = attribution.getByArtifact(artifact.id);

    const originality = Math.max(10, 100 - artifact.contributors.filter(c => c.role !== "creator").length * 10);
    const accuracy = artifact.validators.length > 0 ? Math.min(100, 50 + artifact.validators.length * 10) : 40;
    const reuse = Math.min(100, citations.length * 20);
    const validation = Math.min(100, artifact.validators.length * 15 + artifact.reviewers.length * 10);
    const impact = Math.min(100, refs.length * 25);
    const trust = artifact.approvers.length > 0 ? Math.min(100, 50 + artifact.approvers.length * 15) : 30;
    const learningValue = artifact.type === "learning" || artifact.type === "discovery" ? 80 : 50;

    const composite = Math.round(
      originality * 0.15 + accuracy * 0.15 + reuse * 0.15 + validation * 0.15 +
      impact * 0.15 + trust * 0.10 + learningValue * 0.15
    );

    return { originality, accuracy, reuse, validation, impact, trust, learning_value: learningValue, composite };
  }
}
