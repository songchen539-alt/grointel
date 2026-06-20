// GroIntel DATA-1 — Company Growth Observer
import { CompanyGrowthEvent } from "./company_types";

export class CompanyGrowthObserver {
  private counter = 0;

  observe(companyId: string, campaign: string, channel: string, partner: string, creator: string, agency: string, region: string, audience: string, evidence: string[], outcome: string): CompanyGrowthEvent {
    return {
      id: "cge_" + (++this.counter).toString(16).padStart(6, "0"),
      company_id: companyId, campaign, channel, partner, creator, agency, region, audience, evidence, outcome,
    };
  }
}
