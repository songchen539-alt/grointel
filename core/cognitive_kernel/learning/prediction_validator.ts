// GroIntel Cognitive Kernel — Prediction Validator
// Finds due predictions and validates against reality
import { Prediction, Observation } from "../kernel_types";
import { PredictionValidation, ValidationResult } from "./learning_types";

let valCounter = 0;
function genId(): string { return "pval_" + (++valCounter).toString(16).padStart(6, "0"); }

export class PredictionValidator {
  findDuePredictions(predictions: Prediction[]): Prediction[] {
    const now = new Date();
    return predictions.filter(p =>
      p.status === "active" && new Date(p.validation_due_at) <= now
    );
  }

  validate(prediction: Prediction, observations: Observation[]): PredictionValidation {
    const predState = prediction.predicted_state as Record<string, unknown> || {};
    let matchingObs: Observation | null = null;
    let evidenceUsed: string[] = [];

    // Find observations that might validate this prediction
    for (const obs of observations) {
      if (obs.entity_id === prediction.target_entity_id || obs.entity_id === null) {
        const obsData = obs.extracted_data || {};
        // Check for matching fields
        for (const [key, val] of Object.entries(predState)) {
          if (obsData[key] !== undefined && typeof val === "string") {
            matchingObs = obs;
            evidenceUsed.push(obs.id);
          }
        }
      }
    }

    let result: ValidationResult;
    let confAfter: number;

    if (matchingObs) {
      const obsVal = matchingObs.extracted_data;
      const matchCount = Object.keys(predState).filter(k => {
        const pv = String(predState[k] || "");
        const ov = String((obsVal as any)?.[k] || "");
        return pv.toLowerCase() === ov.toLowerCase() || pv.includes(ov) || ov.includes(pv);
      }).length;

      if (matchCount >= Object.keys(predState).length) {
        result = "validated";
        confAfter = Math.min(100, prediction.confidence + 10);
      } else if (matchCount > 0) {
        result = "partially_validated";
        confAfter = Math.round(prediction.confidence + (prediction.confidence * 0.1));
      } else {
        // Check for opposite
        let oppositeMatch = false;
        const opposites = [["increase","decrease"],["expanding","contracting"],["positive","negative"]];
        // pv/ov defined above in the some() callback - restructured
        for (const k of Object.keys(predState)) {
          const pv2 = String(predState[k] || "").toLowerCase();
          const ov2 = String((obsVal || {})[k] || "").toLowerCase();
          for (const [a, b] of opposites) {
            if ((pv2.includes(a) && ov2.includes(b)) || (pv2.includes(b) && ov2.includes(a))) { oppositeMatch = true; break; }
          }
          if (oppositeMatch) break;
        }
        result = oppositeMatch ? "invalidated" : "miss";
        confAfter = Math.max(0, prediction.confidence - 20);
      }
    } else {
      result = "insufficient_evidence";
      confAfter = prediction.confidence;
    }

    return {
      id: genId(),
      prediction_id: prediction.id,
      entity_id: prediction.target_entity_id,
      expected_state: prediction.predicted_state,
      observed_state: matchingObs?.extracted_data || null,
      validation_result: result,
      confidence_before: prediction.confidence,
      confidence_after: confAfter,
      evidence_used: evidenceUsed,
      created_at: new Date().toISOString(),
    };
  }
}
