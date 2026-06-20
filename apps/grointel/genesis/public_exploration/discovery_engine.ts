// GENESIS-2 — Discovery Engine
import { DiscoveryResult, PublicSource, PublicSourceType } from "./exploration_types";
import { SourceCatalog } from "./source_catalog";

export class DiscoveryEngine {
  private counter = 0;

  discover(entityName: string, entityType: string, catalog: SourceCatalog): DiscoveryResult {
    const candidateSources: PublicSource[] = [];

    for (const src of catalog.getEnabled()) {
      const url = this.guessUrl(entityName, src.type);
      candidateSources.push({ ...src, url });
    }

    return {
      id: "disc_" + (++this.counter).toString(16).padStart(6, "0"),
      entity_name: entityName, entity_type: entityType,
      candidate_sources: candidateSources,
      confidence: 60, discovered_at: new Date().toISOString(),
    };
  }

  private guessUrl(entityName: string, type: PublicSourceType): string {
    const domain = entityName.toLowerCase().replace(/[^a-zA-Z0-9.-]/g, "").replace(/^https?:\/\//, "").split("/")[0];
    const urls: Record<string, string> = {
      website: `https://${domain}`,
      blog: `https://${domain}/blog`,
      documentation: `https://${domain}/docs`,
      jobs: `https://${domain}/jobs`,
      changelog: `https://${domain}/changelog`,
      community: `https://community.${domain}`,
      github: `https://github.com/${domain}`,
      rss: `https://${domain}/feed`,
      atom: `https://${domain}/atom`,
      news: `https://news.google.com/search?q=${domain}`,
      social_profile: `https://twitter.com/${domain}`,
    };
    return urls[type] || `https://${domain}`;
  }
}
