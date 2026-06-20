// REALITY-3 — Continuous Curiosity Engine
import { ExplorationCandidate } from "./continuous_types";

export class ContinuousCuriosityEngine {
  generateFromHypotheses(hypothesisCount: number, validatedCount: number, rejectedCount: number): ExplorationCandidate[] {
    const candidates: ExplorationCandidate[] = [];

    if (hypothesisCount === 0) {
      candidates.push({ entity: "new_entity_discovery", reason: "No active hypotheses — explore new entities", priority: 80, suggested_capabilities: ["observe_website"] });
    }
    if (validatedCount > rejectedCount && validatedCount > 3) {
      candidates.push({ entity: "pattern_search", reason: `${validatedCount} hypotheses validated — search for reusable patterns`, priority: 65, suggested_capabilities: ["observe_website", "observe_news"] });
    }
    if (rejectedCount > validatedCount && rejectedCount > 2) {
      candidates.push({ entity: "hypothesis_review", reason: `${rejectedCount} hypotheses rejected — review assumptions`, priority: 70, suggested_capabilities: ["observe_website"] });
    }

    return candidates;
  }
}
