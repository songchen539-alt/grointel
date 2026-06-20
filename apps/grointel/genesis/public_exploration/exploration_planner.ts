// GENESIS-2 — Exploration Planner
import { ExplorationPlan, ExplorationStep, PublicSource, PublicSourceType } from "./exploration_types";
import { DiscoveryResult } from "./exploration_types";
import { AccessPolicyEngine } from "./access_policy_engine";

export class ExplorationPlanner {
  private counter = 0;

  plan(discovery: DiscoveryResult, policy: AccessPolicyEngine): ExplorationPlan {
    const steps: ExplorationStep[] = [];

    for (const src of discovery.candidate_sources) {
      const eval_ = policy.evaluate(src);
      if (!eval_.allowed) continue;
      steps.push({
        id: "step_" + (++this.counter).toString(16).padStart(6, "0"),
        source_type: src.type, url: src.url,
        priority: src.reliability, status: "planned", result_summary: null,
      });
    }

    steps.sort((a, b) => b.priority - a.priority);
    const totalCost = steps.length * 0.1;

    return {
      id: "plan_" + (++this.counter).toString(16).padStart(6, "0"),
      entity_name: discovery.entity_name, steps,
      total_estimated_cost: totalCost, created_at: new Date().toISOString(),
    };
  }
}
