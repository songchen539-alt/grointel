// GroIntel KNOWLEDGE-1 — Decision Reactivity
export class DecisionReactivity {
  reevaluate(decisionId: string, futureConfidence: number): { updated: boolean; newConfidence: number } {
    const nc = Math.round(futureConfidence * 0.3 + 70 * 0.7);
    return { updated: true, newConfidence: nc };
  }

  flagObsolete(confidence: number): boolean { return confidence < 30; }
}
