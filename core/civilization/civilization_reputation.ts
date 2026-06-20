// GroIntel CRS-1 — Civilization Reputation Engine (evolves over time)
import { ReputationScore } from "./civilization_types";
import { CivilizationNode } from "./civilization_types";

export class ReputationEngine {
  update(node: CivilizationNode, accuracyDelta: number, truthDelta: number, qualityDelta: number, contributionDelta: number, trustDelta: number, learningDelta: number): ReputationScore {
    const r = node.reputation;
    const clamp = (v: number) => Math.max(0, Math.min(100, v));

    r.prediction_accuracy = clamp(r.prediction_accuracy + accuracyDelta);
    r.truth_preservation = clamp(r.truth_preservation + truthDelta);
    r.knowledge_quality = clamp(r.knowledge_quality + qualityDelta);
    r.contribution = clamp(r.contribution + contributionDelta);
    r.trustworthiness = clamp(r.trustworthiness + trustDelta);
    r.learning_rate = clamp(r.learning_rate + learningDelta);

    r.composite = Math.round(
      r.prediction_accuracy * 0.20 + r.truth_preservation * 0.20 +
      r.knowledge_quality * 0.20 + r.contribution * 0.15 +
      r.trustworthiness * 0.15 + r.learning_rate * 0.10
    );

    node.identity.trust_score = r.composite;
    return r;
  }

  compare(a: ReputationScore, b: ReputationScore): { higher: string; lower: string; delta: number } {
    return {
      higher: a.composite >= b.composite ? "A" : "B",
      lower: a.composite >= b.composite ? "B" : "A",
      delta: Math.abs(a.composite - b.composite),
    };
  }
}
