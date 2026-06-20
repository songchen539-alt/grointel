// WORLD-1 — World Progress Reporter
import { WorldProgress, WorldBuildingEvent } from "./world_metrics_types";

export class WorldProgressReporter {
  generate(events: WorldBuildingEvent[], gaps: number, priorities: string[]): WorldProgress {
    const now = new Date();
    const start = new Date(now.getTime() - 86400000);
    return {
      period_start: start.toISOString(), period_end: now.toISOString(),
      reality_covered_new: events.filter(e => e.type === "coverage").reduce((s, e) => s + e.delta, 0),
      knowledge_improved: events.filter(e => e.type === "knowledge").length,
      decisions_improved: events.filter(e => e.type === "decision").length,
      outcomes_improved: events.filter(e => e.type === "outcome").length,
      gaps_discovered: gaps,
      next_priorities: priorities.slice(0, 5),
    };
  }
}
