// GroIntel INT-4 — Pattern Discoverer
import { Pattern } from "./discovery_types";

let pCounter = 0;
function genId(): string { return "pat_" + (++pCounter).toString(16).padStart(6, "0"); }

export class PatternDiscoverer {
  discover(signalCount: number, opportunityCount: number, riskCount: number, growthLoopSignals: boolean, trustFailures: number): Pattern[] {
    const patterns: Pattern[] = [];

    if (signalCount > 5) {
      patterns.push({
        id: genId(), type: "signal_combination",
        description: `Repeated signal combination: ${signalCount} signals co-occur across observations`,
        frequency: signalCount, confidence: 60, supporting_cases: signalCount,
      });
    }

    if (opportunityCount > 3) {
      patterns.push({
        id: genId(), type: "opportunity_structure",
        description: `Opportunities consistently emerge when ${opportunityCount} conditions align`,
        frequency: opportunityCount, confidence: 65, supporting_cases: opportunityCount,
      });
    }

    if (riskCount > 3) {
      patterns.push({
        id: genId(), type: "risk_structure",
        description: `Risk patterns detected: ${riskCount} similar risk structures observed`,
        frequency: riskCount, confidence: 60, supporting_cases: riskCount,
      });
    }

    if (growthLoopSignals) {
      patterns.push({
        id: genId(), type: "growth_loop",
        description: "Growth loop detected: signal combinations indicate reinforcing growth cycle",
        frequency: 1, confidence: 55, supporting_cases: 1,
      });
    }

    if (trustFailures > 2) {
      patterns.push({
        id: genId(), type: "trust_failure",
        description: `Repeated trust failures: ${trustFailures} incidents follow similar pattern`,
        frequency: trustFailures, confidence: 70, supporting_cases: trustFailures,
      });
    }

    return patterns;
  }
}
