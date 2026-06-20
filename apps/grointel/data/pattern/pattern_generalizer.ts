// GroIntel DATA-4 — Pattern Generalizer
import { GrowthPattern } from "./pattern_types";

export class PatternGeneralizer {
  generalize(pattern: GrowthPattern, newContext: string): GrowthPattern {
    const now = new Date().toISOString();
    pattern.recommended_contexts = [...new Set([...pattern.recommended_contexts, newContext])];
    pattern.sample_size++;
    pattern.version++;
    pattern.updated_at = now;
    pattern.history.push({ timestamp: now, change: `Generalized: ${newContext}`, confidence: pattern.confidence });
    return pattern;
  }
}
