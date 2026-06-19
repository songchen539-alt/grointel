// GroIntel Cognitive Kernel — Event Bus
import { EventType, RealityEvent } from "./kernel_types";

type EventHandler = (event: RealityEvent) => void | Promise<void>;

export class KernelEventBus {
  private listeners: Map<EventType, EventHandler[]> = new Map();
  private history: RealityEvent[] = [];
  private maxHistory: number;
  private eventCount: number = 0;

  constructor(maxHistory = 10000) {
    this.maxHistory = maxHistory;
  }

  on(eventType: EventType, handler: EventHandler): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(handler);
  }

  off(eventType: EventType, handler: EventHandler): void {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx >= 0) handlers.splice(idx, 1);
    }
  }

  async emit(event: RealityEvent): Promise<void> {
    this.eventCount++;
    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    const handlers = this.listeners.get(event.type);
    if (handlers) {
      const promises = handlers.map(h => {
        try {
          const result = h(event);
          if (result instanceof Promise) return result;
        } catch (e) {
          console.error(`[KernelEventBus] Handler error for ${event.type}:`, e);
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
    }
  }

  getEventCount(): number {
    return this.eventCount;
  }

  getHistory(eventType?: EventType): RealityEvent[] {
    if (eventType) return this.history.filter(e => e.type === eventType);
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}
