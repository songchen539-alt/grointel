// GroIntel DATA-1 — Company Source Registry
import { CompanySource, SourceType } from "./company_types";

export class CompanySourceRegistry {
  private sources: Map<string, CompanySource> = new Map();

  register(type: SourceType, url: string, trustScore = 50, freshness = 60, coverage = 30): CompanySource {
    const id = "csrc_" + (++CompanySourceRegistry.counter).toString(16).padStart(6, "0");
    const src: CompanySource = { source_id: id, type, url, trust_score: trustScore, freshness, coverage, rate_limit: 100, enabled: true };
    this.sources.set(id, src);
    return src;
  }

  get(id: string): CompanySource | null { return this.sources.get(id) || null; }
  getAll(): CompanySource[] { return Array.from(this.sources.values()); }
  getByType(type: SourceType): CompanySource[] { return this.getAll().filter(s => s.type === type); }
  count(): number { return this.sources.size; }
  setEnabled(id: string, enabled: boolean): void { const s = this.sources.get(id); if (s) s.enabled = enabled; }

  readonly DEFAULT_TRUST: Partial<Record<SourceType, number>> = {
    crunchbase: 80, linkedin: 75, github: 70, website: 65, news: 55, manual: 90,
    job_board: 50, product_hunt: 60, app_store: 55, play_store: 55, social: 40, api: 70, public_dataset: 60,
  };

  private static counter = 0;
}
