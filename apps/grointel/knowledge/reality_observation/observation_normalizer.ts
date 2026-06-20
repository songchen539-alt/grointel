// GroIntel KNOWLEDGE-2 — Observation Normalizer
import { ObservationBatch, ObservationSignal } from "./reality_observation_types";

export class ObservationNormalizer {
  normalize(batch: ObservationBatch): ObservationSignal[] {
    const all: ObservationSignal[] = [];
    for (const obs of batch.observations) {
      for (const sig of obs.signals) {
        const existing = all.find(s => s.type === sig.type);
        if (existing) {
          existing.strength = Math.max(existing.strength, sig.strength);
          existing.confidence = Math.round((existing.confidence + sig.confidence) / 2);
          existing.evidence = [...new Set([...existing.evidence, ...sig.evidence])];
        } else {
          all.push({ ...sig });
        }
      }
    }
    return all.sort((a, b) => b.strength - a.strength);
  }
}
