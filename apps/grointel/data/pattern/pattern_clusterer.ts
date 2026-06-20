// GroIntel DATA-4 — Pattern Clusterer
import { PatternCluster } from "./pattern_types";

export class PatternClusterer {
  private counter = 0;
  private clusters: PatternCluster[] = [];

  constructor() { this.initDefaultClusters(); }

  private initDefaultClusters(): void {
    this.clusters = [
      this.make("Developer Growth", "PLG growth through developer communities and APIs", ["developer","tech"], ["US","EU"]),
      this.make("PLG Expansion", "Product-led growth self-serve upgrades", ["tech","saas"], ["US","EU","APAC"]),
      this.make("Creator-led Growth", "Growth driven by creator partnerships and affiliates", ["ecommerce","consumer"], ["US","EU"]),
      this.make("Community Flywheel", "Community-driven acquisition and retention", ["all"], ["all"]),
      this.make("SEO Content Engine", "Organic traffic growth through systematic content", ["all"], ["all"]),
      this.make("Localization Success", "International growth through localized offerings", ["all"], ["all"]),
      this.make("Enterprise Expansion", "Growing enterprise segment through sales motion", ["b2b","saas"], ["all"]),
      this.make("Referral Loop", "Word-of-mouth and referral-driven growth", ["consumer","marketplace"], ["US","EU"]),
      this.make("Retention Flywheel", "Retention-focused growth and expansion revenue", ["saas","b2b"], ["all"]),
      this.make("Brand Authority", "Brand-building through thought leadership and PR", ["all"], ["US","global"]),
    ];
  }

  private make(name: string, description: string, industryFit: string[], regionFit: string[]): PatternCluster {
    return { id:"pc_"+(++this.counter).toString(16).padStart(6,"0"), name, description, pattern_ids: [], industry_fit: industryFit, region_fit: regionFit, created_at: new Date().toISOString() };
  }

  getAll(): PatternCluster[] { return this.clusters; }
}
