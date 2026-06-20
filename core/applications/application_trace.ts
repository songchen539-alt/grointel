// GroIntel APP-1 — Application Trace
import { ApplicationTrace } from "./application_types";

export class ApplicationTraceRecorder {
  private traces: ApplicationTrace[] = [];

  record(action: string, appId: string, details: string): ApplicationTrace {
    const t: ApplicationTrace = { id: "apt_" + (++ApplicationTraceRecorder.counter).toString(16).padStart(6, "0"), action, app_id: appId, details, timestamp: new Date().toISOString() };
    this.traces.push(t);
    return t;
  }

  getAll(): ApplicationTrace[] { return this.traces; }
  findByApp(appId: string): ApplicationTrace[] { return this.traces.filter(t => t.app_id === appId); }
  findByAction(action: string): ApplicationTrace[] { return this.traces.filter(t => t.action === action); }
  private static counter = 0;
}
