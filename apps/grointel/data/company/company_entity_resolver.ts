// GroIntel DATA-1 — Company Entity Resolver
import { CompanyProfile } from "./company_types";

export class CompanyEntityResolver {
  resolve(profiles: CompanyProfile[], candidate: Partial<CompanyProfile>): CompanyProfile | null {
    // Same domain = same company
    if (candidate.domain) {
      const byDomain = profiles.find(p => p.domain.toLowerCase() === candidate.domain!.toLowerCase());
      if (byDomain) return byDomain;
    }
    // Same website = same company
    if (candidate.website) {
      const bySite = profiles.find(p => p.website.toLowerCase() === candidate.website!.toLowerCase());
      if (bySite) return bySite;
    }
    // Name match requires minimum confidence
    if (candidate.name && candidate.confidence && candidate.confidence >= 70) {
      const byName = profiles.find(p => p.name.toLowerCase() === candidate.name!.toLowerCase() || p.name.toLowerCase().includes(candidate.name!.toLowerCase()));
      if (byName) return byName;
    }
    // Alias match
    if (candidate.name) {
      const byAlias = profiles.find(p => p.history.some(h => h.change.toLowerCase().includes(candidate.name!.toLowerCase())));
      if (byAlias && (candidate.confidence || 0) >= 60) return byAlias;
    }
    return null;
  }

  merge(existing: CompanyProfile, update: Partial<CompanyProfile>): CompanyProfile {
    const now = new Date().toISOString();
    existing.version++;
    existing.confidence = (existing.confidence * (existing.version - 1) + (update.confidence || 50)) / existing.version;
    existing.last_observed_at = now;
    existing.last_verified_at = now;
    existing.source_count++;
    existing.evidence_count += update.evidence_count || 1;
    if (update.employees_estimate) existing.employees_estimate = update.employees_estimate;
    if (update.technologies) existing.technologies = [...new Set([...existing.technologies, ...update.technologies])];
    if (update.products) existing.products = [...new Set([...existing.products, ...update.products])];
    existing.history.push({ timestamp: now, change: "Entity merged", confidence: existing.confidence });
    return existing;
  }
}
