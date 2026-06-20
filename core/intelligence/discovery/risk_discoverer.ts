// GroIntel INT-4 — Risk Discoverer
import { RiskDiscovery } from "./discovery_types";

let rdCounter = 0;
function genId(): string { return "rd_" + (++rdCounter).toString(16).padStart(6, "0"); }

export class RiskDiscoverer {
  discover(contradictionRise: boolean, trustDecline: boolean, regulationVelocity: number, predictionFailures: number, fundingDecline: boolean, layoffs: number, sourceDecay: number): RiskDiscovery[] {
    const risks: RiskDiscovery[] = [];

    if (contradictionRise) {
      risks.push({
        id: genId(), type: "rising_contradictions", description: "Rising contradiction density indicates knowledge quality declining",
        severity: 65, confidence: 70, affected_entities: [],
      });
    }

    if (trustDecline) {
      risks.push({
        id: genId(), type: "declining_trust", description: "Trust signals declining — reputation capital at risk",
        severity: 75, confidence: 65, affected_entities: [],
      });
    }

    if (regulationVelocity > 60) {
      risks.push({
        id: genId(), type: "regulation_velocity", description: `Regulation velocity at ${regulationVelocity}% — compliance risk increasing`,
        severity: Math.min(100, regulationVelocity), confidence: 60, affected_entities: [],
      });
    }

    if (predictionFailures > 3) {
      risks.push({
        id: genId(), type: "prediction_failures", description: `${predictionFailures} prediction failures undermine decision confidence`,
        severity: Math.min(100, predictionFailures * 15), confidence: 75, affected_entities: [],
      });
    }

    if (fundingDecline) {
      risks.push({
        id: genId(), type: "funding_decline", description: "Funding signals declining — resource availability may decrease",
        severity: 70, confidence: 55, affected_entities: [],
      });
    }

    if (layoffs > 0) {
      risks.push({
        id: genId(), type: "layoffs", description: `${layoffs} layoff events detected — human capital at risk`,
        severity: Math.min(100, layoffs * 20), confidence: 60, affected_entities: [],
      });
    }

    if (sourceDecay > 50) {
      risks.push({
        id: genId(), type: "source_decay", description: `Source reliability decaying (${sourceDecay}%) — evidence quality declining`,
        severity: Math.min(100, sourceDecay), confidence: 65, affected_entities: [],
      });
    }

    return risks;
  }
}
