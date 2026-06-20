// GroIntel DATA-2 — Supply Entity Resolver
import { GrowthSupplyProfile } from "./supply_types";

export class SupplyEntityResolver {
  resolve(profiles: GrowthSupplyProfile[], c: Partial<GrowthSupplyProfile>): GrowthSupplyProfile | null {
    if (c.website) { const m = profiles.find(p => p.website.toLowerCase() === c.website!.toLowerCase()); if (m) return m; }
    if (c.name && c.confidence && c.confidence >= 70) { const m = profiles.find(p => p.name.toLowerCase() === c.name!.toLowerCase()); if (m) return m; }
    return null;
  }

  merge(p: GrowthSupplyProfile, u: Partial<GrowthSupplyProfile>): GrowthSupplyProfile {
    const now = new Date().toISOString(); p.version++; p.confidence = (p.confidence*(p.version-1)+(u.confidence||50))/p.version;
    p.last_observed_at = now; p.last_verified_at = now; p.source_count++;
    if (u.industries_served) p.industries_served = [...new Set([...p.industries_served, ...u.industries_served])];
    if (u.capabilities) p.capabilities = [...new Set([...p.capabilities, ...u.capabilities])];
    if (u.audiences) p.audiences = [...new Set([...p.audiences, ...u.audiences])];
    p.history.push({ timestamp: now, change: "Merged", confidence: p.confidence });
    return p;
  }
}
