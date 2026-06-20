// AWAKENING-3 — World Understanding Index
import { WorldUnderstandingIndex } from "./reality_time_types";

export class WorldUnderstandingCalculator {
  calculate(coverage: number, evidenceDensity: number, knowledgeConfidence: number,
    predAccuracy: number, decAccuracy: number, blindSpotReduction: number,
    freshness: number, relCompleteness: number, entityCompleteness: number): WorldUnderstandingIndex {
    const unknownSpace = Math.round(100 - ((coverage + entityCompleteness) / 2));
    const composite = Math.round(
      coverage * 0.15 + evidenceDensity * 0.12 + knowledgeConfidence * 0.12 +
      predAccuracy * 0.12 + decAccuracy * 0.12 + blindSpotReduction * 0.10 +
      freshness * 0.10 + relCompleteness * 0.09 + entityCompleteness * 0.08
    );
    return {
      reality_coverage: coverage, evidence_density: evidenceDensity, knowledge_confidence: knowledgeConfidence,
      prediction_accuracy: predAccuracy, decision_accuracy: decAccuracy, blind_spot_reduction: blindSpotReduction,
      freshness, relationship_completeness: relCompleteness, entity_completeness: entityCompleteness,
      unknown_space: unknownSpace, composite: Math.min(100, composite),
    };
  }
}
