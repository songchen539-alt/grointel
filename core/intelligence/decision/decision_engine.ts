// GroIntel INT-6 — Decision Engine (read-only, never executes)
import { Decision, DecisionContext, DecisionTrace, DecisionType } from "./decision_types";
import { DecisionContextBuilder } from "./decision_context_builder";
import { DecisionOptionBuilder } from "./decision_option_builder";
import { DecisionEvaluator } from "./decision_evaluator";
import { DecisionThreshold } from "./decision_threshold";
import { ApprovalPolicy } from "./approval_policy";

let dcCounter = 0;
function genId(): string { return "dec_" + (++dcCounter).toString(16).padStart(6, "0"); }
function trId(): string { return "dtrc_" + Math.random().toString(36).slice(2, 10); }

export class DecisionEngine {
  public readonly ctxBuilder = new DecisionContextBuilder();
  public readonly optBuilder = new DecisionOptionBuilder();
  public readonly evaluator = new DecisionEvaluator();
  public readonly threshold = new DecisionThreshold();
  public readonly approval = new ApprovalPolicy();

  run(entity: string, domain: string, goal: string): { decision: Decision; trace: DecisionTrace } {
    const steps: { step: number; action: string; output: string }[] = [];
    const decisionId = genId();

    // 1. Build context
    steps.push({ step: 1, action: "build_context", output: `Context for ${entity} in ${domain}` });
    const ctx = this.ctxBuilder.build(entity, domain, goal);

    // 2. Build options
    steps.push({ step: 2, action: "build_options", output: "Building decision options" });
    const allOptions = this.optBuilder.build();

    // 3. Evaluate
    steps.push({ step: 3, action: "evaluate_options", output: "Scoring 6 decision options" });
    const ranked = this.evaluator.evaluateAll(allOptions, ctx.reality_fidelity);

    // 4. Apply threshold
    const best = ranked[0];
    const thresholdResult = this.threshold.apply(best.evaluation.decision_score);
    steps.push({ step: 4, action: "apply_threshold", output: `Threshold: ${thresholdResult.threshold_level} (score: ${thresholdResult.score})` });

    // 5. Check approval
    const approvalReq = this.approval.check(best.option, best.evaluation);
    if (approvalReq.required) {
      steps.push({ step: 5, action: "check_approval", output: `Approval required: ${approvalReq.reasons.join(", ")}` });
    }

    // 6. Determine decision type
    let decisionType: DecisionType = "recommend_action";
    if (thresholdResult.threshold_level === "reject_action") decisionType = "reject_action";
    else if (thresholdResult.threshold_level === "defer_decision") decisionType = "defer_decision";
    else if (thresholdResult.threshold_level === "validate_more") decisionType = "validate_more";
    else if (thresholdResult.threshold_level === "recommend_action_with_review" && approvalReq.required) decisionType = "escalate_to_human";
    else if (thresholdResult.threshold_level === "high_confidence_recommendation") decisionType = "recommend_action";

    const rejected = ranked.slice(1).map(r => ({ option: r.option, reason: `Lower decision score: ${r.evaluation.decision_score} vs ${best.evaluation.decision_score}` }));

    const decision: Decision = {
      id: decisionId, type: decisionType,
      target_entity: entity, target_domain: domain, decision_goal: goal,
      context: ctx, options: allOptions,
      recommendation: { option: best.option, evaluation: best.evaluation, threshold: thresholdResult, approval: approvalReq },
      rejected_options: rejected,
      created_at: new Date().toISOString(),
    };

    const trace: DecisionTrace = {
      id: trId(), decision_id: decisionId, steps,
      created_at: new Date().toISOString(),
    };

    return { decision, trace };
  }
}
