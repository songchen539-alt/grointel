// GroIntel ROS-1 — Workflow Registry
import { WorkflowDefinition } from "./workflow_types";

export class WorkflowRegistry {
  private definitions: Map<string, WorkflowDefinition> = new Map();

  register(def: WorkflowDefinition): void {
    if (this.definitions.has(def.id)) {
      throw new Error(`Workflow definition '${def.id}' already registered`);
    }
    this.definitions.set(def.id, def);
  }

  get(id: string): WorkflowDefinition | null {
    return this.definitions.get(id) || null;
  }

  getAll(): WorkflowDefinition[] {
    return Array.from(this.definitions.values());
  }

  exists(id: string): boolean {
    return this.definitions.has(id);
  }

  unregister(id: string): void {
    this.definitions.delete(id);
  }

  count(): number { return this.definitions.size; }
}
