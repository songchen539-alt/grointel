// GroIntel ROS-5 — Wisdom Runtime (highest reasoning layer)
import { WisdomEvaluation, WisdomRecommendation, WisdomTrace, JudgementVerdict } from "./wisdom_types";
import { PrincipleRegistry } from "./principle_registry";
import { ValueSystem } from "./value_system";
import { JudgementEngine } from "./judgement_engine";
import { LongTermReasoner } from "./long_term_reasoner";
import { CivilizationEvaluator } from "./civilization_evaluator";
import { EthicalConstraintChecker } from "./ethical_constraints";
import { WisdomTraceRecorder } from "./wisdom_trace";

export class WisdomRuntime {
  public readonly principles = new PrincipleRegistry();
  public readonly values = new ValueSystem();
  public readonly judgement = new JudgementEngine(this.principles, this.values);
  public readonly longTerm = new LongTermReasoner();
  public readonly civEval = new CivilizationEvaluator();
  public readonly ethics = new EthicalConstraintChecker();
  public readonly traces = new WisdomTraceRecorder();

  evaluate(decisionId: string, description: string): WisdomEvaluation {
    const start = Date.now();

    // Judgement
    const judgement = this.judgement.judge(decisionId, description);

    // Long-term impact
    const longTermImpact = this.longTerm.evaluate(description);

    // Civilization impact
    const civilizationImpact = this.civEval.evaluate(description);

    // Ethical constraints
    const ethicalAssessment = this.ethics.check(description);

    // Composite wisdom score: judgement 40% + long term 30% + civ 20% + ethics 10%
    const negEthical = ethicalAssessment.filter(e => e.triggered).length * 10;
    const overallScore = Math.round(
      judgement.composite_score * 0.4 + longTermImpact.composite * 0.3 +
      civilizationImpact.composite * 0.2 - negEthical * 0.1
    );
    const overallConfidence = Math.round(
      judgement.composite_score * 0.6 + longTermImpact.composite * 0.2 + civilizationImpact.composite * 0.2
    );

    let recommendation: string;
    if (this.ethics.hasCriticalViolations(ethicalAssessment)) {
      recommendation = `REJECTED: Ethical violations detected (${ethicalAssessment.filter(e => e.triggered).length} constraints triggered)`;
    } else if (overallScore >= 75) {
      recommendation = "Recommended — strong alignment with wisdom criteria";
    } else if (overallScore >= 50) {
      recommendation = "Conditional — proceed with caution and monitoring";
    } else {
      recommendation = "Not recommended — conflicts with core wisdom";
    }

    const evaluation: WisdomEvaluation = {
      id: "we_" + Math.random().toString(36).slice(2, 10),
      decision_id: decisionId, decision_description: description,
      judgement, long_term_impact: longTermImpact,
      civilization_impact: civilizationImpact,
      ethical_assessment: ethicalAssessment,
      overall_recommendation: recommendation,
      confidence: Math.min(100, overallConfidence),
      created_at: new Date().toISOString(),
    };

    // Trace
    const allPrinciples = this.principles.getAll().map(p => p.statement);
    const allValues = this.values.getAll().map(v => v.name);
    this.traces.record(decisionId, allPrinciples, allValues, judgement.verdict, overallScore, Date.now() - start);

    return evaluation;
  }

  getRecommendation(evaluation: WisdomEvaluation): WisdomRecommendation {
    const supporting = evaluation.judgement.principle_scores.filter(p => p.score >= 70).map(p => p.principle_id);
    const violating = evaluation.judgement.principle_scores.filter(p => p.score < 50).map(p => p.principle_id);
    const concerns = evaluation.ethical_assessment.filter(e => e.triggered).map(e => e.description);

    let outlook: string;
    if (evaluation.long_term_impact.composite >= 70) outlook = "Positive long-term trajectory";
    else if (evaluation.long_term_impact.composite >= 50) outlook = "Mixed long-term outlook";
    else outlook = "Concerning long-term trajectory";

    return {
      evaluation_id: evaluation.id,
      verdict: evaluation.judgement.verdict,
      summary: evaluation.overall_recommendation,
      supporting_principles: supporting,
      violating_principles: violating,
      ethical_concerns: concerns,
      long_term_outlook: outlook,
      confidence: evaluation.confidence,
    };
  }
}
