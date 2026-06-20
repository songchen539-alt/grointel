// GroIntel KNOWLEDGE-2 — Observation Source Registry (mock sources)
import { ObservationSource } from "./reality_observation_types";

export class ObservationSourceRegistry {
  private sources: Map<string, ObservationSource> = new Map();

  constructor() { this.registerDefaults(); }

  private registerDefaults(): void {
    const names = ["website", "linkedin", "jobs", "github", "news", "social", "funding", "traffic", "reviews", "pricing", "product", "documentation", "ads", "community", "creator"];
    for (const name of names) {
      this.register(name, name, 60, true, {});
    }
  }

  register(id: string, type: string, trustScore: number, enabled: boolean, config: Record<string, unknown>): ObservationSource {
    const src: ObservationSource = { id, name: id, type, enabled, trust_score: trustScore, last_used: null, config };
    this.sources.set(id, src); return src;
  }

  get(id: string): ObservationSource | null { return this.sources.get(id) || null; }
  getAll(): ObservationSource[] { return Array.from(this.sources.values()); }
  getEnabled(): ObservationSource[] { return this.getAll().filter(s => s.enabled); }
  count(): number { return this.sources.size; }

  // Mock observation — no real network
  mockObserve(sourceId: string, companyWebsite: string): Record<string, unknown> {
    const src = this.sources.get(sourceId);
    if (!src) return { error: "source not found" };

    // Generate realistic mock data per source type
    const mocks: Record<string, Record<string, unknown>> = {
      linkedin: { hiring: Math.floor(Math.random() * 50), headcount_growth: "+15%", new_roles: ["engineer", "marketing"] },
      jobs: { total_openings: Math.floor(Math.random() * 30), senior_roles: Math.floor(Math.random() * 10), remote: true },
      github: { repos: Math.floor(Math.random() * 20), stars_growth: Math.floor(Math.random() * 500), contributors: Math.floor(Math.random() * 10) },
      news: { mentions: Math.floor(Math.random() * 20), sentiment: Math.random() > 0.5 ? "positive" : "neutral", trend: "growth" },
      funding: { round: Math.random() > 0.7 ? "Series A" : "None", amount: Math.floor(Math.random() * 10) + "M", investors: ["Accel", "YC"] },
      traffic: { visitors: Math.floor(Math.random() * 100000), growth: "+" + Math.floor(Math.random() * 30) + "%", top_source: "organic" },
      pricing: { model: Math.random() > 0.5 ? "usage-based" : "flat", changed: Math.random() > 0.7, previous: "$100", current: "$150" },
      product: { launches: Math.floor(Math.random() * 3), features: ["AI feature", "API v2"], category: "saas" },
      social: { followers: Math.floor(Math.random() * 50000), growth: "+" + Math.floor(Math.random() * 10) + "%", platform: "twitter" },
      reviews: { rating: (3 + Math.random() * 2).toFixed(1), count: Math.floor(Math.random() * 500), trend: "stable" },
      community: { members: Math.floor(Math.random() * 5000), posts: Math.floor(Math.random() * 200), activity: "growing" },
      creator: { creators_active: Math.floor(Math.random() * 20), total_reach: Math.floor(Math.random() * 1000000) },
      ads: { active_campaigns: Math.floor(Math.random() * 5), spend: "$" + Math.floor(Math.random() * 50) + "k", channels: ["google", "linkedin"] },
      documentation: { pages: Math.floor(Math.random() * 100), changelog_entries: Math.floor(Math.random() * 10) },
      website: { pages: Math.floor(Math.random() * 50), blog_posts: Math.floor(Math.random() * 20), seo_score: Math.floor(Math.random() * 40 + 60) },
    };
    return mocks[src.type] || { observed: true, source_type: src.type, data: "mock" };
  }
}
