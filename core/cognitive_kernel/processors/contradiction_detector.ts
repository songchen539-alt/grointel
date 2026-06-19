// GroIntel Cognitive Kernel — Contradiction Detector
// Detects contradictions between observations, memory, predictions, and entity state
import { Observation, MemoryRecord, Prediction, ContradictionRecord, Entity } from "../kernel_types";
import { KernelMemory } from "../kernel_memory";

let conCounter = 0;
function genId(): string { return "con_" + (++conCounter).toString(16).padStart(6, "0"); }

export type ContradictionType = "factual_conflict" | "timeline_conflict" | "confidence_conflict" | "source_conflict" | "prediction_conflict";

export interface ContradictionDetectionResult {
  contradictions: ContradictionRecord[];
  hasContradictions: boolean;
}

export async function detectContradictions(
  observation: Observation,
  memory: KernelMemory,
  activePredictions: Prediction[],
  entities: Entity[],
): Promise<ContradictionDetectionResult> {
  const contradictions: ContradictionRecord[] = [];

  // 1. Check against existing memory for factual conflicts
  const entityMemories = observation.entity_id
    ? memory.getByEntity(observation.entity_id)
    : [];

  for (const mem of entityMemories.slice(-10)) {
    const memContent = mem.content as Record<string, unknown> || {};
    const obsContent = observation.extracted_data || {};

    // Check for contradictory values
    for (const [key, val] of Object.entries(obsContent)) {
      const memVal = memContent[key];
      if (memVal !== undefined && String(memVal) !== String(val) && typeof val === "string" && typeof memVal === "string") {
        contradictions.push({
          id: genId(),
          claim_a: `${key} = "${memVal}"`,
          claim_b: `${key} = "${val}"`,
          evidence_a: [mem.observation_id],
          evidence_b: [observation.id],
          severity: calculateSeverity(mem.confidence_after, observation.confidence),
          status: "detected",
          resolution: null,
          next_action: "investigate contradictory claims",
          created_at: new Date().toISOString(),
          resolved_at: null,
        });
      }
    }
  }

  // 2. Check against active predictions
  for (const pred of activePredictions) {
    if (pred.target_entity_id === observation.entity_id || pred.target_entity_id === null) {
      const predState = pred.predicted_state as Record<string, unknown> || {};
      const obsContent = observation.extracted_data || {};

      for (const [key, val] of Object.entries(obsContent)) {
        const predVal = predState[key];
        if (predVal !== undefined && String(predVal) !== String(val) && typeof val === "string" && typeof predVal === "string") {
          contradictions.push({
            id: genId(),
            claim_a: `prediction: ${key} = "${predVal}"`,
            claim_b: `observed: ${key} = "${val}"`,
            evidence_a: [pred.id],
            evidence_b: [observation.id],
            severity: calculateSeverity(pred.confidence, observation.confidence),
            status: "detected",
            resolution: null,
            next_action: "validate prediction against observation",
            created_at: new Date().toISOString(),
            resolved_at: null,
          });
        }
      }
    }
  }

  return { contradictions, hasContradictions: contradictions.length > 0 };
}

function calculateSeverity(confidenceA: number, confidenceB: number): number {
  const base = Math.min(100, (confidenceA + confidenceB) / 2);
  return Math.round(Math.min(100, base + 20));
}
