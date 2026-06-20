// EVOLUTION-1 — Evolution Flow
import { ReflectionEngine } from "./reflection_engine";
import { BlindSpotEngine } from "./blind_spot_engine";
import { OptimizationProposalEngine } from "./optimization_engine";
import { WisdomEngine } from "./wisdom_engine";
import { SelfEvaluationEngine } from "./self_evaluation";
import { ReflectionDomain, OptimizationProposal, SelfEvaluation } from "./evolution_types";

export class EvolutionFlow {
  public readonly reflection = new ReflectionEngine();
  public readonly blindSpots = new BlindSpotEngine();
  public readonly optimization = new OptimizationProposalEngine();
  public readonly wisdom = new WisdomEngine();
  public readonly evaluation = new SelfEvaluationEngine();

  runFullReflection(domains: { domain: ReflectionDomain; predicted: number[]; observed: number[] }[]): { reflections: any[]; blindSpots: any[]; proposals: OptimizationProposal[]; evaluation: SelfEvaluation } {
    // 1. Reflect on all domains
    const reflections = domains.map(d => this.reflection.analyze(d.domain, d.predicted, d.observed));

    // 2. Detect blind spots
    const coverages = domains.map(d => ({ domain: d.domain, coverage: Math.round(100 - d.predicted.reduce((s, p) => s + Math.abs(p - (d.observed[d.observed.length - 1] || 0)), 0) / Math.max(1, d.predicted.length) * 2), confidence: Math.round(70 - d.predicted.reduce((s, p) => s + Math.abs(p - (d.observed[0] || 0)), 0) / Math.max(1, d.predicted.length) * 3), entities: Math.max(1, Math.round(10 - d.predicted.length)), evidence: d.observed.length }));
    const spots = this.blindSpots.detect(coverages);

    // 3. Generate optimization proposals
    const proposals = this.optimization.generate(reflections, spots);

    // 4. Self evaluation
    const avgPredAcc = reflections.reduce((s, r) => s + r.score, 0) / Math.max(1, reflections.length);
    const evaluation = this.evaluation.evaluate(avgPredAcc, 70, 65, 60, this.wisdom.count(), spots.length, 75, 55);

    return { reflections, blindSpots: spots, proposals, evaluation };
  }
}
