// GroIntel ROS-6 — Health Analyzer
import { SystemObservation, SystemHealthReport } from "./evolution_types";

export class HealthAnalyzer {
  analyze(obs: SystemObservation): SystemHealthReport {
    const testHealth = obs.test_suite_total > 0 ? Math.round((obs.test_suite_passed / obs.test_suite_total) * 100) : 0;
    const buildHealth = obs.build_status === "pass" ? 100 : 0;
    const runtimeHealth = Math.max(0, 100 - obs.error_frequency * 10 - obs.sdk_traces.errors * 5);
    const knowledgeHealth = obs.knowledge_growth.entities > 0 ? Math.min(100, 70 + obs.knowledge_growth.versions * 0.5) : 30;
    const agentHealth = obs.agent_health.active > 0 ? Math.round((obs.agent_health.active / Math.max(1, obs.agent_health.active + obs.agent_health.stalled)) * 100) : 50;
    const workflowHealth = (obs.workflow_metrics.completed + obs.workflow_metrics.failed) > 0
      ? Math.round((obs.workflow_metrics.completed / Math.max(1, obs.workflow_metrics.completed + obs.workflow_metrics.failed)) * 100) : 80;
    const predictionHealth = obs.prediction_accuracy;
    const wisdomHealth = obs.wisdom_judgements.total > 0
      ? Math.round(((obs.wisdom_judgements.total - obs.wisdom_judgements.rejected) / obs.wisdom_judgements.total) * 100) : 80;

    const overall = Math.round(
      testHealth * 0.20 + buildHealth * 0.15 + runtimeHealth * 0.15
      + knowledgeHealth * 0.15 + agentHealth * 0.10 + workflowHealth * 0.10
      + predictionHealth * 0.10 + wisdomHealth * 0.05
    );

    let status: SystemHealthReport["status"] = "excellent";
    if (overall < 50) status = "critical";
    else if (overall < 70) status = "warning";
    else if (overall < 85) status = "healthy";

    return { overall_health: overall, test_health: testHealth, build_health: buildHealth, runtime_health: runtimeHealth, knowledge_health: knowledgeHealth, agent_health: agentHealth, workflow_health: workflowHealth, prediction_health: predictionHealth, wisdom_health: wisdomHealth, status };
  }
}
