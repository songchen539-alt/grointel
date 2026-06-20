// GENESIS-1 — Living Kernel (central orchestrator)
import { KernelState, AttentionTopic, SchedulerPlan, EnergyBudget, WorldCycle, KernelMetrics } from "./genesis_types";
import { EventBus } from "./event_bus";
import { AutonomousScheduler } from "./autonomous_scheduler";
import { AttentionManager } from "./attention_manager";
import { EnergyManager } from "./energy_manager";
import { WorldClock } from "./world_clock";
import { KernelMetricsTracker } from "./kernel_metrics";
import { KernelEventLog } from "./kernel_event_log";

export class LivingKernel {
  public readonly bus = new EventBus();
  public readonly scheduler = new AutonomousScheduler();
  public readonly attention = new AttentionManager();
  public readonly energy = new EnergyManager();
  public readonly clock = new WorldClock();
  public readonly metrics = new KernelMetricsTracker();
  public readonly events = new KernelEventLog();

  private _state: KernelState = "created";
  private _attentionTargets: AttentionTopic[] = [];

  get state(): KernelState { return this._state; }
  get attentionTargets(): AttentionTopic[] { return [...this._attentionTargets]; }

  startKernel(): void {
    if (this._state === "running") return;
    this._state = "running";
    this.bus.publish(this.bus.TOPICS.RUNTIME_STARTED, {});
    this.events.record("kernel_started", "Living Kernel started");
  }

  stopKernel(): void {
    if (this._state === "stopped") return;
    this._state = "stopped";
    this.bus.publish(this.bus.TOPICS.RUNTIME_STOPPED, {});
    this.events.record("kernel_stopped", "Living Kernel stopped");
  }

  pauseKernel(): void {
    if (this._state !== "running") return;
    this._state = "paused";
    this.events.record("kernel_paused", "Living Kernel paused");
  }

  resumeKernel(): void {
    if (this._state !== "paused") return;
    this._state = "running";
    this.events.record("kernel_resumed", "Living Kernel resumed");
  }

  runAttention(entities: { id: string; recent_changes: number; confidence_drop: number; hypothesis_count: number; observation_freshness: number; signal_volatility: number }[]): AttentionTopic[] {
    this._attentionTargets = this.attention.score(entities);
    this.metrics.recordAttentionShift();
    this.events.record("attention_changed", `${this._attentionTargets.length} targets scored`);
    return this._attentionTargets;
  }

  runScheduler(attentionTopics: AttentionTopic[], pendingQuestions: number, activeHypotheses: number, staleMemories: number): SchedulerPlan[] {
    if (this.energy.getBudget().pressure === "critical" && this.energy.getBudget().remaining < 10) {
      this.events.record("energy_reduced", "Skipping scheduler: energy low");
      return [];
    }
    const plans = this.scheduler.createJobs(attentionTopics, pendingQuestions, activeHypotheses, staleMemories);
    this.events.record("scheduler_created_jobs", `${plans.length} jobs created`);
    this.energy.consume(plans.length * 5);
    return plans;
  }

  kernelStatus(): { state: KernelState; attention: AttentionTopic[]; energy: EnergyBudget; world: WorldCycle; metrics: KernelMetrics; eventCount: number; subscriberCount: number } {
    const subCount = Object.values(this.bus.TOPICS).reduce((s, t) => s + this.bus.subscriberCount(t), 0);
    return { state: this._state, attention: this._attentionTargets, energy: this.energy.getBudget(), world: this.clock.get(), metrics: this.metrics.get(), eventCount: this.events.count(), subscriberCount: subCount };
  }
}
