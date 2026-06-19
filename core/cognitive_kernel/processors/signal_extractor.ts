// GroIntel Cognitive Kernel — Signal Extractor
// Extracts typed signals from observations
import { Observation, Signal } from "../kernel_types";

export type SignalType =
  | "growth_signal" | "risk_signal" | "demand_signal" | "supply_signal"
  | "trust_signal" | "funding_signal" | "hiring_signal" | "product_signal"
  | "market_signal" | "technology_signal" | "civilization_signal";

let sigCounter = 0;
function genId(): string { return "sig_" + (++sigCounter).toString(16).padStart(6, "0"); }

interface SignalPattern {
  type: SignalType;
  keywords: string[];
  baseStrength: number;
}

const SIGNAL_PATTERNS: SignalPattern[] = [
  { type: "funding_signal", keywords: ["raised", "funding", "series", "seed", "investment", "million", "billion"], baseStrength: 80 },
  { type: "hiring_signal", keywords: ["hiring", "layoff", "headcount", "recruiting", "team expansion", "workforce"], baseStrength: 65 },
  { type: "product_signal", keywords: ["launched", "released", "shipped", "new product", "platform", "model", "api"], baseStrength: 70 },
  { type: "growth_signal", keywords: ["grew", "increased", "expanding", "scaling", "record", "milestone", "users"], baseStrength: 75 },
  { type: "risk_signal", keywords: ["risk", "threat", "vulnerability", "decline", "decrease", "warning", "issue"], baseStrength: 60 },
  { type: "market_signal", keywords: ["market", "industry", "sector", "demand", "adoption", "trend"], baseStrength: 65 },
  { type: "technology_signal", keywords: ["technology", "innovation", "breakthrough", "ai", "ml", "compute", "infrastructure"], baseStrength: 70 },
  { type: "demand_signal", keywords: ["demand", "interest", "growth in", "shortage", "waiting list"], baseStrength: 60 },
  { type: "supply_signal", keywords: ["supply", "capacity", "production", "manufacturing", "availability"], baseStrength: 55 },
  { type: "trust_signal", keywords: ["trust", "reputation", "transparency", "compliance", "regulation", "certified"], baseStrength: 50 },
  { type: "civilization_signal", keywords: ["policy", "regulation", "government", "law", "society", "climate", "impact"], baseStrength: 60 },
];

export function extractSignals(observation: Observation): Signal[] {
  const signals: Signal[] = [];
  const content = observation.raw_data as Record<string, unknown>;
  const textFields = Object.values(content).filter(v => typeof v === "string").join(" ").toLowerCase();

  for (const pattern of SIGNAL_PATTERNS) {
    const matched = pattern.keywords.filter(kw => textFields.includes(kw.toLowerCase()));
    if (matched.length > 0) {
      const strength = Math.min(100, pattern.baseStrength + matched.length * 5);
      const novelty = matched.length / pattern.keywords.length;
      signals.push({
        id: genId(),
        observation_id: observation.id,
        entity_id: observation.entity_id,
        signal_type: pattern.type,
        strength,
        novelty: Math.round(novelty * 100),
        urgency: strength > 75 ? 70 : strength > 60 ? 50 : 30,
        payload: { matched_keywords: matched, base_type: pattern.type },
        created_at: new Date().toISOString(),
      });
    }
  }

  // If no structured signals detected, create a generic observation signal
  if (signals.length === 0) {
    signals.push({
      id: genId(),
      observation_id: observation.id,
      entity_id: observation.entity_id,
      signal_type: "growth_signal",
      strength: 30,
      novelty: 50,
      urgency: 30,
      payload: { note: "generic observation" },
      created_at: new Date().toISOString(),
    });
  }

  return signals;
}
