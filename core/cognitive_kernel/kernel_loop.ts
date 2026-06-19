// GroIntel Cognitive Kernel — Kernel Loop
// The root cognitive loop: RealityEvent -> Observation -> ... -> RealityFidelityUpdate
import { CognitiveKernel } from "./kernel";
import { EventType, RealityFidelityScore, Prediction, ContradictionRecord, Feedback, LearningRecord } from "./kernel_types";

function generateId(): string {
  return "kloop_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
}

export class KernelLoop {
  private kernel: CognitiveKernel;
  private running: boolean = false;
  private cycleCount: number = 0;
  private loopTimer: ReturnType<typeof setInterval> | null = null;

  constructor(kernel: CognitiveKernel) {
    this.kernel = kernel;
  }

  async start(intervalMs = 100): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.kernel.logger.info("KernelLoop", "Loop started", { interval_ms: intervalMs });

    // Single cycle immediately, then continuous loop
    await this.cycle();
    this.loopTimer = setInterval(() => this.cycle(), intervalMs);
  }

  stop(): void {
    this.running = false;
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    this.kernel.logger.info("KernelLoop", "Loop stopped");
  }

  async cycle(): Promise<void> {
    if (!this.running) return;

    const startTime = Date.now();
    this.cycleCount++;

    // 1. Process pending events from event bus
    const pendingEvents = this.kernel.eventBus.getHistory();
    if (pendingEvents.length > 0) {
      for (const event of pendingEvents.slice(-5)) {
        await this.processEvent(event.type, event);
      }
    }

    // 2. Calculate reality fidelity periodically
    if (this.cycleCount % 10 === 0) {
      const fidelity = this.calculateRealityFidelity();
      this.kernel.state.updateRealityFidelity(fidelity);

      const metrics = this.kernel.metrics.calculateFromFidelity(fidelity);
      this.kernel.metrics.record(metrics);
    }

    // 3. Update kernel state
    this.kernel.state.updateMemoryIndexSize(this.kernel.memory.getRecordCount());

    const elapsed = Date.now() - startTime;
    if (elapsed > 1000) {
      this.kernel.logger.warn("KernelLoop", "Slow cycle", { elapsed_ms: elapsed, cycle: this.cycleCount });
    }
  }

  private async processEvent(eventType: EventType, event: any): Promise<void> {
    switch (eventType) {
      case "OBSERVATION_RECEIVED":
        await this.kernel.emit("MEMORY_UPDATED", event.payload, "observation", event.confidence);
        break;
      case "MEMORY_UPDATED":
        await this.kernel.emit("REASONING_COMPLETED", event.payload, "observation", event.confidence);
        break;
      case "CONTRADICTION_DETECTED":
        this.kernel.logger.info("KernelLoop", "Contradiction detected", event.payload);
        break;
      case "FEEDBACK_RECEIVED":
        await this.kernel.emit("LEARNING_COMPLETED", event.payload, "feedback", event.confidence);
        break;
      default:
        break;
    }
  }

  private calculateRealityFidelity(): RealityFidelityScore {
    const totalMemory = this.kernel.memory.getRecordCount();
    const totalErrors = this.kernel.logger.getErrorCount();
    const totalEvents = this.kernel.eventBus.getEventCount();

    const evidenceStrength = Math.min(100, totalMemory > 0 ? Math.round((totalMemory / Math.max(1, totalMemory + totalErrors)) * 100) : 0);
    const sourceQuality = Math.min(100, totalEvents > 0 ? Math.round((totalEvents - totalErrors) / totalEvents * 100) : 50);
    const freshness = 100;
    const contradictionRate = totalErrors > 0 ? Math.max(0, 100 - totalErrors * 5) : 100;
    const predictionAccuracy = 0;
    const crossValidation = evidenceStrength > 50 ? 50 : 20;
    const uncertainty = Math.max(0, 100 - evidenceStrength);

    const overall = Math.round(
      (evidenceStrength * 0.25 + sourceQuality * 0.2 + freshness * 0.1 +
        contradictionRate * 0.15 + predictionAccuracy * 0.15 + crossValidation * 0.1 +
        (100 - uncertainty) * 0.05)
    );

    return {
      overall,
      components: {
        evidence_strength: evidenceStrength,
        source_quality: sourceQuality,
        freshness,
        contradiction_rate: contradictionRate,
        prediction_accuracy: predictionAccuracy,
        cross_validation: crossValidation,
        uncertainty,
      },
      confidence: Math.round(overall * 0.8),
      missing_evidence: [],
      recommended_next_observation: [],
      calculated_at: new Date().toISOString(),
    };
  }

  getCycleCount(): number {
    return this.cycleCount;
  }
}
