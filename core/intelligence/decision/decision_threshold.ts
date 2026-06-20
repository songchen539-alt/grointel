// GroIntel INT-6 — Decision Threshold
import { ThresholdResult, ThresholdLevel } from "./decision_types";

export class DecisionThreshold {
  apply(decisionScore: number): ThresholdResult {
    let level: ThresholdLevel;
    let description: string;

    if (decisionScore >= 91) {
      level = "high_confidence_recommendation";
      description = "High confidence — proceed with recommended action";
    } else if (decisionScore >= 81) {
      level = "recommend_action_with_review";
      description = "Strong recommendation — review before proceeding";
    } else if (decisionScore >= 66) {
      level = "recommend_action";
      description = "Recommend action — standard confidence";
    } else if (decisionScore >= 51) {
      level = "validate_more";
      description = "Validate more before deciding";
    } else if (decisionScore >= 31) {
      level = "defer_decision";
      description = "Defer decision — insufficient confidence";
    } else {
      level = "reject_action";
      description = "Reject action — confidence too low";
    }

    return { threshold_level: level, score: decisionScore, description };
  }
}
