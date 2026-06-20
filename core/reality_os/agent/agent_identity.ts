// GroIntel ROS-3 — Agent Identity
import { AgentIdentity, AgentDefinition } from "./agent_types";

let idCounter = 0;
function genId(): string { return "ag_" + (++idCounter).toString(16).padStart(6, "0"); }

export class AgentIdentityFactory {
  create(def: AgentDefinition): AgentIdentity {
    return {
      id: genId(), name: def.name, version: 1, role: def.role,
      mission: def.mission, core_values: def.core_values,
      capabilities: def.capabilities,
      long_term_goals: def.long_term_goals,
      short_term_goals: def.short_term_goals,
      personality_profile: def.personality_profile,
      risk_policy: def.risk_policy,
      created_at: new Date().toISOString(),
    };
  }
}
