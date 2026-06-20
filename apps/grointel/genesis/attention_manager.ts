// GENESIS-1 — Attention Manager
import { AttentionTopic } from "./genesis_types";

export class AttentionManager {
  private counter = 0;

  score(entities: { id: string; recent_changes: number; confidence_drop: number; hypothesis_count: number; observation_freshness: number; signal_volatility: number }[]): AttentionTopic[] {
    return entities.map(e => {
      const score = Math.round(
        e.recent_changes * 30 +
        e.confidence_drop * 20 +
        e.hypothesis_count * 20 +
        (100 - e.observation_freshness) * 15 +
        e.signal_volatility * 15
      );
      return { entity_id: e.id, score: Math.min(100, score), reason: this.describe(e), timestamp: new Date().toISOString() };
    }).sort((a, b) => b.score - a.score);
  }

  private describe(e: { id: string; recent_changes: number; confidence_drop: number; hypothesis_count: number }): string {
    const parts: string[] = [];
    if (e.recent_changes > 0) parts.push(`${e.recent_changes} changes`);
    if (e.confidence_drop > 10) parts.push(`confidence -${e.confidence_drop}`);
    if (e.hypothesis_count > 0) parts.push(`${e.hypothesis_count} hypotheses`);
    return parts.join(", ") || "Routine observation";
  }
}
