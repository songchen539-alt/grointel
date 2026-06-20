// GroIntel PGIR-1 — Living World Model
import { LivingEntity, LivingRelationship, LivingPrediction, LivingRecommendation, WorldState } from "./perpetual_types";

export class LivingWorldModel {
  public entities: Map<string, LivingEntity> = new Map();
  public relationships: Map<string, LivingRelationship> = new Map();
  public predictions: Map<string, LivingPrediction> = new Map();
  public recommendations: Map<string, LivingRecommendation> = new Map();
  public state: WorldState = { entities: 0, relationships: 0, predictions: 0, recommendations: 0, events_processed: 0, event_counter: 0, last_event_at: null, started_at: new Date().toISOString(), cycle_count: 0 };

  addEntity(e: LivingEntity): void { this.entities.set(e.id, e); this.state.entities = this.entities.size; }
  getEntity(id: string): LivingEntity | null { return this.entities.get(id) || null; }
  getAllEntities(): LivingEntity[] { return Array.from(this.entities.values()); }

  addRelationship(r: LivingRelationship): void { this.relationships.set(r.id, r); this.state.relationships = this.relationships.size; }
  getRelationship(id: string): LivingRelationship | null { return this.relationships.get(id) || null; }
  getAllRelationships(): LivingRelationship[] { return Array.from(this.relationships.values()); }
  getRelationshipsFor(entityId: string): LivingRelationship[] { return this.getAllRelationships().filter(r => r.source_id === entityId || r.target_id === entityId); }

  addPrediction(p: LivingPrediction): void { this.predictions.set(p.id, p); this.state.predictions = this.predictions.size; }
  getPrediction(id: string): LivingPrediction | null { return this.predictions.get(id) || null; }
  getActivePredictions(): LivingPrediction[] { return this.getAllPredictions().filter(p => p.status === "active"); }
  getAllPredictions(): LivingPrediction[] { return Array.from(this.predictions.values()); }

  addRecommendation(r: LivingRecommendation): void { this.recommendations.set(r.id, r); this.state.recommendations = this.recommendations.size; }
  getRecommendation(id: string): LivingRecommendation | null { return this.recommendations.get(id) || null; }
  getAllRecommendations(): LivingRecommendation[] { return Array.from(this.recommendations.values()); }

  getState(): WorldState { return { ...this.state }; }
}
