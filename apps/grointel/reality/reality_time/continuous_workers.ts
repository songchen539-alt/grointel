// AWAKENING-3 — Continuous Workers (event-driven, never sleep by timer)
import { ContinuousWorkerState, WorkerType, RealityEvent } from "./reality_time_types";
import { RealityEventBus } from "./reality_event_bus";

export class ContinuousWorker {
  public readonly id: string; public readonly type: WorkerType;
  public status: "idle" | "processing" | "waiting" | "error" = "idle";
  public eventsProcessed = 0; public lastEventAt: string | null = null; public uptimeEvents = 0;

  constructor(type: WorkerType, private bus: RealityEventBus) {
    this.id = `worker.${type}.${Math.random().toString(36).slice(2, 8)}`;
    this.type = type;
  }

  getState(): ContinuousWorkerState {
    return { id: this.id, type: this.type, status: this.status, events_processed: this.eventsProcessed, last_event_at: this.lastEventAt, uptime_events: this.uptimeEvents };
  }

  // Workers subscribe to relevant events and process them
  subscribeTo(eventType: string, handler: (event: RealityEvent) => void): void {
    this.bus.on(eventType, (event) => {
      this.status = "processing";
      this.eventsProcessed++;
      this.lastEventAt = event.timestamp;
      this.uptimeEvents++;
      handler(event);
      this.status = "idle";
    });
  }
}

export class ContinuousWorkerPool {
  public workers: ContinuousWorker[] = [];
  private bus: RealityEventBus;

  constructor(bus: RealityEventBus) {
    this.bus = bus;
    this.init();
  }

  private init(): void {
    for (const type of ["reality", "knowledge", "decision", "memory", "reflection", "evolution", "validation", "scheduler"] as WorkerType[]) {
      this.workers.push(new ContinuousWorker(type, this.bus));
    }
  }

  getActiveCount(): number { return this.workers.filter(w => w.status !== "idle").length; }
  getAll(): ContinuousWorkerState[] { return this.workers.map(w => w.getState()); }

  getWorker(type: WorkerType): ContinuousWorker | null { return this.workers.find(w => w.type === type) || null; }
}
