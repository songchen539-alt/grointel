// GroIntel CRS-1 — Civilization Identity Factory
import { CivilizationIdentity } from "./civilization_types";

let idCounter = 0;
function genId(): string { return "civ_" + (++idCounter).toString(16).padStart(6, "0"); }

export class CivilizationIdentityFactory {
  create(name: string, capabilities: string[], domains: string[]): CivilizationIdentity {
    return {
      id: genId(), name, version: 1,
      capabilities, knowledge_domains: domains,
      trust_score: 70, health_status: "healthy",
      created_at: new Date().toISOString(),
    };
  }
}
