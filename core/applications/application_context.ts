// GroIntel APP-1 — Application Context Builder
import { ApplicationContext, ApplicationManifest } from "./application_types";

export class ApplicationContextBuilder {
  private sessionCounter = 0;

  build(manifest: ApplicationManifest): ApplicationContext {
    return {
      app_id: manifest.id, app_name: manifest.name, domain: manifest.domain,
      session_id: "sess_" + (++this.sessionCounter).toString(16).padStart(6, "0"),
      bound_capabilities: manifest.required_capabilities,
      bound_workflows: manifest.required_workflows,
      bound_agents: manifest.required_agents,
      permissions_granted: manifest.permissions,
      started_at: new Date().toISOString(),
    };
  }
}
