// GroIntel APP-1 — Capability Mapper
import { ApplicationCapability } from "./application_types";
import { ApplicationManifest } from "./application_types";

const CAPABILITY_MAP: Record<string, string> = {
  "reality.observe": "observe", "reality.attend": "attend",
  "cognition.cognize": "cognize", "cognition.graph.query": "queryKnowledge",
  "cognition.memory.read": "getKernelState",
  "intelligence.simulate": "simulate", "intelligence.plan": "plan",
  "intelligence.strategize": "strategize", "intelligence.discover": "discover",
  "intelligence.optimize": "optimize", "intelligence.decide": "decide",
  "wisdom.judge": "judge", "knowledge.query": "queryKnowledge",
  "knowledge.validate": "validateKnowledge", "workflow.start": "startWorkflow",
  "workflow.approve": "approveWorkflow", "workflow.reject": "rejectWorkflow",
  "state.world.read": "getWorldState", "state.kernel.read": "getKernelState",
  "graph.snapshot.read": "getGraphSnapshot",
  "evolution.observe": "observeSystem", "evolution.propose": "generateImprovementProposals",
  "civilization.register": "registerNode", "civilization.consensus": "submitConsensus",
  "contribution.trace": "traceKnowledge",
};

export class CapabilityMapper {
  map(manifest: ApplicationManifest): ApplicationCapability[] {
    return manifest.required_capabilities.map(capId => {
      const method = CAPABILITY_MAP[capId];
      return {
        capability_id: capId,
        mapped_method: method || "unmapped",
        permission_level: "execute",
        available: !!method,
      };
    });
  }

  getMissingCapabilities(manifest: ApplicationManifest): string[] {
    return manifest.required_capabilities.filter(capId => !CAPABILITY_MAP[capId]);
  }

  getAvailableCount(manifest: ApplicationManifest): number {
    return manifest.required_capabilities.filter(capId => !!CAPABILITY_MAP[capId]).length;
  }
}
