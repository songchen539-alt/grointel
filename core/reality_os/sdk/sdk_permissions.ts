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
