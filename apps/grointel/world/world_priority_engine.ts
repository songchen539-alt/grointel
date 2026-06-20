// WORLD-1 — World Priority Engine
import { WorldGap } from "./world_metrics_types";

export class WorldPriorityEngine {
  prioritize(gaps: WorldGap[]): { priority: string; score: number; reason: string }[] {
    return gaps.map(g => ({
      priority: g.description,
      score: g.priority_score * (g.severity === "critical" ? 3 : g.severity === "high" ? 2 : 1),
      reason: `${g.type} gap in ${g.description} — current: ${g.current_value}, target: ${g.target_value}`,
    })).sort((a, b) => b.score - a.score);
  }
}
