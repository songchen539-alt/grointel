// GroIntel CRS-2 — Influence Engine
import { InfluenceScore } from "./contribution_types";
import { CitationGraph } from "./citation_graph";
import { AttributionEngine } from "./attribution_engine";

export class InfluenceEngine {
  compute(artifactId: string, citationGraph: CitationGraph, attribution: AttributionEngine): InfluenceScore {
    const citations = citationGraph.getCitations(artifactId);
    const refs = citationGraph.getReferences(artifactId);
    const attribs = attribution.getByArtifact(artifactId);

    const reuseFrequency = Math.min(100, citations.length * 20 + refs.length * 10);
    const validationRate = attribs.length > 0 ? Math.min(100, attribs.filter(a => a.attribution_type === "validator").length / Math.max(1, attribs.length) * 100) : 10;
    const predictionAccuracy = 60 + Math.min(40, citations.length * 5);
    const downstreamImpact = Math.min(100, refs.length * 25);
    const crossDomainAdoption = 30 + Math.min(70, citations.length * 10);
    const longTermUsefulness = Math.min(100, 50 + Math.max(0, citations.filter(c => {
      const age = Date.now() - new Date(c.timestamp).getTime();
      return age > 86400000;
    }).length * 5));

    const composite = Math.round(
      reuseFrequency * 0.20 + validationRate * 0.15 + predictionAccuracy * 0.15 +
      downstreamImpact * 0.20 + crossDomainAdoption * 0.15 + longTermUsefulness * 0.15
    );

    return { reuse_frequency: reuseFrequency, validation_rate: Math.round(validationRate), prediction_accuracy: predictionAccuracy, downstream_impact: downstreamImpact, cross_domain_adoption: crossDomainAdoption, long_term_usefulness: longTermUsefulness, composite };
  }
}
