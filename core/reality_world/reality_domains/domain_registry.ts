// GroIntel Reality World — Domain Definitions
import { DomainName, DomainState } from "../reality_stream/world_types";

export const ALL_DOMAINS: DomainName[] = [
  "Technology", "AI", "Science", "Business", "Market", "Finance",
  "Government", "Policy", "Education", "Manufacturing", "Healthcare",
  "Transportation", "Energy", "Climate", "Media", "Community",
  "Creator", "OpenSource", "Investment", "Employment", "SupplyChain",
  "Military", "Agriculture", "Research", "General",
];

export class DomainRegistry {
  private domains: Map<DomainName, DomainState> = new Map();

  constructor() {
    for (const d of ALL_DOMAINS) {
      this.domains.set(d, this.createDefaultState(d));
    }
  }

  private createDefaultState(domain: DomainName): DomainState {
    return {
      domain,
      current_status: "active",
      trend: 0,
      velocity: 0,
      risk_level: 30,
      opportunity_level: 50,
      confidence: 50,
      reality_fidelity: 30,
      knowledge_density: 0,
      prediction_accuracy: 0,
      learning_velocity: 0,
      event_count: 0,
      last_event_at: null,
    };
  }

  getDomain(name: DomainName): DomainState | null {
    return this.domains.get(name) || null;
  }

  getAllDomains(): DomainState[] {
    return Array.from(this.domains.values());
  }

  updateDomain(name: DomainName, updates: Partial<DomainState>): void {
    const existing = this.domains.get(name);
    if (existing) {
      Object.assign(existing, updates);
      existing.event_count++;
      existing.last_event_at = new Date().toISOString();
    }
  }

  registerDomain(name: string): void {
    if (!this.domains.has(name as DomainName)) {
      this.domains.set(name as DomainName, this.createDefaultState(name as DomainName));
    }
  }

  isRegistered(name: string): boolean {
    return this.domains.has(name as DomainName);
  }

  getActiveDomains(): DomainState[] {
    return this.getAllDomains().filter(d => d.event_count > 0);
  }
}
