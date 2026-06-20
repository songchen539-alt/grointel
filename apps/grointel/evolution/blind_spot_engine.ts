// EVOLUTION-1 — Blind Spot Engine
import { BlindSpot } from "./evolution_types";

export class BlindSpotEngine {
  detect(coverages: { domain: string; coverage: number; confidence: number; entities: number; evidence: number }[]): BlindSpot[] {
    return coverages
      .filter(c => c.coverage < 50 || c.confidence < 40 || c.entities < 3)
      .map(c => ({
        id: "bs_" + Math.random().toString(36).slice(2, 8),
        domain: c.domain,
        description: `Low coverage in ${c.domain}: coverage=${c.coverage}%, confidence=${c.confidence}%, entities=${c.entities}`,
        severity: c.coverage < 20 ? "critical" : c.coverage < 35 ? "high" : "medium" as any,
        evidence: [`Coverage: ${c.coverage}%`, `Confidence: ${c.confidence}%`],
        suggested_action: `Increase exploration of ${c.domain} — target ${Math.max(10, Math.round((50 - c.coverage) * 2))} new observations`,
      }));
  }
}
