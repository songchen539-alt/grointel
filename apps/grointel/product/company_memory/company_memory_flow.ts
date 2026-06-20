// GroIntel PRODUCT-2 — Company Memory Flow (main orchestrator)
import { CompanyMemory, CompanyRealitySnapshot, DecisionMemory, RealityDiff, DecisionConfidenceUpdate, LivingWorkspaceState, CompanyMemoryTimeline } from "./company_memory_types";
import { GrowthDecisionRequest, GrowthDecisionReport } from "../growth_decision_types";
import { CompanyMemoryStore } from "./company_memory_store";
import { RealitySnapshotBuilder } from "./reality_snapshot_builder";
import { DecisionMemoryBuilder } from "./decision_memory_builder";
import { RealityDiffEngine } from "./reality_diff_engine";
import { DecisionConfidenceUpdater } from "./decision_confidence_updater";
import { GrowthDecisionFlow } from "../growth_decision_flow";

export class CompanyMemoryFlow {
  public readonly store = new CompanyMemoryStore();
  public readonly snapBuilder = new RealitySnapshotBuilder();
  public readonly decisionBuilder = new DecisionMemoryBuilder();
  public readonly diffEngine = new RealityDiffEngine();
  public readonly confidenceUpdater = new DecisionConfidenceUpdater();
  public readonly decisionFlow = new GrowthDecisionFlow();

  createFromRequest(req: GrowthDecisionRequest): { memory: CompanyMemory; report: GrowthDecisionReport } {
    const report = this.decisionFlow.run(req);
    const snapshot = this.snapBuilder.build(req.company_website, req.growth_goal, req.target_market, req.budget_range, req.timeline, req.constraints, report.company, report.goal);
    const decision = this.decisionBuilder.build(report, snapshot);
    const memory = this.store.create(req.company_website, report.company.company_domain, { name: report.company.company_domain, website: req.company_website, industry: report.company.industry, region: report.company.region, stage: report.company.stage, confidence: report.company.confidence }, snapshot);
    this.store.appendDecision(memory, decision);
    return { memory, report };
  }

  update(memoryId: string, newReq: GrowthDecisionRequest): { memory: CompanyMemory; report: GrowthDecisionReport; diff: RealityDiff; confidence: DecisionConfidenceUpdate } | null {
    const mem = this.store.get(memoryId);
    if (!mem) return null;

    const oldSnapshot = mem.current_snapshot;
    const report = this.decisionFlow.run(newReq);
    const newSnapshot = this.snapBuilder.build(newReq.company_website, newReq.growth_goal, newReq.target_market, newReq.budget_range, newReq.timeline, newReq.constraints, report.company, report.goal);

    const diff = this.diffEngine.diff(oldSnapshot, newSnapshot);
    this.store.appendSnapshot(mem, newSnapshot);

    if (mem.decisions.length > 0) {
      const lastDecision = mem.decisions[mem.decisions.length - 1];
      const confidence = this.confidenceUpdater.update(lastDecision, diff);
      return { memory: mem, report, diff, confidence };
    }

    const newDecision = this.decisionBuilder.build(report, newSnapshot);
    this.store.appendDecision(mem, newDecision);
    return { memory: mem, report, diff, confidence: { decision_id: newDecision.decision_id, previous_confidence: 0, new_confidence: 0, delta: 0, direction: "unchanged", reason: "First decision after update", updated_at: new Date().toISOString() } };
  }

  getState(memoryId: string): LivingWorkspaceState | null {
    const mem = this.store.get(memoryId);
    if (!mem) return null;
    const decisions = mem.decisions;
    const lastDecision = decisions.length > 0 ? decisions[decisions.length - 1] : null;
    const timeline: CompanyMemoryTimeline = {
      memory_id: mem.id, events: mem.timeline, snapshot_count: mem.decisions.length,
      decision_count: mem.decision_count,
      first_event: mem.timeline.length > 0 ? mem.timeline[0].timestamp : mem.created_at,
      last_event: mem.timeline.length > 0 ? mem.timeline[mem.timeline.length - 1].timestamp : mem.updated_at,
    };
    return { memory: mem, latest_snapshot: mem.current_snapshot, latest_decision: lastDecision, diff: null, confidence_update: null, timeline };
  }
}
