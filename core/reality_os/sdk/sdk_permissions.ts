// GroIntel ROS-2 — SDK Permissions
import { PermissionLevel, MethodClass } from "./sdk_types";

const METHOD_CLASS: Record<string, MethodClass> = {
  observe: "WRITE",
  attend: "EXECUTE", cognize: "EXECUTE", simulate: "EXECUTE", plan: "EXECUTE",
  strategize: "EXECUTE", discover: "EXECUTE", optimize: "EXECUTE", decide: "EXECUTE",
  startWorkflow: "EXECUTE", getWorkflow: "READ",
  approveWorkflow: "APPROVE", rejectWorkflow: "APPROVE",
  queryKnowledge: "READ", queryFacts: "READ", queryEntity: "READ",
  queryRelationships: "READ", queryEvidence: "READ", queryKnowledgeHistory: "READ", validateKnowledge: "EXECUTE",
  getWorldState: "READ", getKernelState: "READ", getGraphSnapshot: "READ", getCapabilities: "READ",
  judge: "EXECUTE", evaluateWisdom: "EXECUTE", queryPrinciples: "READ", queryValues: "READ",
  observeSystem: "READ", analyzeSystemHealth: "READ", detectBottlenecks: "READ",
  generateImprovementProposals: "EXECUTE", simulateUpgrade: "EXECUTE",
  judgeEvolution: "EXECUTE", approveEvolution: "APPROVE",
  getEvolutionPlan: "READ", getEvolutionHistory: "READ",
  registerNode: "EXECUTE", exchangeKnowledge: "WRITE", queryCivilization: "READ",
  submitConsensus: "EXECUTE", resolveConflict: "EXECUTE", queryReputation: "READ",
  registerContribution: "EXECUTE", queryContribution: "READ", traceKnowledge: "READ",
  queryInfluence: "READ", queryLineage: "READ",
  registerApplication: "EXECUTE", activateApplication: "EXECUTE", pauseApplication: "EXECUTE",
  queryApplication: "READ", listApplications: "READ", startApplicationSession: "EXECUTE",
  getLivingWorld: "READ", updateWorld: "WRITE", observeReality: "WRITE",
  recomputePredictions: "EXECUTE", recomputeRecommendations: "EXECUTE",
  queryEntityHistory: "READ", queryRelationshipHistory: "READ", queryLivingState: "READ",
  observeCompany: "WRITE", observeCompanyBatch: "WRITE",
  queryCompanyProfile: "READ", queryCompanySignals: "READ",
  queryCompanyChanges: "READ", queryCompanyHistory: "READ",
  observeSupply: "WRITE", observeSupplyBatch: "WRITE",
  querySupplyProfile: "READ", querySupplySignals: "READ",
  querySupplyChanges: "READ", querySupplyCapabilities: "READ",
  querySupplyHistory: "READ",
  observeActivity: "WRITE", queryActivities: "READ",
  queryActivityTimeline: "READ", queryActivityOutcome: "READ", queryActivityMetrics: "READ",
  queryPatterns: "READ", querySimilarPatterns: "READ",
  queryPatternEvidence: "READ", queryPatternHistory: "READ", recommendPatterns: "READ",
  queryCauseGraph: "READ", queryCauseChains: "READ",
  queryRootCauses: "READ", queryDownstreamEffects: "READ", recommendCauses: "READ",
  queryLivingWorldModel: "READ", queryWorldEntity: "READ", queryWorldHistory: "READ",
  queryHypotheses: "READ", queryFutureStateSpace: "READ", queryFutureBranches: "READ",
  updateRealityTime: "WRITE", queryAffectedDecisions: "READ", queryAffectedRecommendations: "READ",
  createGrowthDecisionReport: "EXECUTE", queryGrowthDecisionReport: "READ", listGrowthDecisionReports: "READ",
};

const CLASS_TO_PERMISSION: Record<MethodClass, PermissionLevel> = {
  READ: "read", WRITE: "write", EXECUTE: "execute", APPROVE: "approve",
};

const PERMISSION_RANK: Record<PermissionLevel, number> = {
  read: 0, write: 1, execute: 2, approve: 3, admin: 4,
};

export class SDKPermissionChecker {
  check(method: string, granted: PermissionLevel): { passed: boolean; required: PermissionLevel } {
    const mc = METHOD_CLASS[method];
    if (!mc) return { passed: false, required: "read" };
    const required = CLASS_TO_PERMISSION[mc];
    return { passed: PERMISSION_RANK[granted] >= PERMISSION_RANK[required], required };
  }

  getMethodPermissions(): Record<string, PermissionLevel> {
    const result: Record<string, PermissionLevel> = {};
    for (const [method, mc] of Object.entries(METHOD_CLASS)) {
      result[method] = CLASS_TO_PERMISSION[mc];
    }
    return result;
  }
}
