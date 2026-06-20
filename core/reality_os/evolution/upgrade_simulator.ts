// GroIntel ROS-6 — Upgrade Simulator
import { ImprovementProposal, UpgradeSimulation } from "./evolution_types";

let sCounter = 0;
function genId(): string { return "sim_" + (++sCounter).toString(16).padStart(6, "0"); }

export class UpgradeSimulator {
  simulate(proposal: ImprovementProposal): UpgradeSimulation {
    const healthDelta = Math.round((100 - proposal.risk) * 0.3 - proposal.complexity * 0.1 + 5);
    const riskDelta = -Math.round(proposal.risk * 0.5);
    const complexityDelta = Math.round(proposal.complexity * 0.3);

    const testImpact = complexityDelta > 10 ? "Requires new test suite additions" : "Minimal test impact";
    const runtimeImpact = riskDelta < -10 ? "May temporarily increase latency during rollout" : "No significant runtime impact expected";
    const knowledgeImpact = proposal.affected_layer === "knowledge" ? "Improves knowledge quality and confidence" : "No direct knowledge impact";
    const agentImpact = proposal.affected_layer === "agent" ? "Agents will resume normal operation after update" : "No direct agent impact";

    return {
      id: genId(), proposal_id: proposal.id,
      expected_health_delta: Math.max(-30, Math.min(30, healthDelta)),
      expected_risk_delta: Math.max(-50, Math.min(0, riskDelta)),
      expected_complexity_delta: Math.max(0, Math.min(50, complexityDelta)),
      expected_test_impact: testImpact,
      expected_runtime_impact: runtimeImpact,
      expected_knowledge_impact: knowledgeImpact,
      expected_agent_impact: agentImpact,
      confidence: Math.max(30, 80 - proposal.risk * 0.3),
    };
  }
}
