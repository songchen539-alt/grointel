// GroIntel DATA-1 — Company Trace
import { CompanyTrace } from "./company_types";

export class CompanyTraceRecorder {
  private traces: CompanyTrace[] = [];

  record(action: string, companyId: string, details: string): CompanyTrace {
    const t: CompanyTrace = { id: "ct_" + (++CompanyTraceRecorder.counter).toString(16).padStart(6, "0"), action, company_id: companyId, details, timestamp: new Date().toISOString() };
    this.traces.push(t);
    return t;
  }

  getAll(): CompanyTrace[] { return this.traces; }
  findByCompany(companyId: string): CompanyTrace[] { return this.traces.filter(t => t.company_id === companyId); }
  findByAction(action: string): CompanyTrace[] { return this.traces.filter(t => t.action === action); }
  private static counter = 0;
}
