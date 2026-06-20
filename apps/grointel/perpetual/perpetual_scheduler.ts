// GroIntel PGIR-1 — Perpetual Scheduler (idle-aware)
import { LivingWorldModel } from "./living_world_model";

export class PerpetualScheduler {
  private idle = true;
  private cycles = 0;

  get isIdle(): boolean { return this.idle; }

  wake(): void { this.idle = false; }
  setIdle(): void { this.idle = true; }

  nextCycle(): number { return ++this.cycles; }
  getCycles(): number { return this.cycles; }

  shouldProcess(model: LivingWorldModel): boolean {
    return !this.idle && model.state.events_processed > 0;
  }

  idleEfficiently(): void {
    // In a real system, this would use micro-task scheduling
    this.idle = true;
  }

  resumeOnEvent(): void {
    this.idle = false;
  }
}
