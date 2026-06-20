// GroIntel INT-6 — Approval Policy
import { ApprovalRequirement, DecisionOption, DecisionEvaluation } from "./decision_types";

export class ApprovalPolicy {
  check(option: DecisionOption, evaluation: DecisionEvaluation): ApprovalRequirement {
    const reasons: string[] = [];
    let riskLevel = "low";

    if (option.risk >= 70) { reasons.push("High risk level"); riskLevel = "high"; }
    if (option.confidence < 70) reasons.push("Low confidence");
    if (evaluation.reality_fidelity < 75) reasons.push("Reality fidelity below threshold");
    if (evaluation.civilization_value < 50) reasons.push("Potential negative civilization impact");
    if (option.reversibility < 30) { reasons.push("Irreversible action"); riskLevel = "high"; }
    if (option.name.toLowerCase().includes("risk")) reasons.push("Legal/policy risk flagged");
    if (evaluation.risk_adjusted_value < 40) reasons.push("Risk-adjusted value below threshold");

    return {
      required: reasons.length > 0,
      reasons,
      risk_level: riskLevel,
      confidence: option.confidence,
    };
  }
}
