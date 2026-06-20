// GroIntel ROS-3 — Agent Lifecycle
import { LifecycleState } from "./agent_types";

const ALLOWED: Map<LifecycleState, LifecycleState[]> = new Map([
  ["created", ["booting"]],
  ["booting", ["idle"]],
  ["idle", ["observing", "terminated", "paused"]],
  ["observing", ["reasoning", "idle"]],
  ["reasoning", ["planning", "idle"]],
  ["planning", ["waiting", "sleeping", "idle"]],
  ["waiting", ["idle"]],
  ["sleeping", ["idle"]],
  ["paused", ["idle", "terminated"]],
  ["terminated", []],
]);

export class AgentLifecycleManager {
  canTransition(from: LifecycleState, to: LifecycleState): boolean {
    return ALLOWED.get(from)?.includes(to) || false;
  }

  transition(from: LifecycleState, to: LifecycleState): LifecycleState {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid agent lifecycle transition: ${from} -> ${to}`);
    }
    return to;
  }

  private cycleSteps: LifecycleState[] = ["observing", "reasoning", "planning"];

  nextCycleStep(current: LifecycleState): LifecycleState | null {
    const idx = this.cycleSteps.indexOf(current);
    if (idx < 0 || idx >= this.cycleSteps.length - 1) return null;
    return this.cycleSteps[idx + 1];
  }

  getCycleSteps(): LifecycleState[] { return this.cycleSteps; }
}
