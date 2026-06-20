// GroIntel ROS-3 — Agent Trace
import { AgentTrace, AgentInstance, LifecycleState } from "./agent_types";

let tCounter = 0;
function genId(): string { return "agt_" + (++tCounter).toString(16).padStart(6, "0"); }

export class AgentTraceRecorder {
  private traces: Map<string, AgentTrace[]> = new Map();

  create(agent: AgentInstance, cycle: number): AgentTrace {
    const now = new Date().toISOString();
    const trace: AgentTrace = {
      id: genId(), agent_id: agent.identity.id, cycle, state: agent.state,
      actions: [], sdk_calls: [], errors: [],
      started_at: now, completed_at: now,
    };
    const list = this.traces.get(agent.identity.id) || [];
    list.push(trace);
    this.traces.set(agent.identity.id, list);
    return trace;
  }

  recordAction(t: AgentTrace, action: string, result: string, durationMs: number): void {
    t.actions = [...t.actions, { action, result, duration_ms: durationMs }];
  }

  recordSDKCall(t: AgentTrace, method: string, success: boolean, durationMs: number): void {
    t.sdk_calls = [...t.sdk_calls, { method, success, duration_ms: durationMs }];
  }

  recordError(t: AgentTrace, message: string): void {
    t.errors = [...t.errors, { message, at: new Date().toISOString() }];
  }

  getTraces(agentId: string): AgentTrace[] { return this.traces.get(agentId) || []; }
  getLatest(agentId: string): AgentTrace | null {
    const list = this.traces.get(agentId);
    return list && list.length > 0 ? list[list.length - 1] : null;
  }
}
