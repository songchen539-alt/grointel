// GroIntel APP-1 — Application Registry
import { ApplicationManifest, ApplicationInstance, ApplicationState } from "./application_types";

export class ApplicationRegistry {
  private apps: Map<string, ApplicationInstance> = new Map();

  register(manifest: ApplicationManifest): ApplicationInstance {
    if (this.apps.has(manifest.id)) throw new Error(`App '${manifest.id}' already registered`);
    const now = new Date().toISOString();
    const inst: ApplicationInstance = { id: manifest.id, manifest, state: "registered", session_count: 0, last_session: null, created_at: now, updated_at: now };
    this.apps.set(manifest.id, inst);
    return inst;
  }

  get(id: string): ApplicationInstance | null { return this.apps.get(id) || null; }
  getAll(): ApplicationInstance[] { return Array.from(this.apps.values()); }
  exists(id: string): boolean { return this.apps.has(id); }
  count(): number { return this.apps.size; }
  getByState(state: ApplicationState): ApplicationInstance[] { return this.getAll().filter(a => a.state === state); }

  updateState(inst: ApplicationInstance, state: ApplicationState): void {
    inst.state = state; inst.updated_at = new Date().toISOString();
  }
}
