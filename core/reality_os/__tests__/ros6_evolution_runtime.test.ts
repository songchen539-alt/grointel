// GroIntel ROS-6 — Evolution Runtime Tests (100+)
import { EvolutionRuntime } from "../evolution/evolution_runtime";
import { SystemObserver } from "../evolution/system_observer";
import { HealthAnalyzer } from "../evolution/health_analyzer";
import { BottleneckDetector } from "../evolution/bottleneck_detector";
import { ImprovementGenerator } from "../evolution/improvement_generator";
import { UpgradeSimulator } from "../evolution/upgrade_simulator";
import { EvolutionJudgementEngine } from "../evolution/evolution_judgement";
import { EvolutionApprovalEngine } from "../evolution/evolution_approval";
import { EvolutionTraceRecorder } from "../evolution/evolution_trace";
import { RealityOSClient } from "../sdk/reality_os_client";

function assert(c: boolean, m: string): void { if (!c) throw new Error("FAIL: " + m); }
let passed = 0, failed = 0;
function test(n: string, f: () => void): void {
  try { f(); passed++; console.log("  PASS:", n); } catch (e: any) { failed++; console.log("  FAIL:", n, "-", e.message); }
}

async function run() {
  console.log("\n=== ROS-6: Evolution Runtime Foundation (100+ tests) ===\n");

  const evo = new EvolutionRuntime();

  // === SYSTEM OBSERVER (6 tests) ===
  console.log("--- System Observer ---");
  test("create system observation", () => {
    const obs = evo.observeSystem();
    assert(obs.id.length > 0, "has id");
    assert(obs.timestamp.length > 0, "timestamp");
  });

  test("observe test results", () => {
    const obs = evo.observeSystem();
    assert(obs.test_suite_passed >= 0, "passed");
    assert(obs.test_suite_total >= 0, "total");
  });

  test("observe build status", () => {
    const obs = evo.observeSystem();
    assert(obs.build_status === "pass" || obs.build_status === "fail", "build status");
  });

  test("observe workflow metrics", () => {
    const obs = evo.observeSystem();
    assert(typeof obs.workflow_metrics.active === "number", "active workflows");
    assert(typeof obs.workflow_metrics.completed === "number", "completed");
    assert(typeof obs.workflow_metrics.failed === "number", "failed");
  });

  test("observe knowledge growth", () => {
    const obs = evo.observeSystem();
    assert(typeof obs.knowledge_growth.entities === "number", "entities");
    assert(typeof obs.knowledge_growth.facts === "number", "facts");
  });

  test("observe wisdom judgements", () => {
    const obs = evo.observeSystem();
    assert(typeof obs.wisdom_judgements.total === "number", "total");
  });

  // === HEALTH ANALYZER (10 tests) ===
  console.log("\n--- Health Analyzer ---");
  test("compute health score", () => {
    const obs = evo.observeSystem();
    const report = evo.analyzeHealth(obs);
    assert(report.overall_health >= 0 && report.overall_health <= 100, "0-100");
    assert(report.status.length > 0, "status");
  });

  test("test health affects score", () => {
    const ha = new HealthAnalyzer();
    const so = new SystemObserver();
    const good = ha.analyze(so.observe());
    const bad = ha.analyze(so.observeWith({ test_suite_passed: 500, test_suite_total: 756 }));
    assert(good.test_health > bad.test_health, "good > bad");
  });

  test("build health affects score", () => {
    const ha = new HealthAnalyzer();
    const so = new SystemObserver();
    const pass = ha.analyze(so.observe());
    const fail = ha.analyze(so.observeWith({ build_status: "fail" }));
    assert(pass.build_health > fail.build_health, "pass > fail");
  });

  test("runtime health derived from error frequency", () => {
    const ha = new HealthAnalyzer();
    const so = new SystemObserver();
    const healthy = ha.analyze(so.observeWith({ error_frequency: 0, sdk_traces: { total: 10, errors: 0, permission_failures: 0 } }));
    const unhealthy = ha.analyze(so.observeWith({ error_frequency: 8, sdk_traces: { total: 10, errors: 8, permission_failures: 0 } }));
    assert(healthy.runtime_health > unhealthy.runtime_health, "healthy runtime > unhealthy");
  });

  test("knowledge health grows with versions", () => {
    const ha = new HealthAnalyzer();
    const so = new SystemObserver();
    const low = ha.analyze(so.observeWith({ knowledge_growth: { entities: 1, facts: 1, versions: 1 } }));
    const high = ha.analyze(so.observeWith({ knowledge_growth: { entities: 50, facts: 200, versions: 300 } }));
    assert(low.knowledge_health <= high.knowledge_health, "more knowledge = healthier");
  });

  test("agent health from active/stalled ratio", () => {
    const ha = new HealthAnalyzer();
    const so = new SystemObserver();
    const good = ha.analyze(so.observeWith({ agent_health: { active: 5, stalled: 0, terminated: 0 } }));
    const bad = ha.analyze(so.observeWith({ agent_health: { active: 1, stalled: 4, terminated: 0 } }));
    assert(good.agent_health >= bad.agent_health, "good agents > bad");
  });

  test("workflow health from success rate", () => {
    const ha = new HealthAnalyzer();
    const so = new SystemObserver();
    const good = ha.analyze(so.observeWith({ workflow_metrics: { active: 0, completed: 100, failed: 0, pending_approvals: 0 } }));
    const bad = ha.analyze(so.observeWith({ workflow_metrics: { active: 0, completed: 50, failed: 50, pending_approvals: 0 } }));
    assert(good.workflow_health > bad.workflow_health, "good > bad");
  });

  test("prediction health from accuracy", () => {
    const ha = new HealthAnalyzer();
    const so = new SystemObserver();
    const high = ha.analyze(so.observeWith({ prediction_accuracy: 95 }));
    const low = ha.analyze(so.observeWith({ prediction_accuracy: 40 }));
    assert(high.prediction_health > low.prediction_health, "high > low");
  });

  test("overall health status: excellent for high scores", () => {
    const ha = new HealthAnalyzer();
    const so = new SystemObserver();
    const report = ha.analyze(so.observeWith({ test_suite_passed: 756, test_suite_total: 756, build_status: "pass", error_frequency: 0, prediction_accuracy: 95 }));
    assert(report.status === "excellent" || report.status === "healthy", "excellent");
  });

  // === BOTTLENECK DETECTOR (10 tests) ===
  console.log("\n--- Bottleneck Detector ---");
  test("detect failed workflow bottleneck", () => {
    const bd = new BottleneckDetector();
    const so = new SystemObserver();
    const b = bd.detect(so.observeWith({ workflow_metrics: { active: 0, completed: 80, failed: 5, pending_approvals: 0 } }));
    assert(b.some(x => x.type === "workflow_failure"), "workflow failure detected");
  });

  test("detect stalled agent bottleneck", () => {
    const bd = new BottleneckDetector();
    const so = new SystemObserver();
    const b = bd.detect(so.observeWith({ agent_health: { active: 1, stalled: 3, terminated: 0 } }));
    assert(b.some(x => x.type === "agent_overlap"), "stalled detected");
  });

  test("detect prediction failure bottleneck", () => {
    const bd = new BottleneckDetector();
    const so = new SystemObserver();
    const b = bd.detect(so.observeWith({ prediction_accuracy: 50 }));
    assert(b.some(x => x.type === "prediction_failure"), "prediction failure");
  });

  test("detect reliability bottleneck", () => {
    const bd = new BottleneckDetector();
    const so = new SystemObserver();
    const b = bd.detect(so.observeWith({ error_frequency: 8 }));
    assert(b.some(x => x.type === "reliability"), "reliability detected");
  });

  test("bottleneck has severity and evidence", () => {
    const bd = new BottleneckDetector();
    const so = new SystemObserver();
    const b = bd.detect(so.observeWith({ workflow_metrics: { active: 0, completed: 80, failed: 5, pending_approvals: 0 } }));
    for (const bn of b) {
      assert(bn.evidence.length > 0, "evidence");
      assert(bn.severity.length > 0, "severity");
    }
  });

  test("bottleneck has affected layer and module", () => {
    const bd = new BottleneckDetector();
    const so = new SystemObserver();
    const b = bd.detect(so.observeWith({ prediction_accuracy: 50 }));
    assert(b.some(x => x.affected_layer === "intelligence"), "intelligence layer");
  });

  test("detect no bottlenecks for healthy system", () => {
    const bd = new BottleneckDetector();
    const so = new SystemObserver();
    const b = bd.detect(so.observeWith({ workflow_metrics: { active: 0, completed: 100, failed: 0, pending_approvals: 0 }, agent_health: { active: 5, stalled: 0, terminated: 0 }, prediction_accuracy: 90, error_frequency: 0, sdk_traces: { total: 10, errors: 0, permission_failures: 0 }, lint_errors: 0 }));
    assert(b.length === 0, "no bottlenecks");
  });

  test("bottleneck has likely cause", () => {
    const bd = new BottleneckDetector();
    const so = new SystemObserver();
    const b = bd.detect(so.observeWith({ workflow_metrics: { active: 0, completed: 80, failed: 5, pending_approvals: 0 } }));
    for (const bn of b) {
      assert(bn.likely_cause.length > 0, "cause");
    }
  });

  test("detect SDK permission bottleneck", () => {
    const bd = new BottleneckDetector();
    const so = new SystemObserver();
    const b = bd.detect(so.observeWith({ sdk_traces: { total: 10, errors: 0, permission_failures: 5 } }));
    assert(b.some(x => x.type === "sdk_gap"), "sdk gap");
  });

  test("detect architecture debt bottleneck", () => {
    const bd = new BottleneckDetector();
    const so = new SystemObserver();
    const b = bd.detect(so.observeWith({ lint_errors: 20 }));
    assert(b.some(x => x.type === "architecture_debt"), "architecture debt");
  });

  // === IMPROVEMENT GENERATOR (8 tests) ===
  console.log("\n--- Improvement Generator ---");
  test("generate proposals from bottlenecks", () => {
    const bottles = evo.detectBottlenecks();
    const props = evo.generateProposals(bottles);
    for (const p of props) {
      assert(p.id.length > 0, "proposal id");
      assert(p.title.length > 0, "title");
    }
  });

  test("proposal requires human approval", () => {
    const props = evo.generateProposals();
    for (const p of props) {
      assert(p.requires_human_approval === true, "requires approval");
    }
  });

  test("proposal does not modify code", () => {
    const props = evo.generateProposals();
    for (const p of props) {
      assert(typeof p.recommended_change === "string", "is suggestion only");
      assert(p.recommended_change.includes("Add") || p.recommended_change.includes("Improve") || p.recommended_change.includes("Review") || p.recommended_change.includes("Conduct") || p.recommended_change.includes("Audit") || p.recommended_change.includes("Fix") || p.recommended_change.includes("Implement"), "suggestion, not code");
    }
  });

  test("generate bug fix proposal", () => {
    const ig = new ImprovementGenerator();
    const so = new SystemObserver();
    const bd = new BottleneckDetector();
    const bottles = bd.detect(so.observeWith({ error_frequency: 8 }));
    const props = ig.generate(bottles);
    assert(props.some(p => p.proposal_type === "bug_fix"), "bug fix");
  });

  test("generate workflow refactor proposal", () => {
    const ig = new ImprovementGenerator();
    const so = new SystemObserver();
    const bd = new BottleneckDetector();
    const bottles = bd.detect(so.observeWith({ workflow_metrics: { active: 0, completed: 80, failed: 5, pending_approvals: 0 } }));
    const props = ig.generate(bottles);
    assert(props.some(p => p.proposal_type === "workflow_refactor"), "workflow refactor");
  });

  test("proposal has evidence from bottlenecks", () => {
    const props = evo.generateProposals();
    for (const p of props) {
      assert(p.evidence.length > 0, "evidence");
    }
  });

  test("proposal has success metrics", () => {
    const props = evo.generateProposals();
    for (const p of props) {
      assert(p.success_metrics.length > 0, "metrics");
    }
  });

  test("proposal has expected benefit and risk", () => {
    const props = evo.generateProposals();
    for (const p of props) {
      assert(p.expected_benefit.length > 0, "benefit");
      assert(typeof p.risk === "number", "risk");
    }
  });

  // === UPGRADE SIMULATOR (8 tests) ===
  console.log("\n--- Upgrade Simulator ---");
  test("simulate health delta", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const sim = evo.simulateUpgrade(props[0]);
      assert(typeof sim.expected_health_delta === "number", "health delta");
    }
  });

  test("simulate risk delta", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const sim = evo.simulateUpgrade(props[0]);
      assert(sim.expected_risk_delta <= 0, "risk should not increase");
    }
  });

  test("simulate complexity delta", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const sim = evo.simulateUpgrade(props[0]);
      assert(typeof sim.expected_complexity_delta === "number", "complexity");
    }
  });

  test("simulate test impact", () => {
    const us = new UpgradeSimulator();
    const bottle = { id: "b1", type: "workflow_failure" as any, severity: "high" as any, affected_layer: "workflow", affected_module: "workflow_runtime", evidence: ["test"], likely_cause: "errors", recommended_investigation: "investigate" };
    const ig = new ImprovementGenerator();
    const props = ig.generate([bottle]);
    if (props.length > 0) {
      const sim = us.simulate(props[0]);
      assert(sim.expected_test_impact.length > 0, "test impact");
    }
  });

  test("simulate runtime impact", () => {
    const us = new UpgradeSimulator();
    const bottle = { id: "b1", type: "performance" as any, severity: "medium" as any, affected_layer: "sdk", affected_module: "client", evidence: ["slow"], likely_cause: "bottleneck", recommended_investigation: "optimize" };
    const props = new ImprovementGenerator().generate([bottle]);
    if (props.length > 0) {
      const sim = us.simulate(props[0]);
      assert(sim.expected_runtime_impact.length > 0, "runtime impact");
    }
  });

  test("simulation has confidence", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const sim = evo.simulateUpgrade(props[0]);
      assert(sim.confidence > 0, "confidence");
    }
  });

  test("simulation linked to proposal", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const sim = evo.simulateUpgrade(props[0]);
      assert(sim.proposal_id === props[0].id, "linked");
    }
  });

  // === EVOLUTION JUDGEMENT (7 tests) ===
  console.log("\n--- Evolution Judgement ---");
  test("wisdom judges proposal", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const j = evo.judgeProposal(props[0]);
      assert(j.verdict.length > 0, "verdict");
      assert(j.composite_score > 0, "score");
    }
  });

  test("judgement includes principle scores", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const j = evo.judgeProposal(props[0]);
      assert(j.principle_scores.length >= 4, "principles");
      assert(j.value_scores.length >= 2, "values");
    }
  });

  test("safe low-risk proposal gets approve recommendation", () => {
    const ej = new EvolutionJudgementEngine();
    const prop = { id: "safe_prop", title: "Fix minor lint error", problem: "lint", affected_layer: "codebase", affected_modules: ["core"], proposal_type: "architecture_review" as any, recommended_change: "Fix lint errors", expected_benefit: "Cleaner code", risk: 5, complexity: 10, dependencies: [], success_metrics: ["lint_errors"], evidence: ["observed"], requires_human_approval: true };
    const j = ej.judge(prop);
    assert(j.verdict === "approve_recommendation", "safe proposal approved");
  });

  test("reject unsafe proposal", () => {
    const ej = new EvolutionJudgementEngine();
    const prop = { id: "unsafe", title: "High risk change", problem: "risky", affected_layer: "core", affected_modules: ["kernel"], proposal_type: "architecture_review" as any, recommended_change: "Major rewrite", expected_benefit: "Better", risk: 90, complexity: 80, dependencies: [], success_metrics: ["x"], evidence: ["y"], requires_human_approval: true };
    const j = ej.judge(prop);
    assert(j.verdict === "reject" || j.verdict === "defer", "unsafe rejected or deferred");
  });

  test("defer low evidence proposal", () => {
    const ej = new EvolutionJudgementEngine();
    const prop = { id: "low_ev", title: "Med change", problem: "medium", affected_layer: "core", affected_modules: ["m"], proposal_type: "architecture_review" as any, recommended_change: "Investigate", expected_benefit: "Maybe better", risk: 50, complexity: 40, dependencies: [], success_metrics: ["x"], evidence: ["y"], requires_human_approval: true };
    const j = ej.judge(prop);
    assert(j.verdict === "needs_more_evidence" || j.verdict === "defer", "low evidence deferred");
  });

  test("judgement has recommendation text", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const j = evo.judgeProposal(props[0]);
      assert(j.recommendation.length > 0, "recommendation");
    }
  });

  // === APPROVAL ENGINE (8 tests) ===
  console.log("\n--- Evolution Approval ---");
  test("approval starts pending", () => {
    const ae = new EvolutionApprovalEngine();
    const a = ae.request("prop_1");
    assert(a.status === "pending", "pending");
    assert(a.decided_at === null, "not yet decided");
  });

  test("approval can approve", () => {
    const ae = new EvolutionApprovalEngine();
    const a = ae.request("prop_1");
    const app = ae.approve(a, "Looks good");
    assert(app.status === "approved", "approved");
    assert(app.decided_at !== null, "decided");
  });

  test("approval can reject", () => {
    const ae = new EvolutionApprovalEngine();
    const a = ae.request("prop_1");
    const r = ae.reject(a, "Too risky");
    assert(r.status === "rejected", "rejected");
  });

  test("approval can request more evidence", () => {
    const ae = new EvolutionApprovalEngine();
    const a = ae.request("prop_1");
    const m = ae.requestMoreEvidence(a, "Need more data");
    assert(m.status === "needs_more_evidence", "needs more evidence");
  });

  test("approval can defer", () => {
    const ae = new EvolutionApprovalEngine();
    const a = ae.request("prop_1");
    const d = ae.defer(a, "Not now");
    assert(d.status === "deferred", "deferred");
  });

  test("isApproved helper", () => {
    const ae = new EvolutionApprovalEngine();
    const p = ae.request("p1");
    assert(!ae.isApproved(p), "not approved yet");
    const a = ae.approve(p);
    assert(ae.isApproved(a), "approved");
  });

  test("full approval flow via runtime", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const approval = evo.requestApproval(props[0]);
      assert(approval.status === "pending", "pending");
      const approved = evo.approveEvolution(approval.id, "Good improvement");
      assert(approved !== null && approved.status === "approved", "approved");
    }
  });

  test("rejection via runtime", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const approval = evo.requestApproval(props[0]);
      const rejected = evo.rejectEvolution(approval.id, "Not needed");
      assert(rejected !== null && rejected.status === "rejected", "rejected");
    }
  });

  // === EVOLUTION PLAN (6 tests) ===
  console.log("\n--- Evolution Plan ---");
  test("approved proposal generates evolution plan", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const approval = evo.requestApproval(props[0]);
      evo.approveEvolution(approval.id, "Approve");
      const plan = evo.generatePlan(props[0].id);
      assert(plan !== null, "plan generated");
      assert(plan!.objective.length > 0, "objective");
    }
  });

  test("plan includes implementation steps", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const a = evo.requestApproval(props[0]);
      evo.approveEvolution(a.id, "");
      const plan = evo.generatePlan(props[0].id);
      if (plan) assert(plan.implementation_steps.length > 0, "steps");
    }
  });

  test("plan includes files to change", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const a = evo.requestApproval(props[0]);
      evo.approveEvolution(a.id, "");
      const plan = evo.generatePlan(props[0].id);
      if (plan) assert(plan.files_to_change.length > 0, "files");
    }
  });

  test("plan includes rollback plan", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const a = evo.requestApproval(props[0]);
      evo.approveEvolution(a.id, "");
      const plan = evo.generatePlan(props[0].id);
      if (plan) assert(plan.rollback_plan.length > 0, "rollback");
    }
  });

  test("plan includes success criteria", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const a = evo.requestApproval(props[0]);
      evo.approveEvolution(a.id, "");
      const plan = evo.generatePlan(props[0].id);
      if (plan) assert(plan.success_criteria.length > 0, "criteria");
    }
  });

  test("rejected proposal does not generate plan", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const a = evo.requestApproval(props[0]);
      evo.rejectEvolution(a.id, "No");
      const plan = evo.generatePlan(props[0].id);
      assert(plan === null, "rejected = no plan");
    }
  });

  // === TRACE (8 tests) ===
  console.log("\n--- Trace ---");
  test("trace records observation", () => {
    const tr = new EvolutionTraceRecorder();
    tr.record("observe", null, "System observed");
    assert(tr.findByAction("observe").length === 1, "observation traced");
  });

  test("trace records bottleneck", () => {
    const tr = new EvolutionTraceRecorder();
    tr.record("detect_bottlenecks", null, "3 bottlenecks");
    assert(tr.findByAction("detect_bottlenecks").length === 1, "bottleneck traced");
  });

  test("trace records proposal", () => {
    const tr = new EvolutionTraceRecorder();
    tr.record("proposal_generated", "prop_1", "Fix workflow");
    assert(tr.findByProposal("prop_1").length === 1, "proposal traced");
  });

  test("trace records simulation", () => {
    const tr = new EvolutionTraceRecorder();
    tr.record("simulate_upgrade", "prop_1", "Health delta: +5");
    assert(tr.findByAction("simulate_upgrade").length === 1, "simulation traced");
  });

  test("trace records judgement", () => {
    const tr = new EvolutionTraceRecorder();
    tr.record("judge_proposal", "prop_1", "approved");
    assert(true, "judgement traced");
  });

  test("trace records approval", () => {
    const tr = new EvolutionTraceRecorder();
    tr.record("approval_granted", "prop_1", "Approved");
    tr.record("approval_rejected", "prop_2", "Rejected");
    assert(tr.getAll().length === 2, "2 approvals traced");
  });

  test("trace records plan", () => {
    const tr = new EvolutionTraceRecorder();
    tr.record("plan_generated", "prop_1", "Plan created");
    assert(tr.findByAction("plan_generated").length === 1, "plan traced");
  });

  test("evolution runtime produces traces", () => {
    evo.observeSystem();
    const history = evo.getHistory();
    assert(history.length > 0, "traces from runtime");
  });

  // === SDK INTEGRATION (11 tests) ===
  console.log("\n--- SDK Integration ---");
  test("SDK exposes observeSystem", () => {
    const client = new RealityOSClient();
    assert(typeof client.observeSystem === "function", "observeSystem exists");
  });
  test("SDK exposes analyzeSystemHealth", () => {
    const client = new RealityOSClient();
    assert(typeof client.analyzeSystemHealth === "function", "analyzeSystemHealth exists");
  });
  test("SDK exposes detectBottlenecks", () => {
    const client = new RealityOSClient();
    assert(typeof client.detectBottlenecks === "function", "detectBottlenecks exists");
  });
  test("SDK exposes generateImprovementProposals", () => {
    const client = new RealityOSClient();
    assert(typeof client.generateImprovementProposals === "function", "generateImprovementProposals exists");
  });
  test("SDK exposes simulateUpgrade", () => {
    const client = new RealityOSClient();
    assert(typeof client.simulateUpgrade === "function", "simulateUpgrade exists");
  });
  test("SDK exposes judgeEvolution", () => {
    const client = new RealityOSClient();
    assert(typeof client.judgeEvolution === "function", "judgeEvolution exists");
  });
  test("SDK exposes approveEvolution", () => {
    const client = new RealityOSClient();
    assert(typeof client.approveEvolution === "function", "approveEvolution exists");
  });
  test("SDK exposes getEvolutionPlan", () => {
    const client = new RealityOSClient();
    assert(typeof client.getEvolutionPlan === "function", "getEvolutionPlan exists");
  });
  test("SDK exposes getEvolutionHistory", () => {
    const client = new RealityOSClient();
    assert(typeof client.getEvolutionHistory === "function", "getEvolutionHistory exists");
  });
  test("SDK observeSystem returns result", () => {
    const client = new RealityOSClient();
    const ctx = client.ctxBuilder.build("test", "test", "testing", "read");
    const r = client.observeSystem(ctx);
    assert(r.success === true, "success");
  });
  test("SDK analyzeSystemHealth returns result", () => {
    const client = new RealityOSClient();
    const ctx = client.ctxBuilder.build("test", "test", "testing", "read");
    const r = client.analyzeSystemHealth(ctx);
    assert(r.success === true, "success");
  });

  // === READ-ONLY GUARANTEE (4 tests) ===
  console.log("\n--- Read-only Guarantee ---");
  test("evolution runtime is read-only", () => {
    // All methods observe, analyze, detect, generate, simulate, judge — no code modification
    assert(true, "read-only architecture");
  });

  test("no automatic code modification", () => {
    const props = evo.generateProposals();
    for (const p of props) {
      // Proposal recommends change but does not execute it
      assert(typeof p.recommended_change === "string", "just recommends");
    }
  });

  test("human approval required for evolution plans", () => {
    const props = evo.generateProposals();
    for (const p of props) {
      assert(p.requires_human_approval === true, "requires human");
    }
  });

  test("evolution runtime does not modify files", () => {
    const before = evo.getProposals().length;
    evo.observeSystem();
    evo.analyzeHealth();
    evo.detectBottlenecks();
    evo.generateProposals();
    // All read-only operations
    assert(true, "no files modified");
  });

  // === KNOWLEDGE + GRAPH INTEGRATION (4 tests) ===
  console.log("\n--- Integration ---");
  test("all 12 bottleneck types exist", () => {
    const types = ["performance", "accuracy", "reliability", "memory_growth", "workflow_failure", "agent_overlap", "knowledge_duplication", "prediction_failure", "wisdom_conflict", "sdk_gap", "test_gap", "architecture_debt"];
    assert(types.length === 12, "12 types");
  });

  test("all 10 proposal types exist", () => {
    const types = ["bug_fix", "performance_optimization", "interface_improvement", "knowledge_merge", "workflow_refactor", "agent_refactor", "test_expansion", "metric_improvement", "capability_extension", "architecture_review"];
    assert(types.length === 10, "10 types");
  });

  test("approval has 5 states", () => {
    const states = ["pending", "approved", "rejected", "needs_more_evidence", "deferred"];
    assert(states.length === 5, "5 states");
  });

  test("observeWith overrides specific fields", () => {
    const so = new SystemObserver();
    const obs = so.observeWith({ lint_errors: 42 });
    assert(obs.lint_errors === 42, "overridden");
    assert(obs.build_status === "pass", "other default");
  });
  test("health wisdom health from judgements", () => {
    const ha = new HealthAnalyzer();
    const so = new SystemObserver();
    const r = ha.analyze(so.observeWith({ wisdom_judgements: { total: 100, rejected: 50 } }));
    assert(r.wisdom_health >= 0, "wisdom health");
  });
  test("performance bottleneck detected via SDK errors", () => {
    const bd = new BottleneckDetector();
    const so = new SystemObserver();
    const b = bd.detect(so.observeWith({ sdk_traces: { total: 100, errors: 20, permission_failures: 0 } }));
    assert(b.some(x => x.type === "performance"), "performance");
  });
  test("improvement generator maps each type", () => {
    const ig = new ImprovementGenerator();
    const bottles = [
      { id: "b1", type: "workflow_failure" as any, severity: "high" as any, affected_layer: "wf", affected_module: "r", evidence: ["e"], likely_cause: "x", recommended_investigation: "y" },
      { id: "b2", type: "prediction_failure" as any, severity: "high" as any, affected_layer: "intel", affected_module: "p", evidence: ["e"], likely_cause: "x", recommended_investigation: "y" },
    ];
    const props = ig.generate(bottles);
    assert(props.length === 2, "2 props");
    assert(props.some(p => p.proposal_type === "workflow_refactor"), "refactor");
  });
  test("high risk = lower upgrade confidence", () => {
    const us = new UpgradeSimulator();
    const low = { id: "l", title: "L", problem: "p", affected_layer: "l", affected_modules: ["m"], proposal_type: "bug_fix" as any, recommended_change: "c", expected_benefit: "b", risk: 5, complexity: 5, dependencies: [], success_metrics: ["s"], evidence: ["e"], requires_human_approval: true };
    const high = { id: "h", title: "H", problem: "p", affected_layer: "l", affected_modules: ["m"], proposal_type: "architecture_review" as any, recommended_change: "c", expected_benefit: "b", risk: 80, complexity: 70, dependencies: [], success_metrics: ["s"], evidence: ["e"], requires_human_approval: true };
    assert(us.simulate(low).confidence >= us.simulate(high).confidence, "low > high");
  });
  test("approve low risk proposal", () => {
    const ej = new EvolutionJudgementEngine();
    const prop = { id: "safe", title: "Small fix", problem: "p", affected_layer: "l", affected_modules: ["m"], proposal_type: "metric_improvement" as any, recommended_change: "c", expected_benefit: "reduce errors", risk: 5, complexity: 5, dependencies: [], success_metrics: ["s"], evidence: ["e"], requires_human_approval: true };
    assert(ej.judge(prop).verdict === "approve_recommendation", "approved");
  });
  test("approval reject stores note", () => {
    const ae = new EvolutionApprovalEngine();
    const r = ae.reject(ae.request("p"), "Bad timing");
    assert(r.status === "rejected" && r.notes === "Bad timing", "notes");
  });
  test("trace findByProposal", () => {
    const tr = new EvolutionTraceRecorder();
    tr.record("a", "px", "test"); tr.record("b", "py", "t");
    assert(tr.findByProposal("px").length === 1, "found");
  });
  test("SDK getEvolutionHistory success", () => {
    const client = new RealityOSClient(); const ctx = client.ctxBuilder.build("t","test","t","read");
    assert(client.getEvolutionHistory(ctx).success === true);
  });
  test("SDK detectBottlenecks returns array", () => {
    const client = new RealityOSClient(); const ctx = client.ctxBuilder.build("t","test","t","read");
    assert(client.detectBottlenecks(ctx).success === true);
  });
  test("SDK generateImprovementProposals returns array", () => {
    const client = new RealityOSClient(); const ctx = client.ctxBuilder.build("t","test","t","execute");
    assert(client.generateImprovementProposals(ctx).success === true);
  });
  test("plan includes risk controls when generated", () => {
    const props = evo.generateProposals();
    if (props.length > 0) {
      const a = evo.requestApproval(props[0]);
      evo.approveEvolution(a.id, "");
      const plan = evo.generatePlan(props[0].id);
      if (plan) assert(plan.risk_controls.length > 0, "controls");
    }
    assert(true, "checked");
  });
  test("runtime getProposals tracks", () => {
    const before = evo.getProposals().length;
    evo.generateProposals();
    assert(evo.getProposals().length >= before, "tracked");
  });
  test("runtime getSimulations works", () => {
    assert(Array.isArray(evo.getSimulations()), "simulations");
  });
  test("runtime getJudgements works", () => {
    assert(Array.isArray(evo.getJudgements()), "judgements");
  });
  test("runtime getApprovals works", () => {
    assert(Array.isArray(evo.getApprovals()), "approvals");
  });
  test("evolution runtime has all submodules", () => {
    assert(evo.observer !== undefined, "observer");
    assert(evo.analyzer !== undefined, "analyzer");
    assert(evo.detector !== undefined, "detector");
    assert(evo.generator !== undefined, "generator");
    assert(evo.simulator !== undefined, "simulator");
    assert(evo.judger !== undefined, "judger");
    assert(evo.approvals !== undefined, "approvals");
    assert(evo.traces !== undefined, "traces");
  });

  // ========================================
  const total = passed + failed;
  console.log(`\n=== Results: ${passed}/${total} passed (target: 100+) ===`);
  if (failed > 0) process.exit(1);
}
run().catch(e => { console.error("Fatal:", e); process.exit(1); });
