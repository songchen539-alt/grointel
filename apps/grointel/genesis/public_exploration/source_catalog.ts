// GENESIS-2 — Source Catalog
import { PublicSource, PublicSourceType } from "./exploration_types";

export class SourceCatalog {
  private sources: PublicSource[] = [];

  constructor() { this.initDefaults(); }

  private initDefaults(): void {
    this.add("website", "website", "Official Website", 60, 50, 0, 24);
    this.add("rss", "rss", "RSS Feed", 70, 40, 0, 6);
    this.add("atom", "atom", "Atom Feed", 70, 40, 0, 6);
    this.add("news", "news", "Public News", 50, 30, 0, 12);
    this.add("github", "github", "Public GitHub", 75, 60, 0, 24);
    this.add("documentation", "documentation", "Public Documentation", 65, 50, 0, 48);
    this.add("blog", "blog", "Public Blog", 60, 40, 0, 24);
    this.add("jobs", "jobs", "Public Jobs", 55, 30, 0, 24);
    this.add("product_updates", "product_updates", "Product Changelog", 70, 45, 0, 12);
    this.add("community", "community", "Public Community", 50, 35, 0, 12);
    this.add("social_profile", "social_profile", "Public Social Profile", 40, 25, 0, 6);
    this.add("open_dataset", "open_dataset", "Open Dataset", 80, 70, 0, 168);
    this.add("government_data", "government_data", "Government Data", 85, 75, 0, 168);
    this.add("search_api", "search_api", "Public Search API", 60, 50, 1, 12);
    this.add("partner_feed", "partner_feed", "Partner Feed", 90, 80, 0, 6);
    this.add("changelog", "changelog", "Public Changelog", 65, 40, 0, 12);
  }

  private add(type: string, capability: string, name: string, reliability: number, freshness: number, cost: number, freq: number): void {
    this.sources.push({ id: `${type}_catalog`, type: type as PublicSourceType, url: "", name, capability, freshness, reliability, estimated_cost: cost, update_frequency_hours: freq, enabled: true });
  }

  getAll(): PublicSource[] { return this.sources; }
  getByType(type: PublicSourceType): PublicSource[] { return this.sources.filter(s => s.type === type); }
  getEnabled(): PublicSource[] { return this.sources.filter(s => s.enabled); }
}
