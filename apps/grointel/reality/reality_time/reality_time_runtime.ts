// AWAKENING-3 — Reality Time Runtime (continuous, event-driven existence)
import { RealityEventBus } from "./reality_event_bus";
import { RealityHeartbeatGenerator } from "./reality_heartbeat";
import { ContinuousWorkerPool } from "./continuous_workers";
import { WorldUnderstandingCalculator } from "./world_understanding_index";
import { RealityHeartbeat, AttentionDrivenSchedule, WorldUnderstandingIndex } from "./reality_time_types";
import { RealityEngine } from "../engine/reality_engine";

export class RealityTimeRuntime {
  public readonly bus = new RealityEventBus();
  public readonly heartbeat = new RealityHeartbeatGenerator();
  public readonly workers: ContinuousWorkerPool;
  public readonly wuCalc = new WorldUnderstandingCalculator();
  public readonly engine = new RealityEngine();

  public wuIndex: WorldUnderstandingIndex;
  public heartbeatState: RealityHeartbeat | null = null;
  public attentionScores: AttentionDrivenSchedule[] = [];

  constructor() {
    this.workers = new ContinuousWorkerPool(this.bus);
    this.wuIndex = this.wuCalc.calculate(10, 0, 30, 0, 0, 0, 0, 0, 10);
    this.connectWorkers();
  }

  private connectWorkers(): void {
    // Knowledge worker — processes reality observations
    const kw = this.workers.getWorker("knowledge");
    if (kw) kw.subscribeTo("website_fetched", (event) => {
      this.bus.emit("knowledge_updated", event.entity, event.entity_type, "knowledge_worker",
        event.confidence, "medium", `Knowledge processed for ${event.entity}`, 5, 2, 3, {});
    });

    // Decision worker — updates decisions based on knowledge
    const dw = this.workers.getWorker("decision");
    if (dw) dw.subscribeTo("knowledge_updated", (event) => {
      this.bus.emit("decision_updated", event.entity, event.entity_type, "decision_worker",
        event.confidence, "low", `Decision updated for ${event.entity}`, 0, 5, 2, {});
    });

    // Memory worker — stores reality memory
    const mw = this.workers.getWorker("memory");
    if (mw) mw.subscribeTo("knowledge_updated", () => {
      this.bus.emit("memory_stored", "system", "system", "memory_worker", 80, "low", "Memory stored", 0, 0, 1, {});
    });

    // Reflection worker — reflects on processed events
    const rw = this.workers.getWorker("reflection");
    if (rw) rw.subscribeTo("decision_updated", (event) => {
      this.bus.emit("reflection_completed", event.entity, event.entity_type, "reflection_worker",
        70, "low", `Reflection on ${event.entity}`, 2, 1, 1, {});
    });
  }

  async cycleOnce(): Promise<{ event: any; heartbeat: RealityHeartbeat }> {
    // 1. Run one reality observation
    const obsResult = await this.engine.cycle();

    if (obsResult.target) {
      // 2. Emit reality event
      this.bus.emit("website_fetched", obsResult.target.name, "company", "reality_worker",
        70, obsResult.signals > 0 ? "medium" : "low",
        `Observed ${obsResult.target.website}: ${obsResult.signals} signals, ${obsResult.snapshots} snapshots`,
        obsResult.signals, obsResult.signals > 0 ? 1 : 0, 1,
        { signals: obsResult.signals, snapshots: obsResult.snapshots, diffs: obsResult.diffs });
    }

    // 3. Update world understanding
    const cov = this.engine.getCoverage();
    this.wuIndex = this.wuCalc.calculate(
      cov.companies_observed, cov.evidence_generated, 30,
      70, 65, cov.diffs_detected, cov.snapshots_stored > 0 ? 50 : 0,
      cov.industries_covered, cov.companies_observed
    );

    // 4. Generate heartbeat
    const attDist: Record<string, number> = {};
    for (const t of this.engine.targets.getAll()) {
      attDist[t.name] = t.attention_score;
    }
    this.heartbeatState = this.heartbeat.generate(this.bus, this.workers.getActiveCount(), attDist, this.wuIndex);

    return { event: obsResult, heartbeat: this.heartbeatState };
  }

  getWorkers() { return this.workers.getAll(); }
  getRecentEvents(limit = 50) { return this.bus.getRecent(limit); }
}
