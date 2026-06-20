// GENESIS-1 — Kernel Event Log
import { KernelEvent } from "./genesis_types";

export class KernelEventLog {
  private entries: KernelEvent[] = [];
  private counter = 0;

  record(event: string, details: string): KernelEvent {
    const e: KernelEvent = { id: "ke_" + (++this.counter).toString(16).padStart(6, "0"), event, details, timestamp: new Date().toISOString() };
    this.entries.push(e); return e;
  }

  getAll(): KernelEvent[] { return this.entries; }
  getRecent(limit = 15): KernelEvent[] { return this.entries.slice(-limit).reverse(); }
  findByEvent(event: string): KernelEvent[] { return this.entries.filter(e => e.event === event); }
  count(): number { return this.entries.length; }
}
