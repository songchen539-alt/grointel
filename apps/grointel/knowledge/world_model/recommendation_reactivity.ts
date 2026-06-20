// GroIntel KNOWLEDGE-1 — Recommendation Reactivity
export class RecommendationReactivity {
  reevaluate(recommendationId: string, worldConfidence: number): { updated: boolean; newConfidence: number } {
    const nc = Math.round(worldConfidence * 0.4 + 60 * 0.6);
    return { updated: true, newConfidence: nc };
  }

  shouldRetire(confidence: number, version: number): boolean { return confidence < 20 && version > 3; }
}
