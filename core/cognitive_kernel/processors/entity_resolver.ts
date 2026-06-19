// GroIntel Cognitive Kernel — Entity Resolver
// Detects and normalizes entities from observations and signals
import { Observation, Entity, EntityType, Signal } from "../kernel_types";

let entCounter = 0;
function genId(): string { return "ent_" + (++entCounter).toString(16).padStart(6, "0"); }

export interface EntityResolutionResult {
  entities: Entity[];
  linkedEntityIds: string[];
  newEntityIds: string[];
}

export function resolveEntities(observation: Observation, signals: Signal[], existingEntities: Entity[]): EntityResolutionResult {
  const result: EntityResolutionResult = { entities: [], linkedEntityIds: [], newEntityIds: [] };
  const raw = observation.raw_data as Record<string, unknown>;
  const candidates = extractEntityCandidates(raw);

  for (const candidate of candidates) {
    const existing = existingEntities.find(e =>
      e.name.toLowerCase() === candidate.name.toLowerCase() || e.external_ids[candidate.type] === candidate.name
    );

    if (existing) {
      result.linkedEntityIds.push(existing.id);
      result.entities.push(existing);
    } else {
      const newEntity: Entity = {
        id: genId(),
        type: candidate.type,
        name: candidate.name,
        external_ids: {},
        attributes: candidate.attributes,
        capabilities: {},
        relationships: [],
        trust_score: 50,
        confidence: observation.confidence,
        first_observed_at: new Date().toISOString(),
        last_updated_at: new Date().toISOString(),
      };
      result.entities.push(newEntity);
      result.newEntityIds.push(newEntity.id);
    }
  }

  return result;
}

interface EntityCandidate {
  name: string;
  type: EntityType;
  attributes: Record<string, unknown>;
}

function extractEntityCandidates(raw: Record<string, unknown>): EntityCandidate[] {
  const candidates: EntityCandidate[] = [];

  if (raw.company_name) {
    candidates.push({ name: raw.company_name as string, type: "company", attributes: { industry: raw.industry, country: raw.country, url: raw.url } });
  }
  if (raw.creator_name || raw.actor) {
    candidates.push({ name: (raw.creator_name || raw.actor) as string, type: "creator", attributes: {} });
  }
  if (raw.product_name) {
    candidates.push({ name: raw.product_name as string, type: "software", attributes: { technology: raw.technology } });
  }
  if (raw.market_name) {
    candidates.push({ name: raw.market_name as string, type: "unknown", attributes: {} });
  }
  if (raw.industry) {
    candidates.push({ name: raw.industry as string, type: "unknown", attributes: { industry_type: raw.industry } });
  }
  if (raw.agency_name) {
    candidates.push({ name: raw.agency_name as string, type: "agency", attributes: {} });
  }
  if (raw.community_name) {
    candidates.push({ name: raw.community_name as string, type: "community", attributes: {} });
  }

  return candidates;
}
