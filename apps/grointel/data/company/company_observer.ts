// GroIntel DATA-1 — Company Observer (with PGIR integration)
import { CompanyProfile, CompanyObservation, CompanySignal, CompanyChange, CompanyFundingEvent, CompanyHiringEvent, CompanyProductEvent, CompanyGrowthEvent, SourceType } from "./company_types";
import { CompanySourceRegistry } from "./company_source_registry";
import { CompanySignalExtractor } from "./company_signal_extractor";
import { CompanyEntityResolver } from "./company_entity_resolver";
import { CompanyChangeDetector } from "./company_change_detector";
import { CompanyFundingObserver } from "./company_funding_observer";
import { CompanyHiringObserver } from "./company_hiring_observer";
import { CompanyProductObserver } from "./company_product_observer";
import { CompanyGrowthObserver } from "./company_growth_observer";
import { CompanyTraceRecorder } from "./company_trace";
import { PerpetualRuntime } from "../../perpetual/perpetual_runtime";

export class CompanyObserver {
  public readonly sources = new CompanySourceRegistry();
  public readonly signalExtractor = new CompanySignalExtractor();
  public readonly resolver = new CompanyEntityResolver();
  public readonly changeDetector = new CompanyChangeDetector();
  public readonly funding = new CompanyFundingObserver();
  public readonly hiring = new CompanyHiringObserver();
  public readonly product = new CompanyProductObserver();
  public readonly growth = new CompanyGrowthObserver();
  public readonly traces = new CompanyTraceRecorder();
  public perpetual: PerpetualRuntime | null = null;

  private profiles: Map<string, CompanyProfile> = new Map();
  private obsCounter = 0;

  setPerpetual(pr: PerpetualRuntime): void { this.perpetual = pr; }

  observeCompany(companyId: string, name: string, domain: string, industry: string, country: string, rawData: Record<string, unknown> = {}, confidence = 50): { profile: CompanyProfile; signals: CompanySignal[]; changes: CompanyChange[] } {
    const now = new Date().toISOString();

    // Resolve duplicates
    let profile = this.resolver.resolve(this.getAllProfiles(), { name, domain, confidence });
    let changes: CompanyChange[] = [];

    if (profile) {
      changes = this.changeDetector.detect(profile, { employees_estimate: rawData.employees_estimate as number || undefined, technologies: rawData.technologies as string[] || undefined, products: rawData.products as string[] || undefined, confidence });
      profile = this.resolver.merge(profile, { confidence, employees_estimate: rawData.employees_estimate as number || undefined, technologies: rawData.technologies as string[] || undefined, products: rawData.products as string[] || undefined });
    } else {
      profile = {
        id: companyId, name, domain, website: `https://${domain}`, industry, country, region: "",
        description: (rawData.description as string) || "", founders: (rawData.founders as string[]) || [],
        employees_estimate: (rawData.employees_estimate as number) || 0, funding_stage: (rawData.funding_stage as string) || "unknown",
        total_funding: (rawData.total_funding as number) || 0, growth_channels: (rawData.growth_channels as string[]) || [],
        products: (rawData.products as string[]) || [], technologies: (rawData.technologies as string[]) || [],
        social_links: (rawData.social_links as string[]) || [],
        confidence, last_observed_at: now, last_verified_at: now,
        source_count: 1, evidence_count: 1, version: 1, history: [{ timestamp: now, change: "Created", confidence }],
      };
      this.profiles.set(profile.id, profile);
    }

    // Create observation
    const obsId = "cobs_" + (++this.obsCounter).toString(16).padStart(6, "0");
    const obs: CompanyObservation = {
      id: obsId,
      company_id: profile.id, source: rawData.source as string || "unknown",
      raw_data: rawData, normalized_data: { name, domain, industry, country },
      confidence, timestamp: now, evidence: [obsId], detected_changes: changes.map(c => c.type),
    };

    // Extract signals
    const signals = this.signalExtractor.extract(obs);

    // Feed PGIR
    if (this.perpetual) {
      this.perpetual.observeEntity(name, "company", { domain, industry, country, company_type: "observed" }, confidence);
      this.perpetual.stream.push("company_observation", profile.id, rawData, confidence);
    }

    this.traces.record("company_observed", profile.id, `Observed ${name} (${domain})`);
    return { profile, signals, changes };
  }

  observeByDomain(domain: string, industry = "unknown", country = "unknown", confidence = 40): { profile: CompanyProfile; signals: CompanySignal[]; changes: CompanyChange[] } {
    return this.observeCompany("cp_" + domain.replace(/[^a-zA-Z0-9]/g, "_"), domain.split(".")[0], domain, industry, country, {}, confidence);
  }

  observeBatch(companies: { id: string; name: string; domain: string; industry: string; country: string; confidence: number }[]): number {
    let count = 0;
    for (const c of companies) {
      this.observeCompany(c.id, c.name, c.domain, c.industry, c.country, {}, c.confidence);
      count++;
    }
    return count;
  }

  getProfile(id: string): CompanyProfile | null { return this.profiles.get(id) || null; }
  getAllProfiles(): CompanyProfile[] { return Array.from(this.profiles.values()); }
}
