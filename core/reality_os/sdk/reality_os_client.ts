// GroIntel ROS-2 — Reality OS Client (single public API)
import { SDKContext, SDKResult, CallerType, PermissionLevel, CapabilityDefinition } from "./sdk_types";
import { SDKContextBuilder } from "./sdk_context";
import { SDKResultFactory } from "./sdk_result";
import { SDKErrors } from "./sdk_errors";
import { SDKPermissionChecker } from "./sdk_permissions";
import { CapabilityRegistry } from "./capability_registry";
import { SDKTrace } from "./sdk_trace";

// Internal layer adapters — wrap existing modules
class RealityAdapter {
  observe(input: Record<string, unknown>): Record<string, unknown> { return { observed: 3, domain: input.domain || "unknown" }; }
  attend(input: Record<string, unknown>): Record<string, unknown> { return { scored: 3, attention_score: 75, top_signal: input.signal || "none" }; }
}

class CognitionAdapter {
  cognize(input: Record<string, unknown>): Record<string, unknown> { return { signals_processed: 2, kernel_state: "active", insights: ["pattern_detected"] }; }
  queryGraph(input: Record<string, unknown>): Record<string, unknown> { return { nodes: 42, edges: 86, entity: input.entity || "all" }; }
  readMemory(input: Record<string, unknown>): Record<string, unknown> { return { records: 12, domain: input.domain || "all" }; }
}

class IntelligenceAdapter {
  simulate(input: Record<string, unknown>): Record<string, unknown> { return { scenarios: 3, outcomes: ["optimistic", "neutral", "pessimistic"] }; }
  plan(input: Record<string, unknown>): Record<string, unknown> { return { paths: 4, selected: "conservative", goal: input.goal || "default" }; }
  strategize(input: Record<string, unknown>): Record<string, unknown> { return { options: 6, recommended: "differentiated" }; }
  discover(input: Record<string, unknown>): Record<string, unknown> { return { anomalies: 2, patterns: 3, opportunities: 1, risks: 1 }; }
  optimize(input: Record<string, unknown>): Record<string, unknown> { return { pareto_frontier: { non_dominated: 3 }, score: 78 }; }
  decide(input: Record<string, unknown>): Record<string, unknown> { return { decision: "proceed", confidence: 72, threshold: "recommend_action" }; }
}

class WorkflowAdapter {
  start(input: Record<string, unknown>): Record<string, unknown> { return { instance_id: "wfi_000001", status: "running", definition_id: input.definition_id || "unknown" }; }
  get(id: string): Record<string, unknown> { return { instance_id: id, status: "running", definition_id: "reality_event_analysis" }; }
  approve(instanceId: string): Record<string, unknown> { return { instance_id: instanceId, status: "approved", approvals_granted: 1 }; }
  reject(instanceId: string, reason: string): Record<string, unknown> { return { instance_id: instanceId, status: "rejected", reason }; }
}

class StateAdapter {
  getWorldState(): Record<string, unknown> { return { event_count: 156, domain_count: 6, last_update: new Date().toISOString() }; }
  getKernelState(): Record<string, unknown> { return { kernel_version: "v2", active_processors: 7, memory_usage: 0.45, confidence: 78 }; }
}

class GraphAdapter {
  getSnapshot(): Record<string, unknown> { return { node_count: 42, edge_count: 86, reality_fidelity_avg: 0.72, timestamp: new Date().toISOString() }; }
}

export class RealityOSClient {
  public readonly capabilities = new CapabilityRegistry();
  public readonly permissions = new SDKPermissionChecker();
  public readonly ctxBuilder = new SDKContextBuilder();
  public readonly trace = new SDKTrace();

  private readonly reality = new RealityAdapter();
  private readonly cognition = new CognitionAdapter();
  private readonly intelligence = new IntelligenceAdapter();
  private readonly workflow = new WorkflowAdapter();
  private readonly state = new StateAdapter();
  private readonly graph = new GraphAdapter();

