// GroIntel DATA-1 — Company Change Detector
import { CompanyChange, ChangeType, CompanyProfile } from "./company_types";

export class CompanyChangeDetector {
  private counter = 0;

  detect(profile: CompanyProfile, updates: Partial<CompanyProfile>): CompanyChange[] {
    const changes: CompanyChange[] = [];

    if (!profile.last_observed_at || profile.version === 1) {
      changes.push(this.makeChange("new_company", profile.id, {}, updates as any, "New company discovered", "medium", 80, false));
    }
    if (updates.employees_estimate && Math.abs(updates.employees_estimate - profile.employees_estimate) > (profile.employees_estimate * 0.2)) {
      changes.push(this.makeChange("profile_update", profile.id, { employees: profile.employees_estimate }, { employees: updates.employees_estimate }, `Employee count changed`, "medium", 60, true));
    }
    if (updates.technologies && updates.technologies.length > profile.technologies.length) {
      changes.push(this.makeChange("technology_update", profile.id, { tech: profile.technologies }, { tech: updates.technologies }, "New technologies detected", "high", 70, false));
    }
    if (updates.products && updates.products.length > profile.products.length) {
      changes.push(this.makeChange("product_update", profile.id, { products: profile.products }, { products: updates.products }, "New products detected", "high", 75, false));
    }

    return changes;
  }

  private makeChange(type: ChangeType, companyId: string, before: Record<string, unknown>, after: Record<string, unknown>, delta: string, importance: any, confidence: number, requiresReview: boolean): CompanyChange {
    return { id: "cc_" + (++this.counter).toString(16).padStart(6, "0"), type, company_id: companyId, before, after, delta, importance, confidence, requires_review: requiresReview, timestamp: new Date().toISOString() };
  }
}
