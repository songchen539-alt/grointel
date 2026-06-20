// GroIntel ROS-1 — Workflow Scheduler (abstraction, no background execution)
import { WorkflowInstance } from "./workflow_types";

export type ScheduleMode = "run_now" | "run_after" | "run_every" | "wait_until_condition" | "wait_for_event" | "timeout";

export interface ScheduleRequest {
  id: string;
  mode: ScheduleMode;
  instance_id: string;
  delay_ms: number;
  condition: string | null;
  event: string | null;
  interval_ms: number;
  created_at: string;
}

let sCounter = 0;
function genId(): string { return "sch_" + (++sCounter).toString(16).padStart(6, "0"); }

export class WorkflowScheduler {
  private requests: ScheduleRequest[] = [];

  runNow(instanceId: string): ScheduleRequest {
    const req: ScheduleRequest = {
      id: genId(), mode: "run_now", instance_id: instanceId,
      delay_ms: 0, condition: null, event: null, interval_ms: 0,
      created_at: new Date().toISOString(),
    };
    this.requests.push(req);
    return req;
  }

  runAfter(instanceId: string, delayMs: number): ScheduleRequest {
    const req: ScheduleRequest = {
      id: genId(), mode: "run_after", instance_id: instanceId,
      delay_ms: delayMs, condition: null, event: null, interval_ms: 0,
      created_at: new Date().toISOString(),
    };
    this.requests.push(req);
    return req;
  }

  runEvery(instanceId: string, intervalMs: number): ScheduleRequest {
    const req: ScheduleRequest = {
      id: genId(), mode: "run_every", instance_id: instanceId,
      delay_ms: 0, condition: null, event: null, interval_ms: intervalMs,
      created_at: new Date().toISOString(),
    };
    this.requests.push(req);
    return req;
  }

  waitUntilCondition(instanceId: string, condition: string): ScheduleRequest {
    const req: ScheduleRequest = {
      id: genId(), mode: "wait_until_condition", instance_id: instanceId,
      delay_ms: 0, condition, event: null, interval_ms: 0,
      created_at: new Date().toISOString(),
    };
    this.requests.push(req);
    return req;
  }

  waitForEvent(instanceId: string, event: string): ScheduleRequest {
    const req: ScheduleRequest = {
      id: genId(), mode: "wait_for_event", instance_id: instanceId,
      delay_ms: 0, condition: null, event, interval_ms: 0,
      created_at: new Date().toISOString(),
    };
    this.requests.push(req);
    return req;
  }

  setTimeout(instanceId: string, timeoutMs: number): ScheduleRequest {
    const req: ScheduleRequest = {
      id: genId(), mode: "timeout", instance_id: instanceId,
      delay_ms: timeoutMs, condition: null, event: null, interval_ms: 0,
      created_at: new Date().toISOString(),
    };
    this.requests.push(req);
    return req;
  }

  getRequests(): ScheduleRequest[] { return this.requests; }
  cancelRequest(id: string): void { this.requests = this.requests.filter(r => r.id !== id); }
}
