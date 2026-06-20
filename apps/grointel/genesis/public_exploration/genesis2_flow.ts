// GENESIS-2 — Genesis2 Flow (complete pipeline)
import { DiscoveryResult, ExplorationPlan, ExtractedSignal } from "./exploration_types";
import { SourceCatalog } from "./source_catalog";
import { DiscoveryEngine } from "./discovery_engine";
import { AccessPolicyEngine } from "./access_policy_engine";
import { ExplorationPlanner } from "./exploration_planner";
import { SignalExtractionEngine } from "./signal_extraction_engine";
import { SourceReputationEngine } from "./source_reputation_engine";
import { ExplorationMemory } from "./exploration_memory";
import { ExplorationScheduler } from "./exploration_scheduler";

export class Genesis2Flow {
  public readonly catalog = new SourceCatalog();
  public readonly discovery = new DiscoveryEngine();
  public readonly policy = new AccessPolicyEngine();
  public readonly planner = new ExplorationPlanner();
  public readonly signals = new SignalExtractionEngine();
  public readonly reputation = new SourceReputationEngine();
  public readonly memory = new ExplorationMemory();
  public readonly scheduler = new ExplorationScheduler();

  explore(entityName: string, entityType: string): { discovery: DiscoveryResult; plan: ExplorationPlan; signals: ExtractedSignal[] } {
    const d = this.discovery.discover(entityName, entityType, this.catalog);
    const plan = this.planner.plan(d, this.policy);

    for (const src of d.candidate_sources) {
      this.reputation.getOrCreate(src.id, src);
      this.memory.record(entityName, src.type, src.url, "", 0);
    }

    const sigs = this.signals.extract(plan);
    for (const sig of sigs) {
      const src = d.candidate_sources.find(s => s.type === sig.source_type as any);
      if (src) this.reputation.recordSuccess(src.id);
    }

    return { discovery: d, plan, signals: sigs };
  }
}
