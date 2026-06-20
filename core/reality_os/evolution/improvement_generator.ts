// GroIntel ROS-6 — Improvement Generator
import { Bottleneck, ImprovementProposal } from "./evolution_types";

let pCounter = 0;
function genId(): string { return "prop_" + (++pCounter).toString(16).padStart(6, "0"); }

export class ImprovementGenerator {
  generate(bottlenecks: Bottleneck[]): ImprovementProposal[] {
    return bottlenecks.map(b => {
      const types: Record<string, { title: string; change: string; benefit: string; risk: number; complexity: number; metrics: string[] }> = {
        workflow_failure: { title: `Fix workflow failures in ${b.affected_module}`, change: `Add retry logic, error handling, and monitoring for ${b.affected_module}`, benefit: "Reduce failed workflows to near zero", risk: 20, complexity: 30, metrics: ["workflow_success_rate", "recovery_time"] },
        agent_overlap: { title: "Resolve stalled agents", change: "Improve agent scheduler to detect and restart stalled agents", benefit: "All agents maintain continuous cycles", risk: 15, complexity: 25, metrics: ["agent_uptime", "cycle_completion"] },
        prediction_failure: { title: "Improve prediction accuracy", change: "Update prediction validator with recent outcomes and retrain confidence models", benefit: "Prediction accuracy increases above 85%", risk: 10, complexity: 20, metrics: ["prediction_accuracy", "confidence_calibration"] },
        sdk_gap: { title: "Add missing SDK permissions", change: "Audit and add required permissions for all SDK methods", benefit: "Zero permission failures", risk: 5, complexity: 10, metrics: ["permission_success_rate"] },
        wisdom_conflict: { title: "Reconcile wisdom conflicts", change: "Review rejected wisdom judgements and adjust principle weights", benefit: "Reduced false rejections", risk: 25, complexity: 35, metrics: ["wisdom_acceptance_rate", "false_rejection_rate"] },
        reliability: { title: "Improve system reliability", change: "Implement error recovery, circuit breakers, and health check endpoints", benefit: "Error frequency drops below threshold", risk: 30, complexity: 40, metrics: ["error_frequency", "uptime"] },
        performance: { title: "Optimize SDK adapter performance", change: "Add caching, reduce redundant calls, optimize adapter patterns", benefit: "SDK latency and error rates reduced", risk: 15, complexity: 25, metrics: ["sdk_latency", "sdk_error_rate"] },
        architecture_debt: { title: "Reduce architecture debt", change: "Fix lint errors and refactor high-debt modules", benefit: "Cleaner codebase, easier maintenance", risk: 10, complexity: 20, metrics: ["lint_error_count", "module_cohesion"] },
      };

      const t = types[b.type] || { title: `Investigate ${b.type} in ${b.affected_module}`, change: `Conduct investigation and propose remediation`, benefit: "Issue identified and addressed", risk: 10, complexity: 15, metrics: ["investigation_complete"] };

      return {
        id: genId(), title: t.title, problem: b.likely_cause,
        affected_layer: b.affected_layer, affected_modules: [b.affected_module],
        proposal_type: this.mapType(b.type),
        recommended_change: t.change,
        expected_benefit: t.benefit,
        risk: t.risk, complexity: t.complexity, dependencies: [], success_metrics: t.metrics,
        evidence: b.evidence, requires_human_approval: true,
      };
    });
  }

  private mapType(bt: string): any {
    const m: Record<string, string> = {
      workflow_failure: "workflow_refactor", agent_overlap: "agent_refactor",
      prediction_failure: "metric_improvement", sdk_gap: "interface_improvement",
      wisdom_conflict: "architecture_review", reliability: "bug_fix",
      performance: "performance_optimization", architecture_debt: "architecture_review",
    };
    return m[bt] || "architecture_review";
  }
}
