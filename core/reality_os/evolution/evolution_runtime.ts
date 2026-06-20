// GroIntel ROS-6 — Evolution Runtime (read-only, never modifies code)
import { SystemObservation, SystemHealthReport, Bottleneck, ImprovementProposal, UpgradeSimulation, EvolutionJudgement, EvolutionApproval, EvolutionPlan, EvolutionTrace } from "./evolution_types";
import { SystemObserver } from "./system_observer";
import { HealthAnalyzer } from "./health_analyzer";
import { BottleneckDetector } from "./bottleneck_detector";
import { ImprovementGenerator } from "./improvement_generator";
import { UpgradeSimulator } from "./upgrade_simulator";
import { EvolutionJudgementEngine } from "./evolution_judgement";
import { EvolutionApprovalEngine } from "./evolution_approval";
import { EvolutionTraceRecorder } from "./evolution_trace";

let planCounter = 0;
function genPlanId(): string { return "plan_" + (++planCounter).toString(16).padStart(6, "0"); }

export class EvolutionRuntime {
  public readonly observer = new SystemObserver();
  public readonly analyzer = new HealthAnalyzer();
  public readonly detector = new BottleneckDetector();
  public readonly generator = new ImprovementGenerator();
  public readonly simulator = new UpgradeSimulator();
  public readonly judger = new EvolutionJudgementEngine();
  public readonly approvals = new EvolutionApprovalEngine();
  public readonly traces = new EvolutionTraceRecorder();

  private proposals: Map<string, ImprovementProposal> = new Map();
  private simulations: Map<string, UpgradeSimulation> = new Map();
  private judgements: Map<string, EvolutionJudgement> = new Map();
  private approvalMap: Map<string, EvolutionApproval> = new Map();
  private plans: Map<string, EvolutionPlan> = new Map();

  observeSystem(): SystemObservation {
    const obs = this.observer.observe();
    this.traces.record("observe", null, `System observed: ${obs.test_suite_passed}/${obs.test_suite_total} tests passing`);
    return obs;
  }

  analyzeHealth(obs?: SystemObservation): SystemHealthReport {
    const o = obs || this.observer.observe();
    const report = this.analyzer.analyze(o);
    this.traces.record("analyze_health", null, `Health: ${report.overall_health} (${report.status})`);
    return report;
  }

  detectBottlenecks(obs?: SystemObservation): Bottleneck[] {
    const o = obs || this.observer.observe();
    const bottlenecks = this.detector.detect(o);
    this.traces.record("detect_bottlenecks", null, `${bottlenecks.length} bottlenecks detected`);
    return bottlenecks;
  }

  generateProposals(bottlenecks?: Bottleneck[]): ImprovementProposal[] {
    const b = bottlenecks || this.detector.detect(this.observer.observe());
    const props = this.generator.generate(b);
    for (const p of props) {
      this.proposals.set(p.id, p);
      this.traces.record("proposal_generated", p.id, p.title);
    }
    return props;
  }

  simulateUpgrade(proposal: ImprovementProposal): UpgradeSimulation {
    const sim = this.simulator.simulate(proposal);
    this.simulations.set(sim.id, sim);
    this.traces.record("simulate_upgrade", proposal.id, `Health delta: ${sim.expected_health_delta}`);
    return sim;
  }

  judgeProposal(proposal: ImprovementProposal): EvolutionJudgement {
    const judgement = this.judger.judge(proposal);
    this.judgements.set(judgement.id, judgement);
    this.traces.record("judge_proposal", proposal.id, `Verdict: ${judgement.verdict}`);
    return judgement;
  }

  requestApproval(proposal: ImprovementProposal): EvolutionApproval {
    const approval = this.approvals.request(proposal.id);
    this.approvalMap.set(approval.id, approval);
    this.traces.record("approval_requested", proposal.id, "Awaiting human review");
    return approval;
  }

  approveEvolution(approvalId: string, notes = ""): EvolutionApproval | null {
    const approval = this.approvalMap.get(approvalId);
    if (!approval) return null;
    const updated = this.approvals.approve(approval, notes);
    this.approvalMap.set(approvalId, updated);
    this.traces.record("approval_granted", approval.proposal_id, notes || "Approved by human");
    return updated;
  }

  rejectEvolution(approvalId: string, reason: string): EvolutionApproval | null {
    const approval = this.approvalMap.get(approvalId);
    if (!approval) return null;
    const updated = this.approvals.reject(approval, reason);
    this.approvalMap.set(approvalId, updated);
    this.traces.record("approval_rejected", approval.proposal_id, reason);
    return updated;
  }

  generatePlan(proposalId: string): EvolutionPlan | null {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return null;
    const judgement = Array.from(this.judgements.values()).find(j => j.proposal_id === proposalId);
    const approval = Array.from(this.approvalMap.values()).find(a => a.proposal_id === proposalId);
    if (!approval || !this.approvals.isApproved(approval)) return null;

    const plan: EvolutionPlan = {
      id: genPlanId(), proposal_id: proposalId,
      objective: proposal.title,
      implementation_steps: ["Review proposal", "Implement change in affected module", "Update tests", "Run test suite", "Deploy"],
      files_to_change: proposal.affected_modules.map(m => `core/${proposal.affected_layer}/${m}`),
      tests_to_add: proposal.success_metrics.map(m => `Add test for ${m}`),
      rollback_plan: ["Revert last commit", "Restore from backup", "Notify team"],
      success_criteria: proposal.success_metrics,
      risk_controls: ["Monitor for 24 hours after deployment", "Canary release if high risk"],
      created_at: new Date().toISOString(),
    };
    this.plans.set(plan.id, plan);
    this.traces.record("plan_generated", proposalId, `Plan created: ${plan.objective}`);
    return plan;
  }

  getProposals(): ImprovementProposal[] { return Array.from(this.proposals.values()); }
  getSimulations(): UpgradeSimulation[] { return Array.from(this.simulations.values()); }
  getJudgements(): EvolutionJudgement[] { return Array.from(this.judgements.values()); }
  getApprovals(): EvolutionApproval[] { return Array.from(this.approvalMap.values()); }
  getPlans(): EvolutionPlan[] { return Array.from(this.plans.values()); }
  getHistory(): EvolutionTrace[] { return this.traces.getAll(); }
}
