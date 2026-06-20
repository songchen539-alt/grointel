// GroIntel DATA-4 — Pattern Confidence Calculator
import { PatternConfidence, GrowthPattern } from "./pattern_types";

export class PatternConfidenceCalculator {
  compute(pattern: GrowthPattern): PatternConfidence {
    const sample = pattern.supporting_activity_ids.length + pattern.supporting_company_ids.length;
    const validation = pattern.evidence_count > 0 ? Math.min(100, 50 + pattern.evidence_count * 10) : 10;
    const predAcc = Math.min(100, 50 + sample * 5);
    const timeDecay = 80;
    const crossRegion = pattern.recommended_contexts.length * 10;
    const crossIndustry = pattern.conditions.industry === "all" ? 70 : 30;
    const composite = Math.round((sample * 10 + validation * 0.25 + predAcc * 0.2 + timeDecay * 0.15 + crossRegion * 0.15 + crossIndustry * 0.15));
    return { sample_size: sample, validation_rate: validation, prediction_accuracy: predAcc, time_decay: timeDecay, cross_region_reuse: Math.min(100, crossRegion), cross_industry_reuse: crossIndustry, composite: Math.min(100, composite) };
  }
}
