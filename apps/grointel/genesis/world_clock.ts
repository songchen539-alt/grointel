// GENESIS-1 — World Clock
import { WorldCycle } from "./genesis_types";

export class WorldClock {
  private cycle: WorldCycle = { cycle_count: 0, last_observation_cycle: 0, last_learning_cycle: 0, last_decision_cycle: 0, last_world_update: 0 };

  tickObservation(): void { this.cycle.cycle_count++; this.cycle.last_observation_cycle = this.cycle.cycle_count; }
  tickLearning(): void { this.cycle.last_learning_cycle = this.cycle.cycle_count; }
  tickDecision(): void { this.cycle.last_decision_cycle = this.cycle.cycle_count; }
  tickWorldUpdate(): void { this.cycle.last_world_update = this.cycle.cycle_count; }
  get(): WorldCycle { return { ...this.cycle }; }
}
