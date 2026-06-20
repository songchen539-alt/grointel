// REALITY-3 — Continuous Attention Manager
import { ContinuousAttentionScore, ExplorationCandidate } from "./continuous_types";

export class ContinuousAttentionManager {
  score(entities: { id: string; name: string; freshness: number; knowledge_uncertainty: number; confidence: number; hypothesis_count: number; emerging_industry: boolean; rapid_change: boolean; high_impact: boolean }[]): ContinuousAttentionScore[] {
    return entities.map(e => {
      const score = Math.round(
        (100 - e.freshness) * 25 +
        e.knowledge_uncertainty * 20 +
        Math.max(0, 80 - e.confidence) * 15 +
        Math.min(e.hypothesis_count * 10, 30) +
        (e.emerging_industry ? 20 : 0) +
        (e.rapid_change ? 15 : 0) +
        (e.high_impact ? 10 : 0)
      );
      return {
        entity_id: e.id, name: e.name, score: Math.min(100, score),
        freshness: e.freshness, uncertainty: e.knowledge_uncertainty,
        confidence_drop: Math.max(0, 80 - e.confidence),
        hypothesis_count: e.hypothesis_count, emerging_industry: e.emerging_industry,
        rapid_change: e.rapid_change, high_impact: e.high_impact,
      };
    }).sort((a, b) => b.score - a.score);
  }

  generateCandidates(attention: ContinuousAttentionScore[], queueDepth: number): ExplorationCandidate[] {
    return attention.filter(a => a.score > 30).slice(0, Math.max(1, 5 - queueDepth)).map(a => ({
      entity: a.entity_id, reason: `Attention score: ${a.score} (freshness: ${a.freshness}, uncertainty: ${a.uncertainty})`,
      priority: a.score, suggested_capabilities: ["observe_website", "observe_linkedin", "observe_news"],
    }));
  }
}
