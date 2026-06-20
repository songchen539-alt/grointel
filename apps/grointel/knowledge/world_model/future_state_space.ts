// GroIntel KNOWLEDGE-1 — Future State Space
import { FutureBranch, FutureStateSpace } from "./world_model_types";

export class FutureStateSpaceManager {
  private counter = 0;
  private spaces: Map<string, FutureStateSpace> = new Map();

  createSpace(name: string): FutureStateSpace {
    const space: FutureStateSpace = { id:"fss_"+(++this.counter).toString(16).padStart(6,"0"), name, branches: [], consolidated_probability: 50, confidence: 50, updated_at: new Date().toISOString() };
    this.spaces.set(space.id, space); return space;
  }

  createBranch(spaceId: string, name: string, assumptions: string[], probability: number, confidence: number, triggerConditions: string[], hypotheses: string[]): FutureBranch | null {
    const space = this.spaces.get(spaceId); if (!space) return null;
    const branch: FutureBranch = { id:"fb_"+(++this.counter).toString(16).padStart(6,"0"), name, assumptions, probability, confidence, trigger_conditions: triggerConditions, supporting_hypotheses: hypotheses, contradicting_evidence: [], expected_outcomes: [], risk_level: probability<30?"high":probability<60?"medium":"low", opportunity_level: probability>70?"high":probability>40?"medium":"low", created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    space.branches.push(branch); this.consolidate(space); return branch;
  }

  updateProbability(spaceId: string, branchId: string, newProbability: number): FutureBranch | null {
    const space = this.spaces.get(spaceId); if (!space) return null;
    const branch = space.branches.find(b => b.id === branchId); if (!branch) return null;
    branch.probability = newProbability; branch.updated_at = new Date().toISOString();
    branch.risk_level = newProbability<30?"high":newProbability<60?"medium":"low";
    branch.opportunity_level = newProbability>70?"high":newProbability>40?"medium":"low";
    this.consolidate(space); return branch;
  }

  invalidateBranch(spaceId: string, branchId: string): void {
    const space = this.spaces.get(spaceId); if (!space) return;
    space.branches = space.branches.filter(b => b.id !== branchId); this.consolidate(space);
  }

  mergeBranches(spaceId: string, keepId: string, removeId: string): FutureBranch | null {
    const space = this.spaces.get(spaceId); if (!space) return null;
    const keep = space.branches.find(b => b.id === keepId); const remove = space.branches.find(b => b.id === removeId);
    if (!keep || !remove) return null;
    keep.assumptions = [...new Set([...keep.assumptions, ...remove.assumptions])];
    keep.probability = Math.round((keep.probability + remove.probability) / 2);
    keep.confidence = Math.round((keep.confidence + remove.confidence) / 2);
    keep.supporting_hypotheses = [...new Set([...keep.supporting_hypotheses, ...remove.supporting_hypotheses])];
    keep.updated_at = new Date().toISOString();
    space.branches = space.branches.filter(b => b.id !== removeId);
    this.consolidate(space); return keep;
  }

  private consolidate(space: FutureStateSpace): void {
    if (space.branches.length === 0) { space.consolidated_probability = 50; space.confidence = 0; }
    else {
      space.consolidated_probability = Math.round(space.branches.reduce((s, b) => s + b.probability, 0) / space.branches.length);
      space.confidence = Math.round(space.branches.reduce((s, b) => s + b.confidence, 0) / space.branches.length);
    }
    space.updated_at = new Date().toISOString();
  }

  getSpace(id: string): FutureStateSpace | null { return this.spaces.get(id) || null; }
  getAll(): FutureStateSpace[] { return Array.from(this.spaces.values()); }
}
