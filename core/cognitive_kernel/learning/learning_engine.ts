// GroIntel Cognitive Kernel — Learning Engine
import { PredictionValidation, OutcomeComparison, LearningInsight } from "./learning_types";

let learnCounter = 0;
function genId(): string { return "li_" + (++learnCounter).toString(16).padStart(6, "0"); }

export class LearningEngine {
  generateInsight(validation: PredictionValidation, comparison: OutcomeComparison): LearningInsight {
    const expectedStr = JSON.stringify(validation.expected_state);
    const observedStr = JSON.stringify(validation.observed_state || "No observation");

    let why: string;
    const updates: string[] = [];
    let adjustment: string;
    let severity: number;

    switch (comparison.comparison) {
      case "exact_match":
        why = "Prediction model accurately captured reality. Evidence supports continued use of this prediction pattern.";
        updates.push("increase_confidence");
        adjustment = "Maintain or slightly increase rule weight";
        severity = 10;
        break;
      case "partial_match":
        why = "Prediction was directionally correct but some details differed. Model may need refinement.";
        updates.push("adjust_rule_weight");
        adjustment = "Refine prediction parameters for better accuracy";
        severity = 30;
        break;
      case "directional_match":
        why = "Overall direction was correct but magnitude or timing differed. Model may need calibration.";
        updates.push("adjust_rule_weight", "update_entity_state");
        adjustment = "Calibrate prediction timing and magnitude parameters";
        severity = 40;
        break;
      case "miss":
        why = "Prediction did not match outcome. Assumptions may be incorrect or conditions changed.";
        updates.push("decrease_confidence", "add_known_unknown", "create_contradiction");
        adjustment = "Reduce confidence in this prediction pattern. Investigate why conditions differed.";
        severity = 60;
        break;
      case "opposite_outcome":
        why = "Outcome was opposite of prediction. Fundamental assumption may be wrong.";
        updates.push("decrease_confidence", "mark_source_unreliable", "create_contradiction");
        adjustment = "Significantly reduce confidence. Review core assumptions of this prediction pattern.";
        severity = 80;
        break;
      default:
        why = "Insufficient evidence to compare prediction with outcome.";
        updates.push("request_more_evidence");
        adjustment = "Collect more observations before validating this prediction";
        severity = 20;
    }

    return {
      id: genId(),
      prediction_id: validation.prediction_id,
      comparison_id: comparison.id,
      what_was_expected: `Expected: ${expectedStr.slice(0, 100)}`,
      what_happened: `Observed: ${observedStr.slice(0, 100)}`,
      why_difference_may_exist: why,
      what_kernel_should_update: updates,
      future_prediction_adjustment: adjustment,
      severity,
      created_at: new Date().toISOString(),
    };
  }
}
