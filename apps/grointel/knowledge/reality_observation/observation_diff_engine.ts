// GroIntel KNOWLEDGE-2 — Observation Diff Engine
import { ObservationDiff, ObservationSignal, ObservationBatch } from "./reality_observation_types";

export class ObservationDiffEngine {
  diff(previous: ObservationSignal[], current: ObservationBatch): ObservationDiff {
    const currentSignals = new ObservationNormalizerPass().normalizeSignals(current);
    const prevMap = new Map(previous.map(s => [s.type, s]));
    const currMap = new Map(currentSignals.map(s => [s.type, s]));

    const newSignals = currentSignals.filter(s => !prevMap.has(s.type));
    const removedSignals = previous.filter(s => !currMap.has(s.type)).map(s => s.type);
    const changed: { before: ObservationSignal; after: ObservationSignal; importance: "low"|"medium"|"high" }[] = [];

    for (const [type, curr] of currMap) {
      const prev = prevMap.get(type);
      if (prev) {
        const diff = Math.abs((curr.strength || 0) - (prev.strength || 0));
        if (diff > 20) changed.push({ before: prev, after: curr, importance: "high" });
        else if (diff > 10) changed.push({ before: prev, after: curr, importance: "medium" });
        else if (diff > 0) changed.push({ before: prev, after: curr, importance: "low" });
      }
    }

    return {
      new_signals: newSignals, changed_signals: changed, removed_signals: removedSignals,
      signal_count_before: previous.length, signal_count_after: currentSignals.length,
      has_significant_change: newSignals.length > 0 || removedSignals.length > 0 || changed.some(c => c.importance === "high" || c.importance === "medium"),
      computed_at: new Date().toISOString(),
    };
  }
}

// Helper class for IIFE pattern avoidance
class ObservationNormalizerPass {
  normalizeSignals(batch: ObservationBatch): ObservationSignal[] {
    const all: ObservationSignal[] = [];
    for (const obs of batch.observations) {
      for (const sig of obs.signals) {
        const existing = all.find(s => s.type === sig.type);
        if (existing) {
          existing.strength = Math.max(existing.strength, sig.strength);
          existing.confidence = Math.round((existing.confidence + sig.confidence) / 2);
        } else {
          all.push({ ...sig });
        }
      }
    }
    return all;
  }
}
