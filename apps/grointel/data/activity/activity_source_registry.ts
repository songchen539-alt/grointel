// GroIntel DATA-3 — Activity Source Registry
import { ActivityCategory } from "./activity_types";

export class ActivitySourceRegistry {
  private sources: Map<string, { name: string; trust: number }> = new Map();
  register(name: string, trust: number): void { this.sources.set(name, { name, trust }); }
  get(name: string): { name: string; trust: number } | null { return this.sources.get(name) || null; }
  getAll(): { name: string; trust: number }[] { return Array.from(this.sources.values()); }
  count(): number { return this.sources.size; }
  getAllCategories(): ActivityCategory[] {
    return ["SEO","SEM","Paid Ads","Social Media","Creator Marketing","Influencer Campaign","Affiliate","PR","Podcast","Newsletter","Community","Referral","Events","Partnership","Sales Outreach","Product Launch","Market Entry","Localization","Hiring","AI Automation","Developer Relations","Customer Success","Retention","Pricing","Brand Campaign","Content Marketing"];
  }
}
