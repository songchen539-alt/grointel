// GroIntel INT-4 — Gap Discoverer
import { GapDiscovery } from "./discovery_types";

let gdCounter = 0;
function genId(): string { return "gd_" + (++gdCounter).toString(16).padStart(6, "0"); }

export class GapDiscoverer {
  discover(knowledgeCoverage: number, capabilityCoverage: number, dataQuality: number, trustScore: number, marketCoverage: number, executionRate: number, evidenceQuality: number): GapDiscovery[] {
    const gaps: GapDiscovery[] = [];

    if (knowledgeCoverage < 50) {
      gaps.push({ id: genId(), type: "knowledge", description: `Knowledge coverage at ${knowledgeCoverage}% — significant gaps in understanding`, severity: Math.round(100 - knowledgeCoverage), confidence: 70, bridging_suggestion: "Increase observation in under-covered domains" });
    }
    if (capabilityCoverage < 50) {
      gaps.push({ id: genId(), type: "capability", description: `Capability coverage at ${capabilityCoverage}% — missing capability assessments`, severity: Math.round(100 - capabilityCoverage), confidence: 65, bridging_suggestion: "Run capability scans for unassessed entities" });
    }
    if (dataQuality < 50) {
      gaps.push({ id: genId(), type: "data", description: `Data quality at ${dataQuality}% — high uncertainty in observations`, severity: Math.round(100 - dataQuality), confidence: 75, bridging_suggestion: "Improve data source reliability and cross-validation" });
    }
    if (trustScore < 40) {
      gaps.push({ id: genId(), type: "trust", description: `Trust score at ${trustScore} — trust capital insufficient across network`, severity: Math.round(100 - trustScore), confidence: 70, bridging_suggestion: "Implement trust-building mechanisms and verification" });
    }
    if (marketCoverage < 40) {
      gaps.push({ id: genId(), type: "market", description: `Market coverage at ${marketCoverage}% — gaps in market intelligence`, severity: Math.round(100 - marketCoverage), confidence: 60, bridging_suggestion: "Expand market observation to under-covered segments" });
    }
    if (executionRate < 50) {
      gaps.push({ id: genId(), type: "execution", description: `Execution rate at ${executionRate}% — recommendations not being actioned`, severity: Math.round(100 - executionRate), confidence: 55, bridging_suggestion: "Analyze barriers to recommendation adoption" });
    }
    if (evidenceQuality < 50) {
      gaps.push({ id: genId(), type: "evidence", description: `Evidence quality at ${evidenceQuality}% — weak support for beliefs`, severity: Math.round(100 - evidenceQuality), confidence: 70, bridging_suggestion: "Collect higher-quality evidence through verification" });
    }

    return gaps;
  }
}
