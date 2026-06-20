// GroIntel DATA-2 — Supply Observer (with PGIR integration)
import { GrowthSupplyProfile, GrowthSupplyObservation, SupplySignal, SupplyChange, SupplyEntityType } from "./supply_types";
import { SupplySourceRegistry } from "./supply_source_registry";
import { SupplySignalExtractor } from "./supply_signal_extractor";
import { SupplyEntityResolver } from "./supply_entity_resolver";
import { SupplyChangeDetector } from "./supply_change_detector";
import { CreatorObserver } from "./creator_observer";
import { AgencyObserver } from "./agency_observer";
import { SoftwareObserver } from "./software_observer";
import { CommunityObserver } from "./community_observer";
import { SupplyCapabilityObserver } from "./supply_capability_observer";
import { SupplyTraceRecorder } from "./supply_trace";

export class SupplyObserver {
  public readonly sources = new SupplySourceRegistry();
  public readonly signalExtractor = new SupplySignalExtractor();
  public readonly resolver = new SupplyEntityResolver();
  public readonly changeDetector = new SupplyChangeDetector();
  public readonly creators = new CreatorObserver();
  public readonly agencies = new AgencyObserver();
  public readonly software = new SoftwareObserver();
  public readonly communities = new CommunityObserver();
  public readonly capabilities = new SupplyCapabilityObserver();
  public readonly traces = new SupplyTraceRecorder();

  private profiles: Map<string, GrowthSupplyProfile> = new Map();
  private obsCounter = 0;

  observeSupply(id: string, name: string, entityType: SupplyEntityType, website: string, country: string, rawData: Record<string, unknown> = {}, confidence = 50): { profile: GrowthSupplyProfile; signals: SupplySignal[]; changes: SupplyChange[] } {
    const now = new Date().toISOString();
    let profile = this.resolver.resolve(this.getAllProfiles(), { name, website, confidence });
    let changes: SupplyChange[] = [];

    if (profile) {
      changes = this.changeDetector.detect(profile, { capabilities: rawData.capabilities as string[] || undefined, audiences: rawData.audiences as string[] || undefined, confidence });
      profile = this.resolver.merge(profile, { confidence, capabilities: rawData.capabilities as string[] || undefined, audiences: rawData.audiences as string[] || undefined, industries_served: rawData.industries_served as string[] || undefined });
    } else {
      profile = {
        id, name, entity_type: entityType, website, social_links: (rawData.social_links as string[]) || [],
        platforms: (rawData.platforms as string[]) || [], country, region: (rawData.region as string) || "",
        languages: (rawData.languages as string[]) || [], industries_served: (rawData.industries_served as string[]) || [],
        audiences: (rawData.audiences as string[]) || [], capabilities: (rawData.capabilities as string[]) || [],
        case_studies: (rawData.case_studies as string[]) || [], proof_points: (rawData.proof_points as string[]) || [],
        pricing_signals: (rawData.pricing_signals as string[]) || [], trust_signals: (rawData.trust_signals as string[]) || [],
        reach_metrics: (rawData.reach_metrics as Record<string, number>) || {}, engagement_metrics: (rawData.engagement_metrics as Record<string, number>) || {},
        conversion_evidence: (rawData.conversion_evidence as string[]) || [],
        confidence, last_observed_at: now, last_verified_at: now, source_count: 1, evidence_count: 1, version: 1,
        history: [{ timestamp: now, change: "Created", confidence }],
      };
      this.profiles.set(profile.id, profile);
    }

    const obsId = "sobs_" + (++this.obsCounter).toString(16).padStart(6, "0");
    const obs: GrowthSupplyObservation = { id: obsId, supply_id: profile.id, source: rawData.source as string || "unknown", raw_data: rawData, normalized_data: { name, entity_type: entityType, website, country }, confidence, timestamp: now, evidence: [obsId], detected_changes: changes.map(c => c.type) };
    const signals = this.signalExtractor.extract(obs);
    this.traces.record("supply_observed", profile.id, `Observed ${name} (${entityType})`);
    return { profile, signals, changes };
  }

  observeBatch(entities: { id: string; name: string; entityType: SupplyEntityType; website: string; country: string; confidence: number }[]): number {
    let c = 0;
    for (const e of entities) { this.observeSupply(e.id, e.name, e.entityType, e.website, e.country, {}, e.confidence); c++; }
    return c;
  }

  getProfile(id: string): GrowthSupplyProfile | null { return this.profiles.get(id) || null; }
  getAllProfiles(): GrowthSupplyProfile[] { return Array.from(this.profiles.values()); }
}
