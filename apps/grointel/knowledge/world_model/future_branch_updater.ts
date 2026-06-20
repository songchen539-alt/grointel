// GroIntel KNOWLEDGE-1 — Future Branch Updater
import { FutureStateSpaceManager } from "./future_state_space";

export class FutureBranchUpdater {
  updateOnRealityChange(spaces: FutureStateSpaceManager, triggerType: string): number {
    let changes = 0;
    for (const space of spaces.getAll()) {
      for (const branch of space.branches) {
        if (branch.trigger_conditions.includes(triggerType)) {
          spaces.updateProbability(space.id, branch.id, Math.min(100, branch.probability + 10));
          changes++;
        }
      }
    }
    return changes;
  }
}
