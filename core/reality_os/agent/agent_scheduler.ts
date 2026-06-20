// GroIntel ROS-3 — Agent Scheduler
import { AgentInstance, LifecycleState } from "./agent_types";

export type WakeReason = "continuous" | "scheduled" | "event" | "goal" | "workflow";

export interface WakeCall {
  agent_id: string;
  reason: WakeReason;
  at: string;
}

export class AgentScheduler {
  private wakeQueue: WakeCall[] = [];

  scheduleContinuous(agentId: string): WakeCall {
    const wc: WakeCall = { agent_id: agentId, reason: "continuous", at: new Date().toISOString() };
    this.wakeQueue.push(wc);
    return wc;
  }

  scheduleWake(agentId: string, delayMs: number): WakeCall {
    const wc: WakeCall = { agent_id: agentId, reason: "scheduled", at: new Date(Date.now() + delayMs).toISOString() };
    this.wakeQueue.push(wc);
    return wc;
  }

  scheduleEventWake(agentId: string): WakeCall {
    const wc: WakeCall = { agent_id: agentId, reason: "event", at: new Date().toISOString() };
    this.wakeQueue.push(wc);
    return wc;
  }

  scheduleGoalWake(agentId: string): WakeCall {
    const wc: WakeCall = { agent_id: agentId, reason: "goal", at: new Date().toISOString() };
    this.wakeQueue.push(wc);
    return wc;
  }

  scheduleWorkflowWake(agentId: string): WakeCall {
    const wc: WakeCall = { agent_id: agentId, reason: "workflow", at: new Date().toISOString() };
    this.wakeQueue.push(wc);
    return wc;
  }

  getPendingWakes(): WakeCall[] { return this.wakeQueue; }
  clear(agentId: string): void { this.wakeQueue = this.wakeQueue.filter(w => w.agent_id !== agentId); }
}
