// GENESIS-2 — Exploration Scheduler
import { ExplorationMemoryEntry, ExplorationPlan } from "./exploration_types";
import { DiscoveryEngine } from "./discovery_engine";
import { SourceCatalog } from "./source_catalog";
import { ExplorationPlanner } from "./exploration_planner";
import { AccessPolicyEngine } from "./access_policy_engine";

export class ExplorationScheduler {
  scheduleStaleRefreshes(memory: ExplorationMemoryEntry[], discovery: DiscoveryEngine, catalog: SourceCatalog, planner: ExplorationPlanner, policy: AccessPolicyEngine): ExplorationPlan[] {
    const plans: ExplorationPlan[] = [];
    const seen = new Set<string>();

    for (const entry of memory) {
      if (seen.has(entry.entity_name)) continue;
      seen.add(entry.entity_name);
      const result = discovery.discover(entry.entity_name, "company", catalog);
      const plan = planner.plan(result, policy);
      if (plan.steps.length > 0) plans.push(plan);
    }

    return plans;
  }
}
