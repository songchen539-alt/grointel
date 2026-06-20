// GroIntel ROS-4 — Knowledge Runtime (canonical source of truth)
import { KnowledgeEntity, KnowledgeFact, KnowledgeRelationship, KnowledgeHypothesis, KnowledgeInference, KnowledgeValidation, KnowledgeVersion, KnowledgeRecord, KnowledgeTrace } from "./knowledge_types";
import { KnowledgeRegistry } from "./knowledge_registry";
import { KnowledgeEntityManager } from "./knowledge_entity";
import { KnowledgeFactManager } from "./knowledge_fact";
import { KnowledgeRelationshipManager } from "./knowledge_relationship";
import { KnowledgeInferenceEngine } from "./knowledge_inference";
import { KnowledgeVersioning } from "./knowledge_versioning";
import { KnowledgeValidationEngine } from "./knowledge_validation";
import { KnowledgeTraceRecorder } from "./knowledge_trace";

export class KnowledgeRuntime {
  public readonly registry = new KnowledgeRegistry();
  public readonly entities = new KnowledgeEntityManager();
  public readonly facts = new KnowledgeFactManager();
  public readonly relationships = new KnowledgeRelationshipManager();
  public readonly inferences = new KnowledgeInferenceEngine();
  public readonly versioning = new KnowledgeVersioning();
  public readonly validation = new KnowledgeValidationEngine();
  public readonly traces = new KnowledgeTraceRecorder();

  registerEntity(type: string, canonicalName: string, domain: string, description: string, aliases: string[] = [], attrs: Record<string, unknown> = {}): KnowledgeEntity {
    const entity = this.entities.create(type, canonicalName, domain, description, aliases, attrs);
    this.registry.register(entity);
    this.traces.record("entity_created", entity.id, null, `Created ${type}: ${canonicalName}`);
    return entity;
  }

  createFact(subject: string, predicate: string, object: string, confidence = 50): KnowledgeFact {
    const fact = this.facts.create(subject, predicate, object, confidence);
    this.facts.addEvidence(fact, "initial_observation");
    this.versioning.record(fact, "Initial version", "knowledge_runtime");
    this.traces.record("fact_created", null, fact.id, `${subject} ${predicate} ${object}`);
    return fact;
  }

  updateFact(fact: KnowledgeFact, updates: Partial<KnowledgeFact>, reason: string, source: string): KnowledgeFact {
    const updated = this.facts.newVersion(fact, updates, reason, source);
    this.versioning.record(updated, reason, source);
    this.traces.record("fact_updated", null, updated.id, `${reason} (v${updated.version})`);
    return updated;
  }

  validateFact(fact: KnowledgeFact, realityScore: number, predictionScore: number, learningScore: number, humanApproved = false): KnowledgeFact {
    const val = this.validation.validate(fact, realityScore, predictionScore, learningScore, humanApproved);
    const updated = this.validation.setStatus(fact, val);
    this.versioning.record(updated, `Validated: score=${val.composite_score}`, "validation");
    this.traces.record("fact_validated", null, updated.id, `Status: ${updated.validation_status}, Score: ${val.composite_score}`);
    return updated;
  }

  promoteFact(fact: KnowledgeFact, toStatus: string, reason: string): KnowledgeFact {
    const updated = this.facts.promote(fact, toStatus as any, reason);
    this.versioning.record(updated, reason, "promotion");
    return updated;
  }

  deprecateFact(fact: KnowledgeFact, reason: string): KnowledgeFact {
    const updated = this.facts.deprecate(fact, reason);
    this.versioning.record(updated, reason, "deprecation");
    return updated;
  }

  contradictFact(fact: KnowledgeFact, reason: string): KnowledgeFact {
    const updated = this.facts.contradict(fact, reason);
    this.versioning.record(updated, reason, "contradiction");
    return updated;
  }

  createRelationship(sourceId: string, targetId: string, type: any, confidence = 70, evidence: string[] = []): KnowledgeRelationship {
    const rel = this.relationships.create(sourceId, targetId, type, confidence, evidence);
    this.traces.record("relationship_created", sourceId, null, `${type}: ${sourceId} -> ${targetId}`);
    return rel;
  }

  createHypothesis(statement: string, supporting: string[] = [], contradicting: string[] = []): KnowledgeHypothesis {
    const h = this.inferences.createHypothesis(statement, supporting, contradicting);
    this.traces.record("hypothesis_created", null, null, statement);
    return h;
  }

  infer(hypothesisId: string, derivedFrom: string[], reasoningPath: string[], conclusion: string, confidence: number): KnowledgeInference {
    const inf = this.inferences.infer(hypothesisId, derivedFrom, reasoningPath, conclusion, confidence);
    this.traces.record("inference_created", null, null, conclusion);
    return inf;
  }

  // Query methods
  findFacts(subject?: string, predicate?: string, object?: string): KnowledgeFact[] {
    return this.relationships.getAll().map(() => null).filter(() => false) as any; // stub — returns nothing
    // In a full implementation, facts would be stored in a DB. For now using the relationship manager to track.
  }

  findEntities(domain?: string, type?: string): KnowledgeEntity[] {
    const all = this.registry.getAll();
    if (domain) return all.filter(e => e.domain === domain);
    if (type) return all.filter(e => e.type === type);
    return all;
  }

  findEvidence(factId: string): string[] {
    // Evidence tracked via traces
    return this.traces.findByFact(factId).map(t => t.details);
  }

  findContradictions(): { fact1: KnowledgeFact; fact2: KnowledgeFact; reason: string }[] {
    const allRels = this.relationships.findByType("contradicts");
    return allRels.map(r => ({ fact1: { id: r.source_id } as KnowledgeFact, fact2: { id: r.target_id } as KnowledgeFact, reason: `Contradiction via relationship` }));
  }

  findHistoricalVersions(factId: string): KnowledgeVersion[] {
    return this.versioning.getHistory(factId);
  }

  findAll(): KnowledgeEntity[] { return this.registry.getAll(); }
  getRecord(entityId: string): KnowledgeRecord | null {
    const entity = this.registry.get(entityId);
    if (!entity) return null;
    return { entity, facts: [], relationships: this.relationships.findByEntity(entityId), inferences: this.inferences.getAllInferences(), hypotheses: this.inferences.getAllHypotheses() };
  }
}
