// GroIntel ROS-6 — Evolution Judgement (uses Wisdom Runtime concepts)
import { ImprovementProposal, EvolutionJudgement, JudgementResult } from "./evolution_types";

let jCounter = 0;
function genId(): string { return "ej_" + (++jCounter).toString(16).padStart(6, "0"); }

export class EvolutionJudgementEngine {
  judge(proposal: ImprovementProposal): EvolutionJudgement {
    const riskFactor = proposal.risk / 100;
    const complexityFactor = proposal.complexity / 100;

    const principles = [
      { p: "Reality before opinion", score: Math.max(10, 90 - proposal.risk * 0.5) },
      { p: "Long-term before short-term", score: proposal.expected_benefit.includes("long") || proposal.expected_benefit.includes("reduce") ? 85 : Math.max(20, 70 - proposal.risk * 0.3) },
      { p: "Trust before growth", score: proposal.risk > 20 ? Math.max(10, 60 - proposal.risk * 0.4) : 80 },
      { p: "Learning before certainty", score: proposal.proposal_type === "architecture_review" ? Math.max(30, 85 - proposal.risk * 0.3) : Math.max(20, 70 - proposal.risk * 0.3) },
      { p: "Civilization before optimization", score: proposal.affected_layer !== "codebase" ? Math.max(30, 75 - proposal.risk * 0.2) : Math.max(20, 60 - proposal.risk * 0.3) },
    ];
    const values = [
      { v: "Truth", score: Math.max(10, 85 - proposal.complexity * 0.4) },
      { v: "Trust", score: proposal.risk > 20 ? Math.max(10, 60 - proposal.risk * 0.4) : 80 },
      { v: "Safety", score: Math.max(10, 90 - proposal.risk * 0.6) },
    ];

    // Apply risk penalty to composite
    const principleAvg = Math.round(principles.reduce((s, p) => s + p.score, 0) / principles.length);
    const valueAvg = Math.round(values.reduce((s, v) => s + v.score, 0) / values.length);
    const baseComposite = principleAvg * 0.6 + valueAvg * 0.4;
    const composite = Math.round(baseComposite * (1 - riskFactor * 0.2));

    let verdict: JudgementResult;
    if (composite >= 75) verdict = "approve_recommendation";
    else if (composite >= 60) verdict = "needs_more_evidence";
    else if (composite >= 40) verdict = "defer";
    else verdict = "reject";

    return {
      id: genId(), proposal_id: proposal.id, verdict,
      principle_scores: principles.map(p => ({ principle: p.p, score: Math.round(p.score) })),
      value_scores: values.map(v => ({ value: v.v, score: Math.round(v.score) })),
      composite_score: composite,
      recommendation: `${verdict}: proposal '${proposal.title}' (composite=${composite})`,
    };
  }
}
