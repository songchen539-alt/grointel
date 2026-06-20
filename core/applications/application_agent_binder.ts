// GroIntel APP-1 — Agent Binder
import { ApplicationAgentBinding } from "./application_types";
import { ApplicationManifest } from "./application_types";

const AGENT_MAP: Record<string, string> = {
  "Reality Observer": "reality_observer",
  "Knowledge Curator": "knowledge_curator",
  "Opportunity Hunter": "opportunity_hunter",
  "Risk Sentinel": "risk_sentinel",
  "Decision Advisor": "decision_advisor",
};

export class AgentBinder {
  bind(manifest: ApplicationManifest): ApplicationAgentBinding[] {
    return manifest.required_agents.map(agentName => ({
      agent_name: agentName,
      agent_id: AGENT_MAP[agentName] || "unknown",
      bound: !!AGENT_MAP[agentName],
    }));
  }
}
