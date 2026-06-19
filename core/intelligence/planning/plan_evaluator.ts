// GroIntel INT-2 — Plan Evaluator
import { PlanPath, PlanEvaluation, PlanConstraint } from "./planning_types";

export class PlanEvaluator {
  evaluate(paths: PlanPath[], constraints: PlanConstraint[]): PlanEvaluation {
    const avgConf = paths.reduce((s, p) => s + p.confidence, 0) / Math.max(1, paths.length);
    const avgTime = paths.reduce((s, p) => s + p.estimated_total_days, 0) / Math.max(1, paths.length);
    const violatedCount = constraints.filter(c => c.violated).length;

    const feasibility = Math.round(
      avgConf * 0.25 + (100 - violatedCount * 20) * 0.20 + 60 * 0.20 + 60 * 0.15 + 50 * 0.10 + (100 - violatedCount * 15) * 0.10
    );

    const impact = Math.round(
      80 * 0.30 + 65 * 0.20 + 70 * 0.15 + 55 * 0.15 + (100 - violatedCount * 10) * 0.10 + 60 * 0.10
    );

    return {
      feasibility_score: Math.min(100, Math.max(0, feasibility)),
      impact_score: Math.min(100, Math.max(0, impact)),
      confidence: Math.round((avgConf + feasibility) / 2),
      feasibility_components: { capability_fit: avgConf, dependency_readiness: 80, evidence_quality: 60, resource_fit: 60, uncertainty_control: 50, risk_control: 70 },
      impact_components: { goal_alignment: 80, expected_growth: 65, knowledge_gain: 70, trust_gain: 55, risk_reduction: 60, civilization_value: 60 },
    };
  }
}
