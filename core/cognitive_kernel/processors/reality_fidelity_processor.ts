// GroIntel Cognitive Kernel — Reality Fidelity Processor
// Calculates reality fidelity scores for observations, entities, signals, memory, predictions
import { Observation, Entity, Signal, MemoryRecord, Prediction, RealityFidelityScore } from "../kernel_types";
import { KernelMemory } from "../kernel_memory";

export interface FidelityInput {
  observation?: Observation;
  entity?: Entity;
  signals?: Signal[];
  memory?: KernelMemory;
  predictions?: Prediction[];
}

export function calculateFidelity(input: FidelityInput): RealityFidelityScore {
  const evidenceStrength = calcEvidenceStrength(input);
  const sourceQuality = calcSourceQuality(input);
  const freshness = calcFreshness(input);
  const crossValidation = calcCrossValidation(input);
  const contradictionPenalty = calcContradictionPenalty(input);
  const confidenceConsistency = calcConfidenceConsistency(input);

  const overall = Math.round(
    evidenceStrength * 0.25 +
    sourceQuality * 0.20 +
    freshness * 0.15 +
    crossValidation * 0.20 +
    (100 - contradictionPenalty) * 0.10 +
    confidenceConsistency * 0.10
  );

  const uncertainty = 100 - evidenceStrength;

  return {
    overall: Math.max(0, Math.min(100, overall)),
    components: {
      evidence_strength: evidenceStrength,
      source_quality: sourceQuality,
      freshness,
      contradiction_rate: contradictionPenalty,
      prediction_accuracy: 0,
      cross_validation: crossValidation,
      uncertainty,
    },
    confidence: Math.round(overall * 0.85),
    missing_evidence: uncertainty > 50 ? ["Need more observations to increase evidence strength"] : [],
    recommended_next_observation: evidenceStrength < 40 ? ["Increase observation frequency for this entity"] : [],
    calculated_at: new Date().toISOString(),
  };
}

function calcEvidenceStrength(input: FidelityInput): number {
  if (input.memory) return Math.min(100, input.memory.getRecordCount() * 5);
  if (input.observation) return input.observation.confidence;
  return 30;
}

function calcSourceQuality(input: FidelityInput): number {
  if (!input.observation) return 50;
  const source = input.observation.source;
  const quality: Record<string, number> = {
    observation: 70, interaction: 85, inference: 50,
    prediction: 60, feedback: 80, external_api: 65, user_input: 90,
  };
  return quality[source] || 50;
}

function calcFreshness(input: FidelityInput): number {
  if (!input.observation) return 50;
  const age = Date.now() - new Date(input.observation.created_at).getTime();
  const hours = age / (1000 * 60 * 60);
  if (hours < 1) return 100;
  if (hours < 24) return 90;
  if (hours < 168) return 70;
  if (hours < 720) return 50;
  return 30;
}

function calcCrossValidation(input: FidelityInput): number {
  if (input.signals && input.signals.length > 0) {
    const avgStrength = input.signals.reduce((s, sig) => s + sig.strength, 0) / input.signals.length;
    return Math.round(avgStrength);
  }
  return 30;
}

function calcContradictionPenalty(input: FidelityInput): number {
  const base = 0;
  if (input.signals) {
    const conflicting = input.signals.filter(s => s.signal_type.includes("risk"));
    return Math.min(50, conflicting.length * 10);
  }
  return base;
}

function calcConfidenceConsistency(input: FidelityInput): number {
  if (input.predictions && input.predictions.length > 0) {
    const avgConf = input.predictions.reduce((s, p) => s + p.confidence, 0) / input.predictions.length;
    return Math.round(avgConf);
  }
  return 50;
}
