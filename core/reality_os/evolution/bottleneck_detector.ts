// GroIntel ROS-6 — Bottleneck Detector
import { SystemObservation, Bottleneck, BottleneckType } from "./evolution_types";

let bCounter = 0;
function genId(): string { return "bot_" + (++bCounter).toString(16).padStart(6, "0"); }

export class BottleneckDetector {
  detect(obs: SystemObservation): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];

    if (obs.workflow_metrics.failed > 0) {
      bottlenecks.push({ id: genId(), type: "workflow_failure", severity: obs.workflow_metrics.failed > 3 ? "critical" : "high", evidence: [`${obs.workflow_metrics.failed} failed workflows`], affected_layer: "workflow", affected_module: "workflow_runtime", likely_cause: "Unhandled exceptions or timeouts", recommended_investigation: "Review workflow error logs" });
    }
    if (obs.agent_health.stalled > 0) {
      bottlenecks.push({ id: genId(), type: "agent_overlap", severity: obs.agent_health.stalled > 2 ? "high" : "medium", evidence: [`${obs.agent_health.stalled} stalled agents`], affected_layer: "agent", affected_module: "agent_runtime", likely_cause: "Scheduler or lifecycle issues", recommended_investigation: "Check agent scheduler" });
    }
    if (obs.sdk_traces.permission_failures > 0) {
      bottlenecks.push({ id: genId(), type: "sdk_gap", severity: "medium", evidence: [`${obs.sdk_traces.permission_failures} permission failures`], affected_layer: "sdk", affected_module: "sdk_permissions", likely_cause: "Missing permission grants", recommended_investigation: "Audit permission registry" });
    }
    if (obs.prediction_accuracy < 70) {
      bottlenecks.push({ id: genId(), type: "prediction_failure", severity: obs.prediction_accuracy < 50 ? "critical" : "high", evidence: [`Accuracy: ${obs.prediction_accuracy}%`], affected_layer: "intelligence", affected_module: "prediction", likely_cause: "Outdated prediction models", recommended_investigation: "Review prediction validation pipeline" });
    }
    if (obs.wisdom_judgements.rejected > obs.wisdom_judgements.total * 0.2) {
      bottlenecks.push({ id: genId(), type: "wisdom_conflict", severity: "medium", evidence: [`${obs.wisdom_judgements.rejected} rejections`], affected_layer: "wisdom", affected_module: "wisdom_runtime", likely_cause: "Misaligned values or principles", recommended_investigation: "Review wisdom judgement criteria" });
    }
    if (obs.error_frequency > 5) {
      bottlenecks.push({ id: genId(), type: "reliability", severity: "high", evidence: [`Error frequency: ${obs.error_frequency}`], affected_layer: "runtime", affected_module: "system", likely_cause: "System instability", recommended_investigation: "Root cause analysis on errors" });
    }
    if (obs.sdk_traces.errors > 10) {
      bottlenecks.push({ id: genId(), type: "performance", severity: "medium", evidence: [`${obs.sdk_traces.errors} SDK errors`], affected_layer: "sdk", affected_module: "reality_os_client", likely_cause: "Underlying service issues", recommended_investigation: "Check SDK adapter health" });
    }
    if (obs.lint_errors > 10) {
      bottlenecks.push({ id: genId(), type: "architecture_debt", severity: "medium", evidence: [`${obs.lint_errors} lint errors`], affected_layer: "codebase", affected_module: "core", likely_cause: "Code quality degradation", recommended_investigation: "Fix lint errors in backlog" });
    }

    return bottlenecks;
  }
}
