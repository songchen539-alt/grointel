// GroIntel ROS-4 — Knowledge Inference Engine
import { KnowledgeInference, KnowledgeHypothesis } from "./knowledge_types";

let iCounter = 0;
function genId(): string { return "ki_" + (++iCounter).toString(16).padStart(6, "0"); }
let hCounter = 0;
function genHId(): string { return "kh_" + (++hCounter).toString(16).padStart(6, "0"); }

export class KnowledgeInferenceEngine {
  private inferences: Map<string, KnowledgeInference> = new Map();
  private hypotheses: Map<string, KnowledgeHypothesis> = new Map();

  createHypothesis(statement: string, supporting: string[] = [], contradicting: string[] = []): KnowledgeHypothesis {
    const h: KnowledgeHypothesis = { id: genHId(), statement, confidence: 30, supporting_facts: supporting, contradicting_facts: contradicting, status: "candidate", created_at: new Date().toISOString() };
    this.hypotheses.set(h.id, h);
    return h;
  }

  infer(hypothesisId: string, derivedFrom: string[], reasoningPath: string[], conclusion: string, confidence: number): KnowledgeInference {
    const inf: KnowledgeInference = { id: genId(), hypothesis_statement: hypothesisId, derived_from: derivedFrom, conclusion, confidence, reasoning_path: reasoningPath, created_at: new Date().toISOString() };
    this.inferences.set(inf.id, inf);
    return inf;
  }

  getInference(id: string): KnowledgeInference | null { return this.inferences.get(id) || null; }
  getHypothesis(id: string): KnowledgeHypothesis | null { return this.hypotheses.get(id) || null; }
  getAllInferences(): KnowledgeInference[] { return Array.from(this.inferences.values()); }
  getAllHypotheses(): KnowledgeHypothesis[] { return Array.from(this.hypotheses.values()); }
}
