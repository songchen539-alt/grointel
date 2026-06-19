// GroIntel Reality World — Reality Router
import { WorldEvent, DomainName } from "../reality_stream/world_types";

export class RealityRouter {
  private routes: Map<string, DomainName[]> = new Map();

  constructor() {
    this.registerDefaultRoutes();
  }

  private registerDefaultRoutes(): void {
    this.route("funding", "Investment", "Finance", "Business");
    this.route("hiring", "Employment", "Business", "Technology");
    this.route("layoff", "Employment", "Business");
    this.route("product_launch", "Technology", "Business", "Market");
    this.route("regulation", "Government", "Policy", "Business");
    this.route("ai_release", "AI", "Technology", "Science");
    this.route("research", "Research", "Science", "Technology");
    this.route("market_trend", "Market", "Business", "Finance");
    this.route("community_growth", "Community", "Creator", "Media");
    this.route("creator_content", "Creator", "Media", "Community");
    this.route("climate", "Climate", "Energy", "Government");
    this.route("healthcare", "Healthcare", "Science", "Technology");
    this.route("education", "Education", "Technology", "Research");
    this.route("manufacturing", "Manufacturing", "SupplyChain", "Technology");
    this.route("energy", "Energy", "Climate", "Technology");
    this.route("opensource", "OpenSource", "Technology", "Community");
    this.route("military", "Military", "Government", "Technology");
    this.route("agriculture", "Agriculture", "Climate", "Science");
    this.route("transportation", "Transportation", "Energy", "Technology");
  }

  route(eventType: string, ...domains: DomainName[]): void {
    this.routes.set(eventType, domains);
  }

  getRoute(eventType: string): DomainName[] {
    const exact = this.routes.get(eventType);
    if (exact) return exact;
    // Default: route to General
    return ["General"];
  }

  routeEvent(event: WorldEvent): DomainName[] {
    const base = this.getRoute(event.event_type);
    // Merge with any extra domains from the event itself
    const all = new Set([...base, ...event.domains]);
    return Array.from(all);
  }
}
