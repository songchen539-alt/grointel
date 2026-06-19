// GroIntel Cognitive Kernel — Module Registry
import { ModuleRegistration, EventType } from "./kernel_types";

export class KernelRegistry {
  private modules: Map<string, ModuleRegistration> = new Map();

  register(registration: ModuleRegistration): void {
    this.modules.set(registration.name, {
      ...registration,
      last_run_at: null,
      error_count: 0,
    });
  }

  unregister(name: string): boolean {
    return this.modules.delete(name);
  }

  get(name: string): ModuleRegistration | null {
    return this.modules.get(name) || null;
  }

  getAll(): ModuleRegistration[] {
    return Array.from(this.modules.values());
  }

  getByInputEvent(eventType: EventType): ModuleRegistration[] {
    return this.getAll().filter(m => m.input_events.includes(eventType));
  }

  getByOutputEvent(eventType: EventType): ModuleRegistration[] {
    return this.getAll().filter(m => m.output_events.includes(eventType));
  }

  updateHealth(name: string, health: ModuleRegistration["health_status"]): void {
    const mod = this.modules.get(name);
    if (mod) {
      mod.health_status = health;
      mod.last_run_at = new Date().toISOString();
    }
  }

  incrementError(name: string): void {
    const mod = this.modules.get(name);
    if (mod) {
      mod.error_count++;
    }
  }

  isRegistered(name: string): boolean {
    return this.modules.has(name);
  }

  getModuleCount(): number {
    return this.modules.size;
  }
}
