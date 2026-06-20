// GroIntel ROS-4 — Knowledge Fact Manager (versioned, never overwrites)
import { KnowledgeFact, KnowledgeStatus } from "./knowledge_types";

let fCounter = 0;
function genId(): string { return "kf_" + (++fCounter).toString(16).padStart(6, "0"); }

export class KnowledgeFactManager {
  create(subject: string, predicate: string, object: string, confidence = 50): KnowledgeFact {
    return {
      id: genId(), subject, predicate, object, confidence,
      supporting_evidence: [], supporting_observations: [], supporting_predictions: [],
      validation_status: "candidate", version: 1,
      source_history: [{ source: "initial", timestamp: new Date().toISOString(), reason: "Created" }],
    };
  }

  addEvidence(fact: KnowledgeFact, evidence: string): void {
    fact.supporting_evidence = [...fact.supporting_evidence, evidence];
  }

  addObservation(fact: KnowledgeFact, obs: string): void {
    fact.supporting_observations = [...fact.supporting_observations, obs];
  }

  addPrediction(fact: KnowledgeFact, pred: string): void {
    fact.supporting_predictions = [...fact.supporting_predictions, pred];
  }

  // Creates a new version — never overwrites
  newVersion(fact: KnowledgeFact, updates: Partial<KnowledgeFact>, reason: string, source: string): KnowledgeFact {
    const newFact: KnowledgeFact = {
      ...fact, ...updates,
      id: fact.id, // same id — this is an update
      version: fact.version + 1,
      source_history: [...fact.source_history, { source, timestamp: new Date().toISOString(), reason }],
    };
    return newFact;
  }

  promote(fact: KnowledgeFact, to: KnowledgeStatus, reason: string): KnowledgeFact {
    return this.newVersion(fact, { validation_status: to, confidence: Math.min(fact.confidence + 15, 100) }, reason, "validation");
  }

  deprecate(fact: KnowledgeFact, reason: string): KnowledgeFact {
    return this.newVersion(fact, { validation_status: "deprecated", confidence: Math.max(fact.confidence - 30, 0) }, reason, "deprecation");
  }

  contradict(fact: KnowledgeFact, reason: string): KnowledgeFact {
    return this.newVersion(fact, { validation_status: "contradicted", confidence: Math.max(fact.confidence - 40, 0) }, reason, "contradiction");
  }
}
