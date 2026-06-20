// GroIntel DATA-1 — Company Signal Extractor
import { CompanySignal, CompanySignalType, CompanyObservation } from "./company_types";

export class CompanySignalExtractor {
  extract(observation: CompanyObservation): CompanySignal[] {
    const signals: CompanySignal[] = [];
    const norm = observation.normalized_data;
    const raw = observation.raw_data;

    if (norm.funding_amount || raw.funding) {
      signals.push(this.makeSignal("funding_signal", 70, observation.confidence, [observation.id], [observation.company_id || ""], Math.min(100, observation.confidence + 10)));
    }
    if (norm.hiring_roles || raw.hiring) {
      signals.push(this.makeSignal("hiring_signal", 60, observation.confidence, [observation.id], [observation.company_id || ""], Math.min(100, observation.confidence + 5)));
    }
    if (norm.product_launch || raw.product) {
      signals.push(this.makeSignal("product_launch_signal", 80, observation.confidence, [observation.id], [observation.company_id || ""], 90));
    }
    if (norm.partnership || raw.partner) {
      signals.push(this.makeSignal("partnership_signal", 65, observation.confidence, [observation.id], [observation.company_id || ""], 70));
    }
    if (norm.market_expansion || raw.expansion) {
      signals.push(this.makeSignal("market_expansion_signal", 75, observation.confidence, [observation.id], [observation.company_id || ""], 80));
    }
    if (norm.pricing_change || raw.pricing) {
      signals.push(this.makeSignal("pricing_change_signal", 50, observation.confidence, [observation.id], [observation.company_id || ""], 60));
    }
    if (norm.technology || raw.tech) {
      signals.push(this.makeSignal("technology_adoption_signal", 55, observation.confidence, [observation.id], [observation.company_id || ""], 65));
    }
    if (norm.risk || raw.risk) {
      signals.push(this.makeSignal("risk_signal", 85, observation.confidence, [observation.id], [observation.company_id || ""], 75));
    }
    if (observation.evidence.length > 3) {
      signals.push(this.makeSignal("trust_signal", 60, observation.confidence, observation.evidence, [observation.company_id || ""], 70));
    }

    return signals;
  }

  private makeSignal(type: CompanySignalType, strength: number, confidence: number, evidence: string[], entities: string[], freshness: number): CompanySignal {
    return { id: "csig_" + (++CompanySignalExtractor.counter).toString(16).padStart(6, "0"), type, strength, confidence, evidence, freshness, affected_entities: entities };
  }

  private static counter = 0;
}
