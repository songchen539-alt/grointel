// GroIntel Cognitive Kernel — Prediction Generator
// Generates first-order predictions from high-confidence signals
import { Signal, Prediction, Entity } from "../kernel_types";

let predCounter = 0;
function genId(): string { return "pred_" + (++predCounter).toString(16).padStart(6, "0"); }

const SIGNAL_PREDICTION_RULES: Record<string, (signal: Signal, entity?: Entity) => Partial<Prediction> | null> = {
  funding_signal: (s, e) => ({
    target_field: "execution_capacity",
    predicted_state: { execution_capacity: "increased", reason: "New funding enables hiring and expansion" },
    time_horizon_seconds: 90 * 24 * 60 * 60,
    probability: 75,
    assumptions: ["Funding is used for growth", "Market conditions remain stable"],
    unknown_variables: ["Actual use of funds", "Market reception", "Competitive response"],
  }),

  hiring_signal: (s, e) => ({
    target_field: "team_capability",
    predicted_state: { team_capability: "expanding", reason: "Hiring indicates capability development" },
    time_horizon_seconds: 60 * 24 * 60 * 60,
    probability: s.strength > 70 ? 80 : 60,
    assumptions: ["Hires are for growth roles", "Hires are successful"],
    unknown_variables: ["Actual hires", "Retention", "Time to productivity"],
  }),

  product_signal: (s, e) => ({
    target_field: "market_position",
    predicted_state: { market_position: "strengthening", reason: "New product expands addressable market" },
    time_horizon_seconds: 120 * 24 * 60 * 60,
    probability: 65,
    assumptions: ["Product gains traction", "Competitive response is manageable"],
    unknown_variables: ["Product-market fit", "Adoption rate", "Competitive response"],
  }),

  growth_signal: (s, e) => ({
    target_field: "trajectory",
    predicted_state: { trajectory: "positive", reason: "Growth signals indicate momentum" },
    time_horizon_seconds: 90 * 24 * 60 * 60,
    probability: 70,
    assumptions: ["Growth is organic", "Market conditions are favorable"],
    unknown_variables: ["Sustainability of growth", "Unit economics", "Market capacity"],
  }),

  risk_signal: (s, e) => ({
    target_field: "trust_score",
    predicted_state: { trust_score: "may_decline", reason: "Risk signals may affect stakeholder confidence" },
    time_horizon_seconds: 30 * 24 * 60 * 60,
    probability: 60,
    assumptions: ["Risk materializes", "Stakeholders react negatively"],
    unknown_variables: ["Actual impact", "Mitigation effectiveness", "Stakeholder response"],
  }),

  market_signal: (s, e) => ({
    target_field: "market_opportunity",
    predicted_state: { market_opportunity: s.strength > 70 ? "increasing" : "stable", reason: "Market signals indicate opportunity changes" },
    time_horizon_seconds: 180 * 24 * 60 * 60,
    probability: 55,
    assumptions: ["Market trend continues", "No disruptive events"],
    unknown_variables: ["Competitive dynamics", "Regulatory changes", "Technology shifts"],
  }),

  technology_signal: (s, e) => ({
    target_field: "capability_evolution",
    predicted_state: { capability_evolution: "accelerating", reason: "Technology signals indicate capability expansion" },
    time_horizon_seconds: 180 * 24 * 60 * 60,
    probability: 65,
    assumptions: ["Technology is adopted", "Investment continues"],
    unknown_variables: ["Adoption timeline", "Competing technologies", "Regulation"],
  }),
};

export function generatePredictions(signals: Signal[], existingEntities: Entity[]): Prediction[] {
  const predictions: Prediction[] = [];

  for (const signal of signals) {
    const rule = SIGNAL_PREDICTION_RULES[signal.signal_type];
    if (!rule) continue;

    const entity = signal.entity_id ? existingEntities.find(e => e.id === signal.entity_id) : undefined;
    const partial = rule(signal, entity);
    if (!partial) continue;

    const now = new Date();
    const validationDue = new Date(now.getTime() + (partial.time_horizon_seconds || 86400) * 1000);

    predictions.push({
      id: genId(),
      target_entity_id: signal.entity_id || "unknown",
      target_field: partial.target_field || "unknown",
      predicted_state: partial.predicted_state || {},
      current_state: entity ? { name: entity.name, type: entity.type, trust_score: entity.trust_score } : {},
      time_horizon_seconds: partial.time_horizon_seconds || 86400,
      probability: partial.probability || 50,
      confidence: signal.strength,
      evidence: [signal.observation_id],
      assumptions: partial.assumptions || [],
      unknown_variables: partial.unknown_variables || [],
      status: "active",
      validation_due_at: validationDue.toISOString(),
      actual_outcome: null,
      prediction_error: null,
      created_at: now.toISOString(),
      validated_at: null,
    });
  }

  return predictions;
}
