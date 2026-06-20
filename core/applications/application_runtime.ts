// GroIntel APP-1 — Application Runtime
import { ApplicationManifest, ApplicationInstance, ApplicationContext, ApplicationStateSnapshot } from "./application_types";
import { ApplicationRegistry } from "./application_registry";
import { ApplicationContextBuilder } from "./application_context";
import { CapabilityMapper } from "./application_capability_mapper";
import { WorkflowBinder } from "./application_workflow_binder";
import { AgentBinder } from "./application_agent_binder";
import { ApplicationTraceRecorder } from "./application_trace";
import { BUILTIN_MANIFESTS } from "./application_manifest";

export class ApplicationRuntime {
  public readonly registry = new ApplicationRegistry();
  public readonly ctxBuilder = new ApplicationContextBuilder();
  public readonly capMapper = new CapabilityMapper();
  public readonly wfBinder = new WorkflowBinder();
  public readonly agentBinder = new AgentBinder();
  public readonly traces = new ApplicationTraceRecorder();

  constructor() { this.initBuiltins(); }

  private initBuiltins(): void {
    for (const m of BUILTIN_MANIFESTS) {
      if (!this.registry.exists(m.id)) {
        this.registry.register(m);
        this.traces.record("builtin_registered", m.id, `Built-in app: ${m.name}`);
      }
    }
  }

  registerApp(manifest: ApplicationManifest): ApplicationInstance {
    const inst = this.registry.register(manifest);
    this.traces.record("app_registered", manifest.id, `Registered: ${manifest.name}`);
    return inst;
  }

  activateApp(appId: string): ApplicationInstance | null {
    const inst = this.registry.get(appId);
    if (!inst) return null;
    this.registry.updateState(inst, "active");
    this.traces.record("app_activated", appId, "Activated");
    return inst;
  }

  pauseApp(appId: string): ApplicationInstance | null {
    const inst = this.registry.get(appId);
    if (!inst || inst.state === "deprecated" || inst.state === "archived") return null;
    this.registry.updateState(inst, "paused");
    this.traces.record("app_paused", appId, "Paused");
    return inst;
  }

  deprecateApp(appId: string): ApplicationInstance | null {
    const inst = this.registry.get(appId);
    if (!inst) return null;
    this.registry.updateState(inst, "deprecated");
    this.traces.record("app_deprecated", appId, "Deprecated");
    return inst;
  }

  archiveApp(appId: string): ApplicationInstance | null {
    const inst = this.registry.get(appId);
    if (!inst) return null;
    this.registry.updateState(inst, "archived");
    this.traces.record("app_archived", appId, "Archived");
    return inst;
  }

  startSession(appId: string): ApplicationContext | null {
    const inst = this.registry.get(appId);
    if (!inst || inst.state === "deprecated" || inst.state === "archived") return null;
    const ctx = this.ctxBuilder.build(inst.manifest);
    inst.session_count++;
    inst.last_session = ctx.started_at;
    inst.updated_at = ctx.started_at;
    this.traces.record("session_started", appId, `Session: ${ctx.session_id}`);
    return ctx;
  }

  getState(appId: string): ApplicationStateSnapshot | null {
    const inst = this.registry.get(appId);
    if (!inst) return null;
    const caps = this.capMapper.map(inst.manifest);
    const wfs = this.wfBinder.bind(inst.manifest);
    const agents = this.agentBinder.bind(inst.manifest);
    return {
      app_id: inst.id, state: inst.state, session_count: inst.session_count,
      capabilities_available: caps.filter(c => c.available).length,
      capabilities_total: caps.length,
      workflows_bound: wfs.filter(w => w.bound).length,
      workflows_total: wfs.length,
      agents_bound: agents.filter(a => a.bound).length,
      agents_total: agents.length,
    };
  }

  getApp(id: string): ApplicationInstance | null { return this.registry.get(id); }
  listApps(): ApplicationInstance[] { return this.registry.getAll(); }
}
