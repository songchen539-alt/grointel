// GroIntel KNOWLEDGE-1 — Living World Model
import { LivingWorldEntity, LivingWorldRelationship, LivingWorldActivity, LivingWorldOutcome, LivingWorldCause, LivingWorldPattern, WorldModelHypothesis, FutureStateSpace, FutureBranch, LivingStatus } from "./world_model_types";
import { RealityTimeEngine } from "./reality_time_engine";
import { HypothesisEngine } from "./hypothesis_engine";
import { FutureStateSpaceManager } from "./future_state_space";
import { FutureBranchUpdater } from "./future_branch_updater";
import { WorldStatePropagator } from "./world_state_propagator";
import { DecisionReactivity } from "./decision_reactivity";
import { RecommendationReactivity } from "./recommendation_reactivity";
import { WorldModelTraceRecorder } from "./world_model_trace";

export class LivingWorldModel {
  public readonly time = new RealityTimeEngine();
  public readonly hypotheses = new HypothesisEngine();
  public readonly futureSpace = new FutureStateSpaceManager();
  public readonly futureUpdater = new FutureBranchUpdater();
  public readonly propagator = new WorldStatePropagator();
  public readonly decisions = new DecisionReactivity();
  public readonly recommendations = new RecommendationReactivity();
  public readonly traces = new WorldModelTraceRecorder();

  public entities: Map<string, LivingWorldEntity> = new Map();
  public relationships: Map<string, LivingWorldRelationship> = new Map();
  public activities: Map<string, LivingWorldActivity> = new Map();
  public outcomes: Map<string, LivingWorldOutcome> = new Map();
  public causes: Map<string, LivingWorldCause> = new Map();
  public patterns: Map<string, LivingWorldPattern> = new Map();

  private counters = { e:0, r:0, a:0, o:0, c:0, p:0 };

  private makeLiving(obj: { id: string; type?: string; name?: string; source_type?: string; target_type?: string; causal_type?: string; cluster?: string; category?: string; metric?: string; status?: LivingStatus; confidence?: number; evidence?: string[] }, now: string) {
    return { created_at: now, updated_at: now, last_reality_event_at: now, version: 1, history: [{ timestamp: now, change: "Created", confidence: obj.confidence || 50 }], status: (obj.status || "active") as LivingStatus, evidence: obj.evidence || [], confidence: obj.confidence || 50 };
  }

  addEntity(name: string, type: string, confidence = 50): LivingWorldEntity {
    const now = new Date().toISOString();
    const e: LivingWorldEntity = { id: "we_" + (++this.counters.e).toString(16).padStart(6, "0"), type, canonical_name: name, ...this.makeLiving({ name, type, confidence }, now) };
    this.entities.set(e.id, e); this.time.emit(this.time.EVENTS.WORLD_STATE_CHANGED, { type: "entity", id: e.id }); this.traces.record("entity_added", e.id, name); return e;
  }

  addRelationship(sourceId: string, targetId: string, relType: string, confidence = 50): LivingWorldRelationship {
    const now = new Date().toISOString();
    const r: LivingWorldRelationship = { id: "wr_" + (++this.counters.r).toString(16).padStart(6, "0"), source_id: sourceId, target_id: targetId, rel_type: relType, ...this.makeLiving({ source_type: sourceId, target_type: targetId, confidence }, now) };
    this.relationships.set(r.id, r); return r;
  }

  addActivity(category: string, name: string, ownerId: string, confidence = 50): LivingWorldActivity {
    const now = new Date().toISOString();
    const a: LivingWorldActivity = { id: "wa_" + (++this.counters.a).toString(16).padStart(6, "0"), category, name, owner_id: ownerId, ...this.makeLiving({ category, name, confidence }, now) };
    this.activities.set(a.id, a); return a;
  }

  addOutcome(activityId: string, metric: string, value: number, confidence = 50): LivingWorldOutcome {
    const now = new Date().toISOString();
    const o: LivingWorldOutcome = { id: "wo_" + (++this.counters.o).toString(16).padStart(6, "0"), activity_id: activityId, metric, value, ...this.makeLiving({ metric, confidence }, now) };
    this.outcomes.set(o.id, o); return o;
  }

  addCause(sourceType: string, targetType: string, causalType: string, strength: number, confidence = 50): LivingWorldCause {
    const now = new Date().toISOString();
    const c: LivingWorldCause = { id: "wc_" + (++this.counters.c).toString(16).padStart(6, "0"), source_type: sourceType, target_type: targetType, causal_type: causalType, strength, ...this.makeLiving({ source_type: sourceType, target_type: targetType, confidence }, now) };
    this.causes.set(c.id, c); return c;
  }

  addPattern(name: string, cluster: string, confidence = 50): LivingWorldPattern {
    const now = new Date().toISOString();
    const p: LivingWorldPattern = { id: "wp_" + (++this.counters.p).toString(16).padStart(6, "0"), name, cluster, ...this.makeLiving({ name, cluster, confidence }, now) };
    this.patterns.set(p.id, p); return p;
  }

  getEntity(id: string): LivingWorldEntity | null { return this.entities.get(id) || null; }
  getRelationship(id: string): LivingWorldRelationship | null { return this.relationships.get(id) || null; }
  getActivity(id: string): LivingWorldActivity | null { return this.activities.get(id) || null; }
  getOutcome(id: string): LivingWorldOutcome | null { return this.outcomes.get(id) || null; }
  getCause(id: string): LivingWorldCause | null { return this.causes.get(id) || null; }
  getPattern(id: string): LivingWorldPattern | null { return this.patterns.get(id) || null; }
  getAllEntities(): LivingWorldEntity[] { return Array.from(this.entities.values()); }
  getAllRelationships(): LivingWorldRelationship[] { return Array.from(this.relationships.values()); }
  getAllActivities(): LivingWorldActivity[] { return Array.from(this.activities.values()); }
}
