// GENESIS-1 — Event Bus
import { Event } from "./genesis_types";

export class EventBus {
  private subscribers: Map<string, Set<(event: Event) => void>> = new Map();

  readonly TOPICS = {
    RUNTIME_STARTED: "runtime.started",
    RUNTIME_TICK: "runtime.tick",
    RUNTIME_JOB_COMPLETED: "runtime.job.completed",
    OBSERVATION_FINISHED: "observation.finished",
    MEMORY_UPDATED: "memory.updated",
    DECISION_UPDATED: "decision.updated",
    KNOWLEDGE_REVISED: "knowledge.revised",
    WORLD_UPDATED: "world.updated",
    CONNECTOR_FINISHED: "connector.finished",
    LIFE_COMPLETED: "life.completed",
    CONNECTOR_FAILED: "connector.failed",
    RUNTIME_STOPPED: "runtime.stopped",
  };

  publish(topic: string, data: Record<string, unknown> = {}): void {
    const event: Event = { topic, data, timestamp: new Date().toISOString() };
    const subs = this.subscribers.get(topic);
    if (subs) for (const cb of subs) cb(event);
  }

  subscribe(topic: string, callback: (event: Event) => void): void {
    if (!this.subscribers.has(topic)) this.subscribers.set(topic, new Set());
    this.subscribers.get(topic)!.add(callback);
  }

  unsubscribe(topic: string, callback: (event: Event) => void): void {
    this.subscribers.get(topic)?.delete(callback);
  }

  subscriberCount(topic: string): number { return this.subscribers.get(topic)?.size || 0; }
}
