// OPERATION-1 — Worker Service Base
import { WorkerService, WorkerType, WorkerStatus, ComponentState } from "../operation_types";

export class WorkerServiceBase {
  public readonly id: string; public readonly type: WorkerType;
  public status: WorkerStatus = "idle"; public health: ComponentState = "healthy";
  public uptimeMs = 0; public tasksCompleted = 0; public errors = 0; public restarts = 0;
  public currentTask: string | null = null; public lastHeartbeat: string;
  public startedAt: string;

  private startTime: number | null = null;

  constructor(type: WorkerType) {
    this.id = `worker.${type}.${Math.random().toString(36).slice(2, 8)}`;
    this.type = type;
    this.startedAt = new Date().toISOString();
    this.lastHeartbeat = this.startedAt;
  }

  start(): void { this.status = "idle"; this.startedAt = new Date().toISOString(); this.startTime = Date.now(); this.health = "healthy"; this.heartbeat(); }
  stop(): void { this.status = "stopped"; if (this.startTime) this.uptimeMs += Date.now() - this.startTime; this.startTime = null; }

  heartbeat(): void { this.lastHeartbeat = new Date().toISOString(); if (this.startTime) this.uptimeMs = Date.now() - this.startTime; }

  execute(task: string): void { this.currentTask = task; this.status = "running"; this.heartbeat(); }
  complete(): void { this.tasksCompleted++; this.currentTask = null; this.status = "idle"; this.heartbeat(); }
  fail(error: string): void { this.errors++; this.currentTask = null; this.status = "failed"; this.heartbeat(); if (this.errors > 10) this.health = "degraded"; }

  getInfo(): WorkerService {
    if (this.startTime) this.uptimeMs = Date.now() - this.startTime;
    return { id: this.id, type: this.type, status: this.status, health: this.health, uptime_ms: this.uptimeMs, started_at: this.startedAt, last_heartbeat: this.lastHeartbeat, current_task: this.currentTask, tasks_completed: this.tasksCompleted, errors: this.errors, restarts: this.restarts };
  }
}
