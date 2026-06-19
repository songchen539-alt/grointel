// GroIntel Cognitive Kernel — Correction Engine
import { LearningInsight, KernelCorrection, CorrectionType } from "./learning_types";

let corrCounter = 0;
function genId(): string { return "corr_" + (++corrCounter).toString(16).padStart(6, "0"); }

export class CorrectionEngine {
  generateCorrections(insight: LearningInsight): KernelCorrection[] {
    const corrections: KernelCorrection[] = [];

    for (const update of insight.what_kernel_should_update) {
      const correction = this.createCorrection(insight, update as CorrectionType);
      if (correction) corrections.push(correction);
    }

    return corrections;
  }

  private createCorrection(insight: LearningInsight, type: CorrectionType): KernelCorrection | null {
    const base = {
      id: genId(),
      learning_insight_id: insight.id,
      correction_type: type,
      target_id: insight.prediction_id,
      target_type: "prediction",
      previous_value: null,
      new_value: null,
      reason: insight.why_difference_may_exist,
      created_at: new Date().toISOString(),
    };

    switch (type) {
      case "increase_confidence":
        return { ...base, previous_value: "current", new_value: "increased", target_type: "prediction_rule" };
      case "decrease_confidence":
        return { ...base, previous_value: "current", new_value: "decreased", target_type: "prediction_rule" };
      case "update_entity_state":
        return { ...base, target_type: "entity" };
      case "add_known_unknown":
        return { ...base, target_type: "knowledge" };
      case "create_contradiction":
        return { ...base, target_type: "contradiction" };
      case "adjust_rule_weight":
        return { ...base, target_type: "prediction_rule" };
      case "mark_source_unreliable":
        return { ...base, target_type: "source" };
      case "request_more_evidence":
        return { ...base, target_type: "observation" };
      default:
        return null;
    }
  }
}
