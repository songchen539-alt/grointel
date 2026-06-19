// GroIntel Cognitive Kernel — Observation Processor
// Converts RealityEvent into structured Observation
import { RealityEvent, Observation, SignalSource } from "../kernel_types";

let obsCounter = 0;
function genId(): string { return "obs_" + (++obsCounter).toString(16).padStart(6, "0"); }

export function processObservation(event: RealityEvent): Observation {
  const rawData = event.payload as Record<string, unknown> || {};
  const content = typeof rawData === "object" ? rawData : { value: rawData };

  const observation: Observation = {
    id: genId(),
    event_id: event.id,
    source: event.source,
    entity_id: (content.entity_id as string) || null,
    entity_type: (content.entity_type as any) || null,
    signal_type: deriveSignalType(event.type, content),
    raw_data: content,
    extracted_data: extractStructured(content),
    confidence: event.confidence,
    evidence_links: [],
    created_at: new Date().toISOString(),
  };

  return observation;
}

function deriveSignalType(eventType: string, content: Record<string, unknown>): string {
  if (eventType.includes("OBSERVATION")) return "direct_observation";
  if (eventType.includes("FEEDBACK")) return "feedback";
  if (eventType.includes("PREDICTION")) return "prediction_result";
  if (eventType.includes("CONTRADICTION")) return "contradiction";
  return (content.signal_type as string) || "unknown";
}

function extractStructured(raw: Record<string, unknown>): Record<string, unknown> {
  const extracted: Record<string, unknown> = {};
  const known = ["company_name", "amount", "headcount", "product_name", "market_name", "technology", "country", "industry", "url", "description", "event_type", "actor", "target"];
  for (const key of known) {
    if (raw[key] !== undefined) extracted[key] = raw[key];
  }
  return extracted;
}
