// GroIntel ROS-3 — Agent Runtime (uses only RealityOSClient SDK)
import { AgentInstance, AgentDefinition, AgentGoal, LifecycleState, AgentTrace, HealthReport, AgentValues, AgentMission } from "./agent_types";
import { AgentIdentityFactory } from "./agent_identity";
import { AgentMemoryManager } from "./agent_memory";
import { AgentLifecycleManager } from "./agent_lifecycle";
import { AgentScheduler } from "./agent_scheduler";
import { AgentSupervisor } from "./agent_supervisor";
import { AgentTraceRecorder } from "./agent_trace";
import { AgentRegistry } from "./agent_registry";
import { RealityOSClient } from "../sdk/reality_os_client";

let gCounter = 0;
function genGoalId(): string { return "ag_" + (++gCounter).toString(16).padStart(6, "0"); }

export class AgentRuntime {
  public readonly identityFactory = new AgentIdentityFactory();
  public readonly memoryManager = new AgentMemoryManager();
  public readonly lifecycle = new AgentLifecycleManager();
  public readonly scheduler = new AgentScheduler();
  public readonly supervisor = new AgentSupervisor();
  public readonly traces = new AgentTraceRecorder();
  public readonly registry = new AgentRegistry();
  public readonly sdk = new RealityOSClient();

  private agents: Map<string, AgentInstance> = new Map();

  create(agentName: string): AgentInstance {
    const def = this.registry.get(agentName);
    if (!def) throw new Error(`Agent definition '${agentName}' not found`);

    const identity = this.identityFactory.create(def);
    const memory = this.memoryManager.create();
    const values: AgentValues = { honesty: 80, curiosity: 75, prudence: 70, cooperation: 85, growth: 80 };
    const mission: AgentMission = {
      statement: def.mission,
      primary_objective: def.long_term_goals[0] || "Unknown",
      secondary_objectives: def.long_term_goals.slice(1),
      constraints: [],
      success_criteria: def.short_term_goals,
    };
    const goals: AgentGoal[] = [
      ...def.long_term_goals.map((g, i) => ({ id: genGoalId(), description: g, priority: 10 - i, status: "active" as const, created_at: new Date().toISOString(), completed_at: null })),
      ...def.short_term_goals.map((g, i) => ({ id: genGoalId(), description: g, priority: 5 - i, status: "active" as const, created_at: new Date().toISOString(), completed_at: null })),
    ];

    const agent: AgentInstance = {
      identity, mission, values, state: "created",
      memory, goals, active_workflow_ids: [],
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      cycle_count: 0,
    };
    this.agents.set(identity.id, agent);
    return agent;
  }

  get(id: string): AgentInstance | null { return this.agents.get(id) || null; }
  getAll(): AgentInstance[] { return Array.from(this.agents.values()); }

  boot(agent: AgentInstance): void {
    this.lifecycle.transition(agent.state, "booting");
    agent.state = "booting"; agent.updated_at = new Date().toISOString();
    this.lifecycle.transition(agent.state, "idle");
    agent.state = "idle"; agent.updated_at = new Date().toISOString();
    this.scheduler.scheduleContinuous(agent.identity.id);
  }

  cycle(agent: AgentInstance): AgentTrace {
    const cycleNum = ++agent.cycle_count;
    const trace = this.traces.create(agent, cycleNum);

    try {
      // Observe phase
      this.lifecycle.transition(agent.state, "observing");
      agent.state = "observing";
      this.doObserve(agent, trace);

      // Reason phase
      this.lifecycle.transition(agent.state, "reasoning");
      agent.state = "reasoning";
      this.doReason(agent, trace);

      // Plan phase
      this.lifecycle.transition(agent.state, "planning");
      agent.state = "planning";
      this.doPlan(agent, trace);

      // Return to idle
      this.lifecycle.transition(agent.state, "idle");
      agent.state = "idle";
    } catch (e: any) {
      this.traces.recordError(trace, e.message);
    }

    trace.completed_at = new Date().toISOString();
    agent.updated_at = new Date().toISOString();
    return trace;
  }

