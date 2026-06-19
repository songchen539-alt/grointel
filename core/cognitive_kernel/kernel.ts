// GroIntel Cognitive Kernel — Main Kernel
import { KernelConfig, RealityEvent, EventType, SignalSource, RealityFidelityScore, KernelState } from "./kernel_types";
import { KernelEventBus } from "./kernel_event";
import { KernelStateManager } from "./kernel_state";
import { KernelMemory } from "./kernel_memory";
import { KernelRegistry } from "./kernel_registry";
import { KernelMetricsCollector } from "./kernel_metrics";
import { KERNEL_POLICY } from "./kernel_policy";
import { KernelLogger } from "./kernel_logger";

let eventCounter = 0;

function generateId(): string {
  return "kev_" + (++eventCounter).toString(16).padStart(8, "0") + "_" + Date.now().toString(36);
}

export class CognitiveKernel {
  public readonly config: KernelConfig;
  public readonly eventBus: KernelEventBus;
  public readonly state: KernelStateManager;
  public readonly memory: KernelMemory;
  public readonly registry: KernelRegistry;
  public readonly metrics: KernelMetricsCollector;
  public readonly policy: typeof KERNEL_POLICY;
  public readonly logger: KernelLogger;

  private isRunning: boolean = false;
  private loopInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config?: Partial<KernelConfig>) {
    this.config = {
      kernel_id: generateId(),
      kernel_version: "1.0.0",
      created_at: new Date().toISOString(),
      reality_fidelity_threshold: 30,
      prediction_validation_enabled: true,
      auto_contradiction_detection: true,
      ...config,
    };

    this.eventBus = new KernelEventBus();
    this.state = new KernelStateManager(this.config.kernel_id);
    this.memory = new KernelMemory();
    this.registry = new KernelRegistry();
    this.metrics = new KernelMetricsCollector();
    this.policy = KERNEL_POLICY;
    this.logger = new KernelLogger();

    this.logger.info("Kernel", "Cognitive Kernel initialized", {
      kernel_id: this.config.kernel_id,
      version: this.config.kernel_version,
    });
  }

  async emit(eventType: EventType, payload: unknown, source: SignalSource = "observation", confidence = 100): Promise<void> {
    const event: RealityEvent = {
      id: generateId(),
      type: eventType,
      source,
      payload,
      confidence,
      timestamp: new Date().toISOString(),
      trace_id: generateId(),
    };

    this.logger.debug("Kernel", `Event: ${eventType}`, { eventId: event.id, source });
    this.state.incrementEvents();
    await this.eventBus.emit(event);
  }

  async registerModule(name: string, version: string, capabilities: string[],
    inputEvents: EventType[], outputEvents: EventType[]): Promise<void> {
    this.registry.register({
      name, version, capabilities,
      input_events: inputEvents,
      output_events: outputEvents,
      health_status: "healthy",
      last_run_at: null,
      error_count: 0,
    });
    this.logger.info("Kernel", `Module registered: ${name} v${version}`, { capabilities });
  }

  async start(loopIntervalMs = 1000): Promise<void> {
    if (this.isRunning) {
      this.logger.warn("Kernel", "Kernel already running");
      return;
    }

    this.isRunning = true;
    this.state.setStatus("running");

    await this.emit("KERNEL_INITIALIZED", {
      kernel_id: this.config.kernel_id,
      version: this.config.kernel_version,
      started_at: new Date().toISOString(),
    }, "observation", 100);

    this.logger.info("Kernel", "Kernel started", {
      kernel_id: this.config.kernel_id,
      loop_interval_ms: loopIntervalMs,
    });
  }

  stop(): void {
    this.isRunning = false;
    this.state.setStatus("paused");
    this.logger.info("Kernel", "Kernel stopped");
  }

  getState(): KernelState {
    return this.state.getSnapshot();
  }

  getUptime(): number {
    return this.state.getSnapshot().uptime_seconds;
  }

  isHealthy(): boolean {
    const state = this.state.getState();
    return state.status === "running" && this.logger.getErrorCount() < 100;
  }
}
