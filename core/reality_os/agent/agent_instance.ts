// GroIntel ROS-3 — Agent Instance Manager
import { AgentInstance, LifecycleState } from "./agent_types";

export class AgentInstanceManager {
  private instances: Map<string, AgentInstance> = new Map();
  register(agent: AgentInstance): void { this.instances.set(agent.identity.id, agent); }
  get(id: string): AgentInstance | null { return this.instances.get(id) || null; }
  getAll(): AgentInstance[] { return Array.from(this.instances.values()); }
  remove(id: string): void { this.instances.delete(id); }
  count(): number { return this.instances.size; }
  updateState(agent: AgentInstance, state: LifecycleState): void {
    agent.state = state; agent.updated_at = new Date().toISOString();
  }
}
