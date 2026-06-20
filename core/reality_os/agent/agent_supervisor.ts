// GroIntel ROS-3 — Agent Supervisor
import { AgentInstance, HealthReport } from "./agent_types";

export class AgentSupervisor {
  generateReport(agent: AgentInstance): HealthReport {
    const memoryGrowth = Object.keys(agent.memory.episodic).length + Object.keys(agent.memory.semantic).length;
    const errCount = 0;
    const goalsTotal = agent.goals.length;
    const goalsDone = agent.goals.filter(g => g.status === "completed").length;
    const stalled = agent.state !== "terminated" && agent.cycle_count === 0;
    const failures = 0;
    const exceptions = 0;

    let status: HealthReport["status"] = "healthy";
    if (stalled) status = "stalled";
    else if (failures > 5) status = "warning";
    else if (exceptions > 3) status = "critical";

    return {
      agent_id: agent.identity.id, status,
      memory_growth: memoryGrowth, workflow_load: agent.active_workflow_ids.length,
      goals_completed: goalsDone, goals_total: goalsTotal,
      reasoning_failures: failures, runtime_exceptions: exceptions,
      cycles_total: agent.cycle_count, last_active: agent.updated_at,
    };
  }

  static isHealthy(report: HealthReport): boolean { return report.status === "healthy"; }
}
