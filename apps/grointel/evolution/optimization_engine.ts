// EVOLUTION-1 — Optimization Proposal Engine
import { OptimizationProposal, BlindSpot, ReflectionResult } from "./evolution_types";

export class OptimizationProposalEngine {
  private counter = 0;

  generate(reflections: ReflectionResult[], blindSpots: BlindSpot[]): OptimizationProposal[] {
    const proposals: OptimizationProposal[] = [];

    for (const bs of blindSpots) {
      proposals.push({
        id: "opt_" + (++this.counter).toString(16).padStart(6, "0"),
        title: `Improve coverage: ${bs.domain}`,
        description: bs.suggested_action,
        expected_impact: `Increased understanding of ${bs.domain}`,
        risk: bs.severity === "critical" ? 30 : 15,
        evidence: bs.evidence,
        status: "proposed", created_at: new Date().toISOString(),
      });
    }

    for (const ref of reflections.filter(r => r.score < 60)) {
      proposals.push({
        id: "opt_" + (++this.counter).toString(16).padStart(6, "0"),
        title: `Improve ${ref.domain}: score ${ref.score}`,
        description: ref.recommendations.join("; "),
        expected_impact: `Better ${ref.domain} performance`,
        risk: 20, evidence: ref.findings,
        status: "proposed", created_at: new Date().toISOString(),
      });
    }

    return proposals;
  }

  apply(proposal: OptimizationProposal): OptimizationProposal {
    return { ...proposal, status: "applied" };
  }

  reject(proposal: OptimizationProposal): OptimizationProposal {
    return { ...proposal, status: "rejected" };
  }
}