  private doObserve(agent: AgentInstance, trace: AgentTrace): void {
    const ctx = this.sdk.ctxBuilder.build(agent.identity.id, "agent", agent.identity.mission, "write");
    const start = Date.now();
    const r = this.sdk.observe(ctx, { domain: agent.identity.role });
    this.traces.recordSDKCall(trace, "observe", r.success, Date.now() - start);
    if (r.success) this.memoryManager.recordEpisodic(agent.memory, `Observed ${agent.identity.role} events`, 5);
    this.traces.recordAction(trace, "observe", r.success ? "observed" : "observe failed", Date.now() - start);

    const ctx2 = this.sdk.ctxBuilder.build(agent.identity.id, "agent", agent.identity.mission, "read");
    const start2 = Date.now();
    const stateR = this.sdk.getWorldState(ctx2);
    this.traces.recordSDKCall(trace, "getWorldState", stateR.success, Date.now() - start2);
    if (stateR.success) this.memoryManager.updateWorking(agent.memory, "world_state", stateR.data);
  }

  private doReason(agent: AgentInstance, trace: AgentTrace): void {
    const ctx = this.sdk.ctxBuilder.build(agent.identity.id, "agent", agent.identity.mission, "execute");
    const start = Date.now();
    const r = this.sdk.cognize(ctx, { domain: agent.identity.role });
    this.traces.recordSDKCall(trace, "cognize", r.success, Date.now() - start);
    if (r.success) this.memoryManager.recordLearning(agent.memory, "Cognition cycle completed", "kernel");
    this.traces.recordAction(trace, "cognize", r.success ? "cognized" : "cognize failed", Date.now() - start);
  }

  private doPlan(agent: AgentInstance, trace: AgentTrace): void {
    // Plan using SDK — decide what workflow to run next
    const ctx = this.sdk.ctxBuilder.build(agent.identity.id, "agent", agent.identity.mission, "execute");

    const start = Date.now();
    const r = this.sdk.plan(ctx, { goals: agent.goals.map(g => g.description) });
    this.traces.recordSDKCall(trace, "plan", r.success, Date.now() - start);
    if (r.success) this.memoryManager.updateWorking(agent.memory, "current_plan", r.data);
    this.traces.recordAction(trace, "plan", r.success ? "planned" : "plan failed", Date.now() - start);
  }

  pause(agent: AgentInstance): void {
    if (agent.state === "idle" || agent.state === "waiting" || agent.state === "sleeping") {
      this.lifecycle.transition(agent.state, "paused");
      agent.state = "paused"; agent.updated_at = new Date().toISOString();
    }
  }

  resume(agent: AgentInstance): void {
    if (agent.state === "paused") {
      this.lifecycle.transition(agent.state, "idle");
      agent.state = "idle"; agent.updated_at = new Date().toISOString();
    }
  }

  terminate(agent: AgentInstance): void {
    if (this.lifecycle.canTransition(agent.state, "terminated")) {
      this.lifecycle.transition(agent.state, "terminated");
      agent.state = "terminated"; agent.updated_at = new Date().toISOString();
    }
  }

  runCycles(agent: AgentInstance, count: number): AgentTrace[] {
    return Array.from({ length: count }, () => this.cycle(agent));
  }

  assignWorkflow(agent: AgentInstance, workflowDefId: string): boolean {
    const ctx = this.sdk.ctxBuilder.build(agent.identity.id, "agent", "Run workflow", "execute");
    const r = this.sdk.startWorkflow(ctx, { definition_id: workflowDefId });
    if (r.success) {
      agent.active_workflow_ids.push((r.data as any)?.instance_id || "unknown");
      this.memoryManager.recordWorkflow(agent.memory, (r.data as any)?.instance_id || "unknown", workflowDefId, "started");
      return true;
    }
    return false;
  }

  getHealthReport(agent: AgentInstance): HealthReport {
    return this.supervisor.generateReport(agent);
  }
}
