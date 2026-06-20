// GroIntel ROS-6 — Evolution Types
export type BottleneckType = "performance" | "accuracy" | "reliability" | "memory_growth"
  | "workflow_failure" | "agent_overlap" | "knowledge_duplication" | "prediction_failure"
  | "wisdom_conflict" | "sdk_gap" | "test_gap" | "architecture_debt";

export type ProposalType = "bug_fix" | "performance_optimization" | "interface_improvement"
  | "knowledge_merge" | "workflow_refactor" | "agent_refactor" | "test_expansion"
  | "metric_improvement" | "capability_extension" | "architecture_review";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "needs_more_evidence" | "deferred";
export type JudgementResult = "approve_recommendation" | "needs_more_evidence" | "defer" | "reject";

export interface SystemObservation {
  id: string;
  timestamp: string;
  test_suite_passed: number; test_suite_total: number;
  build_status: "pass" | "fail";
  lint_errors: number;
  workflow_metrics: { active: number; completed: number; failed: number; pending_approvals: number };
  agent_health: { active: number; stalled: number; terminated: number };
  sdk_traces: { total: number; errors: number; permission_failures: number };
  knowledge_growth: { entities: number; facts: number; versions: number };
  wisdom_judgements: { total: number; rejected: number };
  prediction_accuracy: number;
  learning_velocity: number;
  error_frequency: number;
}

export interface SystemHealthReport {
  overall_health: number;
  test_health: number;
  build_health: number;
  runtime_health: number;
  knowledge_health: number;
  agent_health: number;
  workflow_health: number;
  prediction_health: number;
  wisdom_health: number;
  status: "critical" | "warning" | "healthy" | "excellent";
}

export interface Bottleneck {
  id: string;
  type: BottleneckType;
  severity: "low" | "medium" | "high" | "critical";
  evidence: string[];
  affected_layer: string;
  affected_module: string;
  likely_cause: string;
  recommended_investigation: string;
}

export interface ImprovementProposal {
  id: string;
  title: string;
  problem: string;
  affected_layer: string;
  affected_modules: string[];
  proposal_type: ProposalType;
  recommended_change: string;
  expected_benefit: string;
  risk: number;
  complexity: number;
  dependencies: string[];
  success_metrics: string[];
  evidence: string[];
  requires_human_approval: boolean;
}

export interface UpgradeSimulation {
  id: string;
  proposal_id: string;
  expected_health_delta: number;
  expected_risk_delta: number;
  expected_complexity_delta: number;
  expected_test_impact: string;
  expected_runtime_impact: string;
  expected_knowledge_impact: string;
  expected_agent_impact: string;
  confidence: number;
}

export interface EvolutionJudgement {
  id: string;
  proposal_id: string;
  verdict: JudgementResult;
  principle_scores: { principle: string; score: number }[];
  value_scores: { value: string; score: number }[];
  composite_score: number;
  recommendation: string;
}

export interface EvolutionApproval {
  id: string;
  proposal_id: string;
  status: ApprovalStatus;
  human_reviewer: string;
  decided_at: string | null;
  notes: string;
}

export interface EvolutionPlan {
  id: string;
  proposal_id: string;
  objective: string;
  implementation_steps: string[];
  files_to_change: string[];
  tests_to_add: string[];
  rollback_plan: string[];
  success_criteria: string[];
  risk_controls: string[];
  created_at: string;
}

export interface EvolutionTrace {
  id: string;
  action: string;
  proposal_id: string | null;
  details: string;
  timestamp: string;
}
