// GroIntel DATA-5 — Cause Strength Calculator
import { CauseStrength, CauseEdge } from "./cause_types";

export class CauseStrengthCalculator {
  compute(edge: CauseEdge, crossCompany: number, crossIndustry: number): CauseStrength {
    return {
      frequency: Math.min(100, edge.evidence.length * 15 + 10),
      effect_size: edge.strength,
      confidence: edge.confidence,
      time_delay_days: 30,
      cross_company_reuse: Math.min(100, crossCompany * 20),
      cross_industry_reuse: Math.min(100, crossIndustry * 15),
      composite: Math.round((edge.strength * 0.3 + edge.confidence * 0.25 + Math.min(100, crossCompany * 20) * 0.25 + Math.min(100, crossIndustry * 15) * 0.2)),
    };
  }
}
