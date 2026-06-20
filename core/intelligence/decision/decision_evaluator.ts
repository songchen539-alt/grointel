// GroIntel INT-6 — Decision Evaluator
import { DecisionOption, DecisionEvaluation } from "./decision_types";

export class DecisionEvaluator {
  evaluate(option: DecisionOption, rf: number): DecisionEvaluation {
    const optScore = Math.round(option.expected_value * 0.3 + option.confidence * 0.2 + (100 - option.risk) * 0.5);
    const riskAdjVal = Math.round(option.expected_value * (1 - option.risk / 200));
    const decisionScore = Math.round(
      optScore * 0.25 + option.evidence_quality * 0.20 + option.goal_alignment * 0.15 +
      riskAdjVal * 0.15 + rf * 0.10 + option.reversibility * 0.10 + option.civilization_value * 0.05
    );

    return {
      optimization_score: optScore,
      evidence_quality: option.evidence_quality,
      goal_alignment: option.goal_alignment,
      risk_adjusted_value: riskAdjVal,
      reality_fidelity: rf,
      reversibility: option.reversibility,
      civilization_value: option.civilization_value,
      decision_score: decisionScore,
    };
  }

  evaluateAll(options: DecisionOption[], rf: number): { option: DecisionOption; evaluation: DecisionEvaluation }[] {
    return options.map(o => ({ option: o, evaluation: this.evaluate(o, rf) }))
      .sort((a, b) => b.evaluation.decision_score - a.evaluation.decision_score);
  }
}
