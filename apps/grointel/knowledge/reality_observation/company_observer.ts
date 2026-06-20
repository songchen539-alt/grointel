// GroIntel KNOWLEDGE-2 — Company Observer (multi-source observation)
import { Observation, ObservationBatch, ObservationSignal, ObservationEvidence, ObservationSignalType } from "./reality_observation_types";
import { ObservationSourceRegistry } from "./observation_source_registry";

export class CompanyObserver {
  private counter = 0;
  public readonly sources = new ObservationSourceRegistry();

  observe(companyMemoryId: string, companyWebsite: string): ObservationBatch {
    const observations: Observation[] = [];
    const enabledSources = this.sources.getEnabled();

    for (const src of enabledSources) {
      const rawData = this.sources.mockObserve(src.id, companyWebsite);
      const signals = this.extractSignals(src.type, rawData);
      const evidence: ObservationEvidence = {
        id: "ev_" + (++this.counter).toString(16).padStart(6, "0"),
        source: src.id, raw_data: rawData, normalized_data: this.normalizeRawData(src.type, rawData),
        confidence: src.trust_score, collected_at: new Date().toISOString(),
      };

      const obs: Observation = {
        id: "obs_" + (++this.counter).toString(16).padStart(6, "0"),
        company_memory_id: companyMemoryId, source: src.id, timestamp: new Date().toISOString(),
        signals, evidence: [evidence], confidence: src.trust_score, status: "collected",
      };
      observations.push(obs);
    }

    return {
      batch_id: "batch_" + (++this.counter).toString(16).padStart(6, "0"),
      company_memory_id: companyMemoryId, observations,
      collected_at: new Date().toISOString(),
      source_count: observations.length,
      signal_count: observations.reduce((s, o) => s + o.signals.length, 0),
    };
  }

  private extractSignals(sourceType: string, data: Record<string, unknown>): ObservationSignal[] {
    const signals: ObservationSignal[] = [];

    if (data.hiring !== undefined) signals.push(this.signal("hiring_increased", "Hiring Activity", data.hiring as number, 60, [`Hiring: ${data.hiring}`], sourceType));
    if (data.funding_round !== undefined) signals.push(this.signal("funding_raised", "Funding", data.funding_round as string, 80, [`Round: ${data.funding_round}`], sourceType));
    if (data.new_roles) signals.push(this.signal("job_listings", "Job Listings", (data.new_roles as string[]).length, 55, (data.new_roles as string[]).map(r => `Role: ${r}`), sourceType));
    if (data.pricing && data.changed) signals.push(this.signal("pricing_changed", "Pricing Change", `${data.previous}→${data.current}`, 70, [`Price: ${data.current}`], sourceType));
    if (data.launches || data.features) signals.push(this.signal("technology_adoption", "Product Updates", (data.launches as number) || 1, 65, [`Features: ${(data.features as string[])?.join(", ") || "new"}`], sourceType));
    if (data.followers) signals.push(this.signal("social_growth", "Social Growth", data.followers as number, 50, [`Followers: ${data.followers}`], sourceType));
    if (data.mentions) signals.push(this.signal("content_velocity", "Content Velocity", data.mentions as number, 55, [`Mentions: ${data.mentions}`], sourceType));
    if (data.total_openings !== undefined) signals.push(this.signal("hiring_increased", "Job Openings", data.total_openings as number, 60, [`Openings: ${data.total_openings}`], sourceType));

    return signals;
  }

  private signal(type: ObservationSignalType, label: string, value: string | number, confidence: number, evidence: string[], source: string): ObservationSignal {
    return { type, label, value, strength: Math.min(100, typeof value === "number" ? value : 50), confidence, evidence, source };
  }

  private normalizeRawData(sourceType: string, data: Record<string, unknown>): Record<string, unknown> {
    return { source_type: sourceType, normalized: true, signal_count: Object.keys(data).length, ...data };
  }
}
