// GroIntel PGIR-1 — Perpetual Runtime (never finishes)
import { PerpetualEvent, WorldState, LivingEntity, LivingRelationship } from "./perpetual_types";
import { LivingWorldModel } from "./living_world_model";
import { EntityUpdater } from "./entity_updater";
import { RelationshipUpdater } from "./relationship_updater";
import { PredictionUpdater } from "./prediction_updater";
import { RecommendationUpdater } from "./recommendation_updater";
import { GraphPropagation } from "./graph_propagation";
import { PerpetualLearning } from "./perpetual_learning";
import { PerpetualScheduler } from "./perpetual_scheduler";
import { PerpetualStream } from "./perpetual_stream";
import { PerpetualTraceRecorder } from "./perpetual_trace";

export class PerpetualRuntime {
  public readonly stream = new PerpetualStream();
  public readonly model = new LivingWorldModel();
  public readonly entityUpdater = new EntityUpdater();
  public readonly relUpdater = new RelationshipUpdater();
  public readonly predUpdater = new PredictionUpdater();
  public readonly recUpdater = new RecommendationUpdater();
  public readonly propagation = new GraphPropagation();
  public readonly learning = new PerpetualLearning();
  public readonly scheduler = new PerpetualScheduler();
  public readonly traces = new PerpetualTraceRecorder();

  constructor() { this.initialize(); }

  private initialize(): void {
    this.stream.onEvent((ev) => this.onRealityEvent(ev));
    this.traces.record("initialized", null, "Perpetual Runtime initialized");
  }

  private onRealityEvent(event: PerpetualEvent): void {
    this.scheduler.resumeOnEvent();
    this.model.state.last_event_at = event.observed_at;
    this.model.state.event_counter++;

    if (event.type === "entity_observation") {
      const name = event.data.canonical_name as string || `Entity_${event.entity_id}`;
      const entity = this.entityUpdater.updateOrCreate(this.model, name, (event.data.type as any) || "company", event.data, event.confidence);
      this.traces.record("entity_updated", entity.id, `${entity.canonical_name} (v${entity.version})`);

      // Propagate graph
      this.propagation.propagateEntityUpdate(this.model, entity.id, this.entityUpdater, this.relUpdater, this.predUpdater, this.recUpdater);

      // Learn
      this.learning.learnFromObservation(this.model, entity.id, event.confidence, this.entityUpdater);
    }

    if (event.type === "relationship_observation") {
      const rel = this.relUpdater.updateOrCreate(this.model, event.data.source_id as string, event.data.target_id as string, (event.data.rel_type as any) || "works_with", event.confidence, [event.id]);
      this.traces.record("relationship_updated", rel.id, `${rel.type}: ${rel.source_id} -> ${rel.target_id}`);
    }

    if (event.type === "prediction_update") {
      const entityId = event.entity_id || "";
      this.predUpdater.recalculate(this.model, entityId, event.confidence, (event.data.probability as number) || 50);
      this.traces.record("prediction_updated", entityId, "Recalculated");
    }

    this.model.state.events_processed++;
    this.model.state.cycle_count++;
  }

  // Public API
  observeEntity(canonicalName: string, type: any, attributes: Record<string, unknown>, confidence = 60): LivingEntity {
    const entity = this.entityUpdater.updateOrCreate(this.model, canonicalName, type, attributes, confidence);
    this.stream.push("entity_observation", entity.id, { canonical_name: canonicalName, type, ...attributes }, confidence);
    return entity;
  }

  observeRelationship(sourceId: string, targetId: string, relType: any, confidence = 60, evidence: string[] = []): LivingRelationship {
    const rel = this.relUpdater.updateOrCreate(this.model, sourceId, targetId, relType, confidence, evidence);
    this.stream.push("relationship_observation", null, { source_id: sourceId, target_id: targetId, rel_type: relType }, confidence);
    return rel;
  }

  createPrediction(entityId: string, statement: string, probability: number, confidence: number, assumptions: string[] = []) {
    return this.predUpdater.create(this.model, entityId, statement, probability, confidence, assumptions);
  }

  createRecommendation(targetEntity: string, recommendation: string, rank: number, evidence: string[], confidence: number) {
    return this.recUpdater.create(this.model, targetEntity, recommendation, rank, evidence, confidence);
  }

  getState(): WorldState { return this.model.getState(); }
  isIdle(): boolean { return this.scheduler.isIdle; }
  getIdle(): void { this.scheduler.idleEfficiently(); }
  wake(): void { this.scheduler.resumeOnEvent(); }
}
