// GroIntel APP-1 — Workflow Binder
import { ApplicationWorkflowBinding } from "./application_types";
import { ApplicationManifest } from "./application_types";

const WORKFLOW_MAP: Record<string, string> = {
  strategic_decision: "strategic_decision",
  opportunity_discovery: "opportunity_discovery",
  risk_monitoring: "risk_monitoring",
  reality_event_analysis: "reality_event_analysis",
  prediction_validation: "prediction_validation",
};

export class WorkflowBinder {
  bind(manifest: ApplicationManifest): ApplicationWorkflowBinding[] {
    return manifest.required_workflows.map(wfId => ({
      workflow_type: wfId,
      definition_id: WORKFLOW_MAP[wfId] || "unknown",
      bound: !!WORKFLOW_MAP[wfId],
    }));
  }
}
