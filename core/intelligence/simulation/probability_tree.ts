// GroIntel INT-1 — Probability Tree
import { ProbabilityBranch, ProjectedOutcome } from "./simulation_types";

let ptCounter = 0;
function genId(): string { return "pb_" + (++ptCounter).toString(16).padStart(6, "0"); }

export class ProbabilityTreeBuilder {
  build(outcomes: ProjectedOutcome[], maxDepth = 3): ProbabilityBranch {
    const root: ProbabilityBranch = {
      id: genId(),
      parent_id: null,
      condition: "Simulation starts",
      probability: 100,
      confidence: 80,
      outcome: null,
      children: [],
      depth: 0,
      evidence: [],
    };

    for (const o of outcomes) {
      root.children.push(this.buildBranch(root.id, o, 1, maxDepth));
    }

    this.normalizeProbabilities(root);
    return root;
  }

  private buildBranch(parentId: string, outcome: ProjectedOutcome, depth: number, maxDepth: number): ProbabilityBranch {
    const branch: ProbabilityBranch = {
      id: genId(),
      parent_id: parentId,
      condition: `${outcome.case.replace(/_/g, " ")}: ${outcome.description.slice(0, 60)}`,
      probability: outcome.probability,
      confidence: outcome.confidence,
      outcome,
      children: [],
      depth,
      evidence: [],
    };

    if (depth < maxDepth) {
      // Add neutral child branches at next depth
      branch.children.push({
        id: genId(), parent_id: branch.id, condition: "Continues on path", probability: 60, confidence: 60,
        outcome: null, children: [], depth: depth + 1, evidence: [],
      });
      branch.children.push({
        id: genId(), parent_id: branch.id, condition: "Path changes", probability: 40, confidence: 40,
        outcome: null, children: [], depth: depth + 1, evidence: [],
      });
    }

    return branch;
  }

  private normalizeProbabilities(branch: ProbabilityBranch): void {
    const total = branch.children.reduce((s, c) => s + c.probability, 0);
    if (total > 0 && total !== 100) {
      for (const child of branch.children) {
        child.probability = Math.round((child.probability / total) * 100);
      }
    }
    for (const child of branch.children) {
      this.normalizeProbabilities(child);
    }
  }

  countBranches(tree: ProbabilityBranch): number {
    let count = 1;
    for (const child of tree.children) {
      count += this.countBranches(child);
    }
    return count;
  }

  maxDepthReached(tree: ProbabilityBranch): number {
    if (tree.children.length === 0) return tree.depth;
    return Math.max(...tree.children.map(c => this.maxDepthReached(c)));
  }
}