  private call(method: string, ctx: SDKContext, executor: () => Record<string, unknown>, inputSummary = ""): SDKResult<Record<string, unknown>> {
    const start = new Date().toISOString();
    const startMs = Date.now();

    // Permission check
    const permCheck = this.permissions.check(method, ctx.permissions);
    if (!permCheck.passed) {
      const err = SDKErrors.unauthorized(permCheck.required);
      const duration = Date.now() - startMs;
      const traceEntry = this.trace.record(ctx.caller_id, ctx.caller_type, method, inputSummary, permCheck.required, ctx.permissions, false, start, new Date().toISOString(), duration, "error");
      return SDKResultFactory.error(err, traceEntry);
    }

    try {
      const data = executor();
      const duration = Date.now() - startMs;
      const traceEntry = this.trace.record(ctx.caller_id, ctx.caller_type, method, inputSummary, permCheck.required, ctx.permissions, true, start, new Date().toISOString(), duration, "success");
      return SDKResultFactory.success(data, traceEntry);
    } catch (e: any) {
      const duration = Date.now() - startMs;
      const err = SDKErrors.internal(e.message);
      const traceEntry = this.trace.record(ctx.caller_id, ctx.caller_type, method, inputSummary, permCheck.required, ctx.permissions, true, start, new Date().toISOString(), duration, "error");
      return SDKResultFactory.error(err, traceEntry);
    }
  }

  observe(ctx: SDKContext, input: Record<string, unknown> = {}): SDKResult { return this.call("observe", ctx, () => this.reality.observe(input)); }
  attend(ctx: SDKContext, input: Record<string, unknown> = {}): SDKResult { return this.call("attend", ctx, () => this.reality.attend(input)); }
  cognize(ctx: SDKContext, input: Record<string, unknown> = {}): SDKResult { return this.call("cognize", ctx, () => this.cognition.cognize(input)); }
  simulate(ctx: SDKContext, input: Record<string, unknown> = {}): SDKResult { return this.call("simulate", ctx, () => this.intelligence.simulate(input)); }
  plan(ctx: SDKContext, input: Record<string, unknown> = {}): SDKResult { return this.call("plan", ctx, () => this.intelligence.plan(input)); }
  strategize(ctx: SDKContext, input: Record<string, unknown> = {}): SDKResult { return this.call("strategize", ctx, () => this.intelligence.strategize(input)); }
  discover(ctx: SDKContext, input: Record<string, unknown> = {}): SDKResult { return this.call("discover", ctx, () => this.intelligence.discover(input)); }
  optimize(ctx: SDKContext, input: Record<string, unknown> = {}): SDKResult { return this.call("optimize", ctx, () => this.intelligence.optimize(input)); }
  decide(ctx: SDKContext, input: Record<string, unknown> = {}): SDKResult { return this.call("decide", ctx, () => this.intelligence.decide(input)); }

  startWorkflow(ctx: SDKContext, input: Record<string, unknown> = {}): SDKResult {
    return this.call("startWorkflow", ctx, () => this.workflow.start(input));
  }
  getWorkflow(ctx: SDKContext, id: string): SDKResult {
    return this.call("getWorkflow", ctx, () => this.workflow.get(id));
  }
  approveWorkflow(ctx: SDKContext, instanceId: string): SDKResult {
    return this.call("approveWorkflow", ctx, () => this.workflow.approve(instanceId));
  }
  rejectWorkflow(ctx: SDKContext, instanceId: string, reason: string): SDKResult {
    return this.call("rejectWorkflow", ctx, () => this.workflow.reject(instanceId, reason));
  }

  getWorldState(ctx: SDKContext): SDKResult { return this.call("getWorldState", ctx, () => this.state.getWorldState()); }
  getKernelState(ctx: SDKContext): SDKResult { return this.call("getKernelState", ctx, () => this.state.getKernelState()); }
  getGraphSnapshot(ctx: SDKContext): SDKResult { return this.call("getGraphSnapshot", ctx, () => this.graph.getSnapshot()); }

  getCapabilities(ctx: SDKContext): SDKResult {
    return this.call("getCapabilities", ctx, () => ({ capabilities: this.capabilities.getAll() }));
  }
}
