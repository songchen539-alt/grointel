// GroIntel INT-4 — Opportunity Discoverer
import { OpportunityDiscovery } from "./discovery_types";

let odCounter = 0;
function genId(): string { return "od_" + (++odCounter).toString(16).padStart(6, "0"); }

export class OpportunityDiscoverer {
  discover(demandWithoutSupply: boolean, trustGapExists: boolean, techShiftReadiness: number, repeatedPain: string[], capabilityMismatch: boolean): OpportunityDiscovery[] {
    const opps: OpportunityDiscovery[] = [];

    if (demandWithoutSupply) {
      opps.push({
        id: genId(), type: "demand_without_supply",
        description: "Market demand detected without adequate supply response — opportunity to fill gap",
        confidence: 65, potential_value: 80, prerequisites: ["Verify demand sustainability", "Assess supply barriers"],
      });
    }

    if (trustGapExists) {
      opps.push({
        id: genId(), type: "trust_gap",
        description: "Trust gap detected — opportunity to build verification and transparency infrastructure",
        confidence: 60, potential_value: 70, prerequisites: ["Design verification mechanism", "Build trust framework"],
      });
    }

    if (techShiftReadiness > 60) {
      opps.push({
        id: genId(), type: "tech_shift",
        description: `Technology shift readiness at ${techShiftReadiness}% — opportunity to lead adoption`,
        confidence: 55, potential_value: 85, prerequisites: ["Monitor adoption trajectory", "Identify early customers"],
      });
    }

    for (const pain of repeatedPain.slice(0, 2)) {
      opps.push({
        id: genId(), type: "repeated_pain",
        description: `Repeated user pain identified: "${pain}" — opportunity to solve systemic issue`,
        confidence: 70, potential_value: 75, prerequisites: ["Validate pain across population", "Design solution approach"],
      });
    }

    if (capabilityMismatch) {
      opps.push({
        id: genId(), type: "capability_mismatch",
        description: "Capability mismatch detected between entities — opportunity for strategic pairing",
        confidence: 55, potential_value: 65, prerequisites: ["Identify specific mismatch", "Match with complementary capability"],
      });
    }

    return opps;
  }
}
