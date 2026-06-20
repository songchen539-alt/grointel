// GroIntel ROS-3 — Agent Registry
import { AgentDefinition } from "./agent_types";
import { REALITY_OBSERVER, KNOWLEDGE_CURATOR, OPPORTUNITY_HUNTER, RISK_SENTINEL, DECISION_ADVISOR } from "./agent_definitions";

export class AgentRegistry {
  private definitions: Map<string, AgentDefinition> = new Map();
  constructor() { this.initBuiltins(); }

  private initBuiltins(): void {
    for (const d of [REALITY_OBSERVER, KNOWLEDGE_CURATOR, OPPORTUNITY_HUNTER, RISK_SENTINEL, DECISION_ADVISOR]) {
      this.definitions.set(d.name, d);
    }
  }

  register(name: string, def: AgentDefinition): void {
    if (this.definitions.has(name)) throw new Error(`Agent '${name}' already registered`);
    this.definitions.set(name, def);
  }

  get(name: string): AgentDefinition | null { return this.definitions.get(name) || null; }
  getAll(): AgentDefinition[] { return Array.from(this.definitions.values()); }
  exists(name: string): boolean { return this.definitions.has(name); }
  count(): number { return this.definitions.size; }
}
