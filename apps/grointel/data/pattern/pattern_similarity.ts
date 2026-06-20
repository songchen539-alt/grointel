// GroIntel DATA-4 — Pattern Similarity Engine
import { PatternSimilarity, GrowthPattern } from "./pattern_types";

export class PatternSimilarityEngine {
  findSimilar(patterns: GrowthPattern[], industry: string, region: string, capabilities: string[]): PatternSimilarity[] {
    return patterns.map(p => {
      const indFit = p.conditions.industry === industry || p.conditions.industry === "all" ? 90 : 30;
      const regFit = p.conditions.region === region || p.conditions.region === "all" ? 85 : 25;
      const capFit = capabilities.filter(c => p.supporting_capabilities.includes(c)).length / Math.max(1, capabilities.length) * 100;
      const simScore = Math.round(indFit * 0.4 + regFit * 0.3 + capFit * 0.3);
      return { pattern_id: p.id, similarity_score: simScore, confidence_fit: p.confidence, industry_fit: indFit, region_fit: regFit, capability_fit: Math.round(capFit) };
    }).sort((a, b) => b.similarity_score - a.similarity_score);
  }
}
