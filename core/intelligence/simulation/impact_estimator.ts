// GroIntel INT-1 — Impact Estimator
import { Scenario, ImpactEstimate, ImpactDomain } from "./simulation_types";

let ieCounter = 0;
function genId(): string { return "ie_" + (++ieCounter).toString(16).padStart(6, "0"); }

export class ImpactEstimator {
  estimate(scenario: Scenario): ImpactEstimate[] {
    return ([
      { domain: "growth_impact" as ImpactDomain, base: 40, reasoning: "Based on growth signal strength and entity trajectory" },
      { domain: "trust_impact" as ImpactDomain, base: 20, reasoning: "Trust impact depends on transparency and consistency of outcomes" },
      { domain: "risk_impact" as ImpactDomain, base: -30, reasoning: "Risk exposure depends on signal contradictions and uncertainty" },
      { domain: "knowledge_impact" as ImpactDomain, base: 50, reasoning: "Every simulation generates learning regardless of outcome" },
      { domain: "capability_impact" as ImpactDomain, base: 30, reasoning: "Capability development is driven by executed strategies" },
      { domain: "market_impact" as ImpactDomain, base: 35, reasoning: "Market position changes with competitive dynamics" },
      { domain: "civilization_impact" as ImpactDomain, base: 10, reasoning: "Civilization-level effects accumulate over longer time horizons" },
    ]).map(item => ({
      id: genId(),
      domain: item.domain,
      score: this.adjust(item.domain, item.base, scenario),
      confidence: 65,
      reasoning: item.reasoning,
    }));
  }

  private adjust(domain: ImpactDomain, base: number, scenario: Scenario): number {
    const hasRisks = scenario.input.risks.length > 0;
    const hasOpps = scenario.input.opportunities.length > 0;
    let adj = base;
    if (domain === "risk_impact" && hasRisks) adj -= 20;
    if (domain === "growth_impact" && hasOpps) adj += 15;
    if (domain === "market_impact" && scenario.input.signals.length > 3) adj += 10;
    if (domain === "civilization_impact" && scenario.type === "civilization_scenario") adj += 25;
    return Math.max(-100, Math.min(100, adj));
  }
}
