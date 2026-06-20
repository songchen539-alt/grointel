// GroIntel DATA-4 — Pattern Validator
import { PatternValidation, GrowthPattern } from "./pattern_types";

export class PatternValidator {
  validate(pattern: GrowthPattern): PatternValidation {
    const count = pattern.supporting_activity_ids.length;
    const evScore = Math.min(100, pattern.evidence_count * 15);
    const predAcc = Math.min(100, 50 + count * 10);
    const contradictions = 0;
    const passed = count >= 2 && evScore >= 30 && contradictions <= count * 0.5;

    return {
      id: "pv_" + Math.random().toString(36).slice(2, 8),
      pattern_id: pattern.id, validated_by_activity_count: count,
      evidence_score: evScore, prediction_accuracy: predAcc,
      contradiction_count: contradictions, passed,
      validated_at: new Date().toISOString(),
    };
  }

  promote(pattern: GrowthPattern, validation: PatternValidation): GrowthPattern {
    if (!validation.passed) return pattern;
    const now = new Date().toISOString();
    pattern.status = "validated";
    pattern.confidence = Math.min(100, pattern.confidence + 20);
    pattern.version++;
    pattern.history.push({ timestamp: now, change: "Validated", confidence: pattern.confidence });
    return pattern;
  }

  promoteToStable(pattern: GrowthPattern): GrowthPattern {
    if (pattern.supporting_activity_ids.length < 3) return pattern;
    const now = new Date().toISOString();
    pattern.status = "stable";
    pattern.confidence = Math.min(100, pattern.confidence + 15);
    pattern.version++;
    pattern.history.push({ timestamp: now, change: "Promoted to stable", confidence: pattern.confidence });
    return pattern;
  }
}
