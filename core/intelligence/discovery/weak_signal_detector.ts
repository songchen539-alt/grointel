// GroIntel INT-4 — Weak Signal Detector
import { WeakSignal } from "./discovery_types";

let wsCounter = 0;
function genId(): string { return "ws_" + (++wsCounter).toString(16).padStart(6, "0"); }

export class WeakSignalDetector {
  detect(highNoveltyEvents: number, crossDomainConnections: number, emergingEntities: number, repeatedSmallEvents: number): WeakSignal[] {
    const signals: WeakSignal[] = [];

    if (highNoveltyEvents > 2) {
      signals.push({
        id: genId(), description: `Multiple high-novelty events (${highNoveltyEvents}) suggest emerging trend`,
        novelty: Math.min(100, highNoveltyEvents * 25), upside_potential: 70, confidence: 50,
        domain: "General", cross_domain: false, early_indicators: ["High novelty score", "Multiple sources"],
      });
    }

    if (crossDomainConnections > 0) {
      signals.push({
        id: genId(), description: `Unusual cross-domain connections detected (${crossDomainConnections})`,
        novelty: 80, upside_potential: 65, confidence: 45,
        domain: "General", cross_domain: true, early_indicators: ["Cross-domain signal", "Unusual connection"],
      });
    }

    if (emergingEntities > 2) {
      signals.push({
        id: genId(), description: `Emerging entity cluster: ${emergingEntities} new entities detected in proximity`,
        novelty: 75, upside_potential: 60, confidence: 55,
        domain: "General", cross_domain: false, early_indicators: ["Entity cluster", "Proximity pattern"],
      });
    }

    if (repeatedSmallEvents > 3) {
      signals.push({
        id: genId(), description: `${repeatedSmallEvents} repeated small events may precede larger trend`,
        novelty: 60, upside_potential: 55, confidence: 50,
        domain: "General", cross_domain: false, early_indicators: ["Small event accumulation", "Trend precursor"],
      });
    }

    return signals;
  }
}
