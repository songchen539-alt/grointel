// GroIntel INT-1 — Uncertainty Model
import { Scenario, UncertaintyModel } from "./simulation_types";

export class UncertaintyCalculator {
  calculate(scenario: Scenario): UncertaintyModel {
    const varUncertainty = scenario.variables.reduce((s, v) => s + (100 - v.confidence), 0);
    const unknownVars = scenario.variables.filter(v => v.volatility > 40).length;
    const assumptionTrust = scenario.assumptions.reduce((s, a) => s + a.confidence, 0) / Math.max(1, scenario.assumptions.length);

    return {
      overall_uncertainty: Math.round((100 - assumptionTrust) * 0.4 + Math.min(100, varUncertainty / Math.max(1, scenario.variables.length)) * 0.3 + scenario.time_horizon_days * 0.3),
      unknown_variables: unknownVars,
      missing_evidence: scenario.input.signals.length < 3 ? 3 - scenario.input.signals.length : 0,
      contradictions: scenario.input.risks.length > scenario.input.opportunities.length ? scenario.input.risks.length - scenario.input.opportunities.length : 0,
      low_confidence_sources: scenario.variables.filter(v => v.confidence < 60).length,
      volatile_signals: scenario.variables.filter(v => v.volatility > 50).length,
      time_horizon_decay: Math.min(80, Math.round(scenario.time_horizon_days * 0.3)),
    };
  }
}
