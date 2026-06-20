// GroIntel DATA-1 — Company Hiring Observer
import { CompanyHiringEvent } from "./company_types";

export class CompanyHiringObserver {
  private counter = 0;

  observe(companyId: string, role: string, function_: string, seniority: string, location: string, remote: boolean, department: string, volume: number, growthImplication: string): CompanyHiringEvent {
    return {
      id: "che_" + (++this.counter).toString(16).padStart(6, "0"),
      company_id: companyId, role, function: function_, seniority, location, remote, department, volume, growth_implication: growthImplication,
    };
  }
}
