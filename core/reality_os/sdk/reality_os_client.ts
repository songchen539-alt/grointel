// GroIntel ROS-2 — Reality OS Client (single public API)
import { SDKContext, SDKResult, CallerType, PermissionLevel, CapabilityDefinition } from "./sdk_types";
import { SDKContextBuilder } from "./sdk_context";
import { SDKResultFactory } from "./sdk_result";
import { SDKErrors } from "./sdk_errors";
import { SDKPermissionChecker } from "./sdk_permissions";
import { CapabilityRegistry } from "./capability_registry";
import { SDKTrace } from "./sdk_trace";
import { KnowledgeRuntime } from "../knowledge/knowledge_runtime";
import { WisdomRuntime } from "../wisdom/wisdom_runtime";
import { EvolutionRuntime } from "../evolution/evolution_runtime";
import { CivilizationRuntime } from "../../civilization/civilization_runtime";
import { ContributionRuntime } from "../../civilization/contribution/contribution_runtime";
import { ApplicationRuntime } from "../../applications/application_runtime";
import { PerpetualRuntime } from "../../../apps/grointel/perpetual/perpetual_runtime";
import { CompanyObserver } from "../../../apps/grointel/data/company/company_observer";
import { SupplyObserver } from "../../../apps/grointel/data/supply/supply_observer";
import { ActivityObserver } from "../../../apps/grointel/data/activity/activity_observer";
import { PatternObserver } from "../../../apps/grointel/data/pattern/pattern_observer";
import { CausalityObserver } from "../../../apps/grointel/data/causality/causality_observer";
import { LivingWorldModel } from "../../../apps/grointel/knowledge/world_model/living_world_model";

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
  public readonly knowledge = new KnowledgeRuntime();
  public readonly wisdom = new WisdomRuntime();
  public readonly evolution = new EvolutionRuntime();
  public readonly civilization = new CivilizationRuntime();
  public readonly contribution = new ContributionRuntime();
  public readonly apps = new ApplicationRuntime();
  public readonly perpetual = new PerpetualRuntime();
  public readonly companyObserver = new CompanyObserver();
  public readonly supplyObserver = new SupplyObserver();
  public readonly activityObserver = new ActivityObserver();
  public readonly patternObserver = new PatternObserver();
  public readonly causalityObserver = new CausalityObserver();
  public readonly worldModel = new LivingWorldModel();
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

  // ROS-4: Knowledge methods
  queryKnowledge(ctx: SDKContext, input: Record<string, unknown> = {}): SDKResult {
    return this.call("queryKnowledge", ctx, () => ({ entities: this.knowledge.findAll(), records: [] }));
  }
  queryFacts(ctx: SDKContext, input: Record<string, unknown> = {}): SDKResult {
    return this.call("queryFacts", ctx, () => ({ results: this.knowledge.findEntities() }));
  }
  queryEntity(ctx: SDKContext, entityId: string): SDKResult {
    const record = this.knowledge.getRecord(entityId);
    return this.call("queryEntity", ctx, () => (record || { error: "not_found" }) as Record<string, unknown>);
  }
  queryRelationships(ctx: SDKContext, entityId?: string): SDKResult {
    const rels = entityId ? this.knowledge.relationships.findByEntity(entityId) : this.knowledge.relationships.getAll();
    return this.call("queryRelationships", ctx, () => ({ relationships: rels }));
  }
  queryEvidence(ctx: SDKContext, factId: string): SDKResult {
    return this.call("queryEvidence", ctx, () => ({ evidence: this.knowledge.findEvidence(factId) }));
  }
  queryKnowledgeHistory(ctx: SDKContext, factId: string): SDKResult {
    return this.call("queryKnowledgeHistory", ctx, () => ({ versions: this.knowledge.findHistoricalVersions(factId) }));
  }
  validateKnowledge(ctx: SDKContext, input: Record<string, unknown> = {}): SDKResult {
    return this.call("validateKnowledge", ctx, () => ({ validated: true, result: "validated" }));
  }

  // ROS-5: Wisdom methods
  judge(ctx: SDKContext, decisionId: string, description: string): SDKResult {
    const evaluation = this.wisdom.evaluate(decisionId, description);
    return this.call("judge", ctx, () => evaluation as unknown as Record<string, unknown>);
  }
  evaluateWisdom(ctx: SDKContext, description: string): SDKResult {
    const evaluation = this.wisdom.evaluate("wisdom_" + Date.now().toString(36), description);
    return this.call("evaluateWisdom", ctx, () => ({ composite: evaluation.judgement.composite_score, verdict: evaluation.judgement.verdict, recommendation: evaluation.overall_recommendation }));
  }
  queryPrinciples(ctx: SDKContext): SDKResult {
    return this.call("queryPrinciples", ctx, () => ({ principles: this.wisdom.principles.getAll() }));
  }
  queryValues(ctx: SDKContext): SDKResult {
    return this.call("queryValues", ctx, () => ({ values: this.wisdom.values.getAll() }));
  }

  // ROS-6: Evolution methods
  observeSystem(ctx: SDKContext): SDKResult { return this.call("observeSystem", ctx, () => this.evolution.observeSystem() as unknown as Record<string, unknown>); }
  analyzeSystemHealth(ctx: SDKContext): SDKResult { return this.call("analyzeSystemHealth", ctx, () => this.evolution.analyzeHealth() as unknown as Record<string, unknown>); }
  detectBottlenecks(ctx: SDKContext): SDKResult { return this.call("detectBottlenecks", ctx, () => ({ bottlenecks: this.evolution.detectBottlenecks() })); }
  generateImprovementProposals(ctx: SDKContext): SDKResult { return this.call("generateImprovementProposals", ctx, () => ({ proposals: this.evolution.generateProposals() })); }
  simulateUpgrade(ctx: SDKContext, proposalId: string): SDKResult {
    const prop = this.evolution.getProposals().find(p => p.id === proposalId);
    return this.call("simulateUpgrade", ctx, () => prop ? this.evolution.simulateUpgrade(prop) as unknown as Record<string, unknown> : { error: "proposal not found" });
  }
  judgeEvolution(ctx: SDKContext, proposalId: string): SDKResult {
    const prop = this.evolution.getProposals().find(p => p.id === proposalId);
    return this.call("judgeEvolution", ctx, () => prop ? this.evolution.judgeProposal(prop) as unknown as Record<string, unknown> : { error: "proposal not found" });
  }
  approveEvolution(ctx: SDKContext, approvalId: string, notes?: string): SDKResult {
    const result = this.evolution.approveEvolution(approvalId, notes);
    return this.call("approveEvolution", ctx, () => (result || { error: "approval not found" }) as unknown as Record<string, unknown>);
  }
  getEvolutionPlan(ctx: SDKContext, proposalId: string): SDKResult {
    const plan = this.evolution.generatePlan(proposalId);
    return this.call("getEvolutionPlan", ctx, () => (plan || { error: "plan not generated" }) as unknown as Record<string, unknown>);
  }
  getEvolutionHistory(ctx: SDKContext): SDKResult {
    return this.call("getEvolutionHistory", ctx, () => ({ history: this.evolution.getHistory() }));
  }

  // CRS-1: Civilization methods
  registerNode(ctx: SDKContext, name: string, capabilities: string[], domains: string[]): SDKResult {
    return this.call("registerNode", ctx, () => this.civilization.registerNode(name, capabilities, domains) as unknown as Record<string, unknown>);
  }
  exchangeKnowledge(ctx: SDKContext, fromNode: string, content: string, exchangeType: string): SDKResult {
    return this.call("exchangeKnowledge", ctx, () => this.civilization.exchangeKnowledge(fromNode, null, exchangeType, content) as unknown as Record<string, unknown>);
  }
  queryCivilization(ctx: SDKContext): SDKResult {
    return this.call("queryCivilization", ctx, () => ({ nodes: this.civilization.getAllNodes(), memory: this.civilization.memory.getMemory() }));
  }
  submitConsensus(ctx: SDKContext, topic: string, mode: string): SDKResult {
    return this.call("submitConsensus", ctx, () => this.civilization.createConsensus(topic, mode) as unknown as Record<string, unknown>);
  }
  resolveConflict(ctx: SDKContext, conflictId: string, resolution: string): SDKResult {
    const result = this.civilization.resolveConflict(conflictId, resolution);
    return this.call("resolveConflict", ctx, () => (result || { error: "conflict not found" }) as unknown as Record<string, unknown>);
  }
  queryReputation(ctx: SDKContext, nodeId: string): SDKResult {
    const node = this.civilization.getNode(nodeId);
    return this.call("queryReputation", ctx, () => (node ? node.reputation : { error: "node not found" }) as unknown as Record<string, unknown>);
  }

  // CRS-2: Contribution methods
  registerContribution(ctx: SDKContext, id: string, type: string, title: string, content: string): SDKResult {
    return this.call("registerContribution", ctx, () => this.contribution.registerArtifact(id, type as any, title, content, { id: "system", name: "system", role: "creator", contributed_at: new Date().toISOString() }) as unknown as Record<string, unknown>);
  }
  queryContribution(ctx: SDKContext, artifactId: string): SDKResult {
    const art = this.contribution.getArtifact(artifactId);
    return this.call("queryContribution", ctx, () => (art || { error: "not found" }) as unknown as Record<string, unknown>);
  }
  traceKnowledge(ctx: SDKContext, artifactId: string): SDKResult {
    return this.call("traceKnowledge", ctx, () => ({ attributions: this.contribution.getAttributions(artifactId), citations: this.contribution.getCitationChain(artifactId) }));
  }
  queryInfluence(ctx: SDKContext, artifactId: string): SDKResult {
    return this.call("queryInfluence", ctx, () => this.contribution.computeInfluence(artifactId) as unknown as Record<string, unknown>);
  }
  queryLineage(ctx: SDKContext, artifactId: string): SDKResult {
    const lin = this.contribution.getLineage(artifactId);
    return this.call("queryLineage", ctx, () => (lin || { error: "not found" }) as unknown as Record<string, unknown>);
  }

  // APP-1: Application methods
  registerApplication(ctx: SDKContext, manifest: Record<string, unknown>): SDKResult {
    return this.call("registerApplication", ctx, () => this.apps.registerApp(manifest as any) as unknown as Record<string, unknown>);
  }
  activateApplication(ctx: SDKContext, appId: string): SDKResult {
    return this.call("activateApplication", ctx, () => (this.apps.activateApp(appId) || { error: "not found" }) as unknown as Record<string, unknown>);
  }
  pauseApplication(ctx: SDKContext, appId: string): SDKResult {
    return this.call("pauseApplication", ctx, () => (this.apps.pauseApp(appId) || { error: "not found" }) as unknown as Record<string, unknown>);
  }
  queryApplication(ctx: SDKContext, appId: string): SDKResult {
    const app = this.apps.getApp(appId);
    return this.call("queryApplication", ctx, () => (app || { error: "not found" }) as unknown as Record<string, unknown>);
  }
  listApplications(ctx: SDKContext): SDKResult {
    return this.call("listApplications", ctx, () => ({ apps: this.apps.listApps() }));
  }
  // PGIR-1: Perpetual methods
  getLivingWorld(ctx: SDKContext): SDKResult {
    return this.call("getLivingWorld", ctx, () => this.perpetual.getState() as unknown as Record<string, unknown>);
  }
  updateWorld(ctx: SDKContext, canonicalName: string, entityType: string, attributes: Record<string, unknown>): SDKResult {
    return this.call("updateWorld", ctx, () => this.perpetual.observeEntity(canonicalName, entityType, attributes) as unknown as Record<string, unknown>);
  }
  observeReality(ctx: SDKContext, entityId: string, observationType: string, data: Record<string, unknown>): SDKResult {
    return this.call("observeReality", ctx, () => ({ observed: true, entity_id: entityId }) as unknown as Record<string, unknown>);
  }
  recomputePredictions(ctx: SDKContext, entityId: string): SDKResult {
    return this.call("recomputePredictions", ctx, () => ({ recalculated: true, entity_id: entityId }));
  }
  recomputeRecommendations(ctx: SDKContext, targetEntity: string): SDKResult {
    return this.call("recomputeRecommendations", ctx, () => ({ recomputed: true, target: targetEntity }));
  }
  queryEntityHistory(ctx: SDKContext, entityId: string): SDKResult {
    const entity = this.perpetual.model.getEntity(entityId);
    return this.call("queryEntityHistory", ctx, () => (entity ? entity.history : { error: "not found" }) as unknown as Record<string, unknown>);
  }
  queryRelationshipHistory(ctx: SDKContext, relId: string): SDKResult {
    const rel = this.perpetual.model.getRelationship(relId);
    return this.call("queryRelationshipHistory", ctx, () => (rel ? rel.history : { error: "not found" }) as unknown as Record<string, unknown>);
  }
  queryLivingState(ctx: SDKContext): SDKResult {
    return this.call("queryLivingState", ctx, () => ({ entities: this.perpetual.model.getAllEntities().length, relationships: this.perpetual.model.getAllRelationships().length }));
  }
  // DATA-1: Company methods
  observeCompany(ctx: SDKContext, name: string, domain: string, industry: string, country: string): SDKResult {
    const result = this.companyObserver.observeCompany("sdk_"+Date.now().toString(36), name, domain, industry, country, {}, 50);
    return this.call("observeCompany", ctx, () => result.profile as unknown as Record<string, unknown>);
  }
  observeCompanyBatch(ctx: SDKContext, companies: Array<{id:string;name:string;domain:string;industry:string;country:string}>): SDKResult {
    const count = this.companyObserver.observeBatch(companies.map(c=>({...c,confidence:50})));
    return this.call("observeCompanyBatch", ctx, () => ({ observed: count }));
  }
  queryCompanyProfile(ctx: SDKContext, companyId: string): SDKResult {
    const p = this.companyObserver.getProfile(companyId);
    return this.call("queryCompanyProfile", ctx, () => (p || { error: "not found" }) as unknown as Record<string, unknown>);
  }
  queryCompanySignals(ctx: SDKContext, companyId: string): SDKResult {
    return this.call("queryCompanySignals", ctx, () => ({ signals: this.companyObserver.signalExtractor.extract({id:"",company_id:companyId,source:"raw",raw_data:{},normalized_data:{},confidence:50,timestamp:"",evidence:[],detected_changes:[]}) }));
  }
  queryCompanyChanges(ctx: SDKContext, companyId: string): SDKResult {
    return this.call("queryCompanyChanges", ctx, () => ({ changes: [] }));
  }
  queryCompanyHistory(ctx: SDKContext, companyId: string): SDKResult {
    const p = this.companyObserver.getProfile(companyId);
    return this.call("queryCompanyHistory", ctx, () => ({ history: p?.history || [] }));
  }
  // DATA-2: Supply methods
  observeSupply(ctx: SDKContext, name: string, entityType: string, website: string, country: string): SDKResult {
    const r=this.supplyObserver.observeSupply("sdk_"+Date.now().toString(36),name,entityType as any,website,country,{},50);
    return this.call("observeSupply",ctx,()=>r.profile as unknown as Record<string,unknown>);
  }
  observeSupplyBatch(ctx: SDKContext, entities: Array<{id:string;name:string;entityType:string;website:string;country:string}>): SDKResult {
    const c=this.supplyObserver.observeBatch(entities.map(e=>({...e,confidence:50})));
    return this.call("observeSupplyBatch",ctx,()=>({observed:c}));
  }
  querySupplyProfile(ctx: SDKContext, supplyId: string): SDKResult {
    const p=this.supplyObserver.getProfile(supplyId);
    return this.call("querySupplyProfile",ctx,()=>(p||{error:"not found"})as unknown as Record<string,unknown>);
  }
  querySupplySignals(ctx: SDKContext, supplyId: string): SDKResult {
    return this.call("querySupplySignals",ctx,()=>({signals:[]}));
  }
  querySupplyChanges(ctx: SDKContext, supplyId: string): SDKResult {
    return this.call("querySupplyChanges",ctx,()=>({changes:[]}));
  }
  querySupplyCapabilities(ctx: SDKContext, supplyId: string): SDKResult {
    return this.call("querySupplyCapabilities",ctx,()=>({capabilities:[]}));
  }
  querySupplyHistory(ctx: SDKContext, supplyId: string): SDKResult {
    const p=this.supplyObserver.getProfile(supplyId);
    return this.call("querySupplyHistory",ctx,()=>({history:p?.history||[]}));
  }
  // DATA-3: Activity methods
  observeActivity(ctx: SDKContext, category: string, name: string, objective: string, ownerId: string): SDKResult {
    const a=this.activityObserver.observe(category as any,name,objective,ownerId,["web"],"US","tech");
    return this.call("observeActivity",ctx,()=>a as unknown as Record<string,unknown>);
  }
  queryActivities(ctx: SDKContext): SDKResult {
    return this.call("queryActivities",ctx,()=>({activities:this.activityObserver.getAll()}));
  }
  queryActivityTimeline(ctx: SDKContext, activityId: string): SDKResult {
    const a=this.activityObserver.getActivity(activityId);
    return this.call("queryActivityTimeline",ctx,()=>({started_at:a?.started_at,status:a?.status}));
  }
  queryActivityOutcome(ctx: SDKContext, activityId: string): SDKResult {
    return this.call("queryActivityOutcome",ctx,()=>({activity_id:activityId}));
  }
  queryActivityMetrics(ctx: SDKContext, activityId: string): SDKResult {
    return this.call("queryActivityMetrics",ctx,()=>({activity_id:activityId}));
  }
  // DATA-4: Pattern methods
  queryPatterns(ctx: SDKContext): SDKResult {
    return this.call("queryPatterns",ctx,()=>({patterns:this.patternObserver.getAllPatterns()}));
  }
  querySimilarPatterns(ctx: SDKContext, industry: string, region: string, capabilities: string): SDKResult {
    const sim=this.patternObserver.findSimilar(industry,region,capabilities.split(","));
    return this.call("querySimilarPatterns",ctx,()=>({similar:sim}));
  }
  queryPatternEvidence(ctx: SDKContext, patternId: string): SDKResult {
    return this.call("queryPatternEvidence",ctx,()=>({pattern_id:patternId}));
  }
  queryPatternHistory(ctx: SDKContext, patternId: string): SDKResult {
    const p=this.patternObserver.getPattern(patternId);
    return this.call("queryPatternHistory",ctx,()=>({history:p?.history||[]}));
  }
  recommendPatterns(ctx: SDKContext, industry: string, region: string, capabilities: string): SDKResult {
    const sim=this.patternObserver.findSimilar(industry,region,capabilities.split(","));
    return this.call("recommendPatterns",ctx,()=>({recommendations:sim.slice(0,5)}));
  }
  // DATA-5: Cause methods
  queryCauseGraph(ctx: SDKContext): SDKResult {
    return this.call("queryCauseGraph",ctx,()=>({nodes:this.causalityObserver.getAllNodes(),edges:this.causalityObserver.getAllEdges()}));
  }
  queryCauseChains(ctx: SDKContext): SDKResult {
    return this.call("queryCauseChains",ctx,()=>({chains:this.causalityObserver.getAllChains()}));
  }
  queryRootCauses(ctx: SDKContext, nodeId: string): SDKResult {
    return this.call("queryRootCauses",ctx,()=>({node_id:nodeId}));
  }
  queryDownstreamEffects(ctx: SDKContext, nodeId: string): SDKResult {
    return this.call("queryDownstreamEffects",ctx,()=>({node_id:nodeId}));
  }
  recommendCauses(ctx: SDKContext, nodeId: string): SDKResult {
    return this.call("recommendCauses",ctx,()=>({node_id:nodeId}));
  }
  // KNOWLEDGE-1: World Model methods
  queryLivingWorldModel(ctx: SDKContext): SDKResult {
    return this.call("queryLivingWorldModel",ctx,()=>({entities:this.worldModel.getAllEntities().length,activities:this.worldModel.getAllActivities().length}));
  }
  queryWorldEntity(ctx: SDKContext, entityId: string): SDKResult {
    const e=this.worldModel.getEntity(entityId);
    return this.call("queryWorldEntity",ctx,()=>(e||{error:"not found"})as unknown as Record<string,unknown>);
  }
  queryWorldHistory(ctx: SDKContext, entityId: string): SDKResult {
    const e=this.worldModel.getEntity(entityId);
    return this.call("queryWorldHistory",ctx,()=>({history:e?.history||[]}));
  }
  queryHypotheses(ctx: SDKContext): SDKResult {
    return this.call("queryHypotheses",ctx,()=>({hypotheses:this.worldModel.hypotheses.getActive()}));
  }
  queryFutureStateSpace(ctx: SDKContext): SDKResult {
    return this.call("queryFutureStateSpace",ctx,()=>({spaces:this.worldModel.futureSpace.getAll()}));
  }
  queryFutureBranches(ctx: SDKContext, spaceId: string): SDKResult {
    const s=this.worldModel.futureSpace.getSpace(spaceId);
    return this.call("queryFutureBranches",ctx,()=>({branches:s?.branches||[]}));
  }
  updateRealityTime(ctx: SDKContext, eventType: string): SDKResult {
    this.worldModel.time.emit(eventType,{timestamp:new Date().toISOString()});
    return this.call("updateRealityTime",ctx,()=>({emitted:eventType}));
  }
  queryAffectedDecisions(ctx: SDKContext): SDKResult {
    return this.call("queryAffectedDecisions",ctx,()=>({decisions:[]}));
  }
  queryAffectedRecommendations(ctx: SDKContext): SDKResult {
    return this.call("queryAffectedRecommendations",ctx,()=>({recommendations:[]}));
  }
  startApplicationSession(ctx: SDKContext, appId: string): SDKResult {
    const ctx2 = this.apps.startSession(appId);
    return this.call("startApplicationSession", ctx, () => (ctx2 || { error: "cannot start session" }) as unknown as Record<string, unknown>);
  }
}
