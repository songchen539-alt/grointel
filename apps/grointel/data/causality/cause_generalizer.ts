// GroIntel DATA-5 — Cause Generalizer
import { CauseChain } from "./cause_types";

export class CauseGeneralizer {
  generalize(chain: CauseChain, newCompany: string): CauseChain {
    if (!chain.supporting_companies.includes(newCompany)) {
      chain.supporting_companies.push(newCompany);
      chain.confidence = Math.min(100, chain.confidence + 5);
    }
    return chain;
  }
}
