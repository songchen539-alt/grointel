// AWAKENING-2 — Reality Target Registry
import { RealityTarget, TargetType } from "./reality_engine_types";

export class RealityTargetRegistry {
  private targets: Map<string, RealityTarget> = new Map();
  private counter = 0;

  register(name: string, website: string, type: TargetType, industry: string, country: string, worldImportance = 50): RealityTarget {
    const id = "tgt_" + (++this.counter).toString(16).padStart(6, "0");
    const target: RealityTarget = {
      id, name, website, type, industry, country, priority: 50, attention_score: 50,
      last_observed_at: null, next_observation_at: new Date().toISOString(),
      crawl_frequency_seconds: 3600, connector_status: "active", failure_count: 0,
      knowledge_confidence: 30, world_importance: worldImportance,
      snapshot_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    this.targets.set(id, target);
    return target;
  }

  get(id: string): RealityTarget | null { return this.targets.get(id) || null; }
  getAll(): RealityTarget[] { return Array.from(this.targets.values()); }

  getNextTarget(): RealityTarget | null {
    const now = new Date().toISOString();
    return this.getAll()
      .filter(t => t.connector_status === "active" && t.next_observation_at && t.next_observation_at <= now)
      .sort((a, b) => (b.attention_score * b.world_importance) - (a.attention_score * a.world_importance))[0] || null;
  }

  recordObservation(target: RealityTarget, success: boolean): void {
    target.last_observed_at = new Date().toISOString();
    target.snapshot_count++;
    target.failure_count = success ? 0 : target.failure_count + 1;
    target.connector_status = target.failure_count > 5 ? "error" : "active";
    // Adaptive scheduling: faster if changing, slower if stable
    const baseFreq = target.crawl_frequency_seconds;
    target.crawl_frequency_seconds = success ? Math.max(300, Math.round(baseFreq * 1.1)) : Math.min(86400, Math.round(baseFreq * 0.5));
    target.next_observation_at = new Date(Date.now() + target.crawl_frequency_seconds * 1000).toISOString();
    target.updated_at = new Date().toISOString();
  }

  updateAttention(target: RealityTarget, newScore: number): void {
    target.attention_score = newScore;
    target.updated_at = new Date().toISOString();
  }

  count(): number { return this.targets.size; }
}
