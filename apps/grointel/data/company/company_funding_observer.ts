// GroIntel DATA-1 — Company Funding Observer
import { CompanyFundingEvent, FundingRound } from "./company_types";

export class CompanyFundingObserver {
  private counter = 0;

  observe(companyId: string, roundType: FundingRound, amount: number, currency: string, investors: string[], date: string, source: string, confidence = 60): CompanyFundingEvent {
    return {
      id: "cfe_" + (++this.counter).toString(16).padStart(6, "0"),
      company_id: companyId, round_type: roundType, amount, currency, investors, date, source, confidence,
    };
  }
}
