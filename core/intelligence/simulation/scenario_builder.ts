// GroIntel INT-1 — Scenario Builder
import { Scenario, ScenarioType, SimulationInput, SimulationVariable, SimulationAssumption } from "./simulation_types";

let scCounter = 0;
function genId(): string { return "scn_" + (++scCounter).toString(16).padStart(6, "0"); }

export class ScenarioBuilder {
  build(input: SimulationInput, scenarioType?: ScenarioType): Scenario {
    const type = scenarioType || this.inferType(input);
    const variables = this.buildVariables(input);
    const assumptions = this.buildAssumptions(input, type);
    return {
      id: genId(),
      type,
      description: `${type.replace(/_/g, " ")} simulation for ${input.target_entity}`,
      input,
      variables,
      assumptions,
      time_horizon_days: input.time_horizon_days,
      created_at: new Date().toISOString(),
    };
  }

  private inferType(input: SimulationInput): ScenarioType {
    if (input.risks.length > input.opportunities.length) return "risk_scenario";
    if (input.signals.some(s => s.includes("trust") || s.includes("compliance"))) return "trust_scenario";
    if (input.signals.some(s => s.includes("market") || s.includes("demand"))) return "market_scenario";
    if (input.signals.some(s => s.includes("capability") || s.includes("talent"))) return "capability_scenario";
    if (input.signals.some(s => s.includes("growth") || s.includes("expansion"))) return "growth_scenario";
    return "civilization_scenario";
  }

  private buildVariables(input: SimulationInput): SimulationVariable[] {
    const vars: SimulationVariable[] = [];
    if (input.current_state.velocity !== undefined) {
      vars.push({ name: "velocity", current_value: Number(input.current_state.velocity) || 50, possible_values: [30, 50, 70], confidence: 70, volatility: 30 });
    }
    if (input.current_state.confidence !== undefined) {
      vars.push({ name: "confidence", current_value: Number(input.current_state.confidence) || 50, possible_values: [40, 50, 60], confidence: 75, volatility: 20 });
    }
    vars.push({ name: "market_conditions", current_value: 50, possible_values: [30, 50, 70], confidence: 60, volatility: 40 });
    vars.push({ name: "competitive_response", current_value: 50, possible_values: [20, 50, 80], confidence: 50, volatility: 50 });
    return vars;
  }

  private buildAssumptions(input: SimulationInput, type: ScenarioType): SimulationAssumption[] {
    return [
      { statement: "Current conditions will persist for at least half the simulation horizon", confidence: 65, impact_on_outcome: 70, evidence: input.signals },
      { statement: `Primary drivers for ${type} remain stable`, confidence: 60, impact_on_outcome: 60, evidence: input.goals },
      { statement: "No unforeseen black swan events occur", confidence: 40, impact_on_outcome: 90, evidence: [] },
    ];
  }
}
