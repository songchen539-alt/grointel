// GroIntel DATA-5 — Cause Validator
import { CauseEdge, CauseValidation } from "./cause_types";

export class CauseValidator {
  validate(edge: CauseEdge, observationCount: number): CauseValidation {
    const temporal = observationCount >= 2;
    const evScore = Math.min(100, edge.evidence.length * 20);
    const predConsistent = edge.confidence >= 50;
    const confMet = edge.confidence >= 40;
    const passed = temporal && evScore >= 20 && predConsistent && confMet;
    return { id:"cv_"+Math.random().toString(36).slice(2,8), edge_id: edge.id, observation_count: observationCount, temporal_ordering_confirmed: temporal, evidence_score: evScore, prediction_consistent: predConsistent, confidence_threshold_met: confMet, passed, validated_at: new Date().toISOString() };
  }
}
